import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, imageUrls = [], style = "gaming", aspectRatio = "16:9", isEdit = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating thumbnail with description:", description);
    console.log("Number of images provided:", imageUrls.length);
    console.log("Style:", style);
    console.log("Aspect Ratio:", aspectRatio);

    // Style-specific prompts
    const stylePrompts: Record<string, string> = {
      gaming: "vibrant neon colors, energetic action scenes, dramatic character poses, bold typography with glow effects, futuristic or intense atmosphere",
      tech: "clean modern design, sleek gadgets, minimalist composition, professional look, cool blues and whites, sharp edges and geometric shapes",
      vlog: "bright and warm colors, friendly and approachable feel, lifestyle aesthetic, natural lighting, casual but polished presentation",
      tutorial: "clear and informative layout, step-by-step visual cues, professional but accessible, arrows or numbered elements, organized composition"
    };

    const styleGuidance = stylePrompts[style] || stylePrompts.gaming;

    // Determine image dimensions based on aspect ratio
    const dimensionGuidance = aspectRatio === "16:9" 
      ? "CRITICAL: Create a HORIZONTAL/LANDSCAPE image with 16:9 aspect ratio (1280x720 pixels). The image MUST be wider than it is tall."
      : "CRITICAL: Create a VERTICAL/PORTRAIT image with 9:16 aspect ratio (720x1280 pixels). The image MUST be taller than it is wide.";

    // Construct the prompt for nano banana
    const systemPrompt = `You are an expert YouTube thumbnail designer. Create hyper-realistic, eye-catching, and creative thumbnails that maximize click-through rates. 

${dimensionGuidance}

Key requirements:
- Make it visually striking with bold colors and high contrast
- Include engaging text overlays if relevant
- Use dramatic lighting and composition
- Make it look professional and polished
- Style: ${styleGuidance}
- IMPORTANT: Respect the ${aspectRatio} aspect ratio - ${aspectRatio === "16:9" ? "LANDSCAPE/HORIZONTAL orientation" : "PORTRAIT/VERTICAL orientation"}`;

    const userPrompt = isEdit
      ? `Edit this thumbnail with the following changes: ${description}. Keep the ${aspectRatio} format and maintain the overall composition while applying these modifications.`
      : imageUrls.length > 0
      ? `Create a ${aspectRatio === "16:9" ? "LANDSCAPE (wider than tall)" : "PORTRAIT (taller than wide)"} ${style} style YouTube thumbnail based on this description: ${description}. Use the provided ${imageUrls.length} image(s) and merge/enhance them creatively to make an attention-grabbing thumbnail. The final image MUST be in ${aspectRatio} format.`
      : `Create a ${aspectRatio === "16:9" ? "LANDSCAPE (wider than tall)" : "PORTRAIT (taller than wide)"} ${style} style YouTube thumbnail for a video about: ${description}. Make it creative, hyper-realistic, and optimized for maximum engagement. The final image MUST be in ${aspectRatio} format.`;

    // Prepare the messages array
    const userContent: any[] = [{ type: "text", text: userPrompt }];
    
    // Add all uploaded images to the content array
    imageUrls.forEach((imageUrl: string) => {
      userContent.push({ type: "image_url", image_url: { url: imageUrl } });
    });

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: imageUrls.length > 0 ? userContent : userPrompt
      }
    ];

    console.log("Calling Lovable AI Gateway with nano banana model...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages,
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Received response from AI Gateway");

    // Extract the generated image from the response
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated in response");
    }

    console.log("Successfully generated thumbnail");

    return new Response(
      JSON.stringify({ 
        imageUrl: generatedImage,
        message: "Thumbnail generated successfully"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in generate-thumbnail:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
