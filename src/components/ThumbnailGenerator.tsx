import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Wand2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ThumbnailHistory } from "./ThumbnailHistory";

export const ThumbnailGenerator = () => {
  const [description, setDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState<string>("gaming");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: FileList) => {
    const newImages: string[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newImages.push(result);
        processedCount++;

        if (processedCount === Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024).length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
          toast.success(`${newImages.length} image(s) uploaded successfully`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    processFiles(files);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    processFiles(files);
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const ensureAspectAndSize = (src: string, ratio: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const target = ratio === "16:9" ? { w: 1280, h: 720 } : { w: 720, h: 1280 };
        const canvas = document.createElement("canvas");
        canvas.width = target.w;
        canvas.height = target.h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        const scale = Math.max(target.w / img.width, target.h / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const dx = (target.w - drawW) / 2;
        const dy = (target.h - drawH) / 2;
        ctx.drawImage(img, dx, dy, drawW, drawH);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Failed to process generated image"));
      img.src = src;
    });
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error("Please enter a video description");
      return;
    }

    setIsGenerating(true);
    setGeneratedThumbnail(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
        body: {
          description,
          imageUrls: uploadedImages,
          style,
          aspectRatio,
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const processed = await ensureAspectAndSize(data.imageUrl, aspectRatio);
        setGeneratedThumbnail(processed);
        
        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: dbError } = await supabase
            .from("thumbnail_history")
            .insert({
              user_id: user.id,
              description,
              style,
              aspect_ratio: aspectRatio,
              image_data: processed,
            });

          if (dbError) {
            console.error("Error saving thumbnail:", dbError);
          }
        }
        
        toast.success("Thumbnail generated successfully!");
        // Trigger history refresh by re-rendering
        window.dispatchEvent(new Event("thumbnail-saved"));
      } else {
        throw new Error("No image URL in response");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate thumbnail");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim() || !generatedThumbnail) {
      toast.error("Please enter edit instructions");
      return;
    }

    setIsEditing(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
        body: {
          description: editPrompt,
          imageUrls: [generatedThumbnail],
          style,
          aspectRatio,
          isEdit: true,
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const processed = await ensureAspectAndSize(data.imageUrl, aspectRatio);
        setGeneratedThumbnail(processed);
        setEditPrompt("");
        
        // Save edited thumbnail to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: dbError } = await supabase
            .from("thumbnail_history")
            .insert({
              user_id: user.id,
              description: `Edited: ${editPrompt}`,
              style,
              aspect_ratio: aspectRatio,
              image_data: processed,
            });

          if (dbError) {
            console.error("Error saving thumbnail:", dbError);
          }
        }
        
        toast.success("Thumbnail updated successfully!");
        window.dispatchEvent(new Event("thumbnail-saved"));
      } else {
        throw new Error("No image URL in response");
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to edit thumbnail");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownload = () => {
    if (!generatedThumbnail) return;

    const link = document.createElement("a");
    link.href = generatedThumbnail;
    link.download = `youtube-thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Thumbnail downloaded!");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6">
        <Card className="p-6 bg-card shadow-[var(--shadow-card)] border-border">
          <div className="space-y-4">
            <div>
              <Label htmlFor="description" className="text-base font-semibold">
                Video Description
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Describe your video and what you want in the thumbnail
              </p>
              <Textarea
                id="description"
                placeholder="Example: A tech review video about the latest smartphone. Show the phone with dramatic lighting, bold text saying 'BEST PHONE 2024', vibrant background with tech elements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[160px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="image-upload" className="text-base font-semibold">
                Upload Images (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Add multiple images to merge into your thumbnail
              </p>
              <div 
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
                  isDragging 
                    ? "border-primary bg-primary/5" 
                    : "border-border bg-muted/20 hover:border-primary/50"
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <Upload className={`h-10 w-10 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium mb-1">
                      {isDragging ? "Drop images here" : "Drag & drop images here"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">or</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      type="button"
                    >
                      Browse Files
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {uploadedImages.length > 0 ? `${uploadedImages.length} image(s) uploaded` : "Max 5MB per image"}
                  </p>
                </div>
              </div>
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border border-border group">
                      <img
                        src={img}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        type="button"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="style" className="text-base font-semibold">
                Thumbnail Style
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Choose a preset style for your thumbnail
              </p>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="vlog">Vlog</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="aspect-ratio" className="text-base font-semibold">
                Aspect Ratio
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Choose the format for your thumbnail
              </p>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-semibold">Format Preview</Label>
              <p className="text-sm text-muted-foreground mb-3">A live preview of the selected aspect ratio</p>
              <div className={`${aspectRatio === "16:9" ? "aspect-video" : "aspect-[9/16]"} w-full bg-muted/50 border-2 border-dashed border-border rounded-lg flex items-center justify-center`}>
                <span className="text-xs text-muted-foreground">{aspectRatio} {aspectRatio === "16:9" ? "(1280x720)" : "(720x1280)"}</span>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)] transition-all"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Thumbnail
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6 bg-card shadow-[var(--shadow-card)] border-border">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Generated Thumbnail</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Your AI-generated thumbnail will appear here
              </p>
            </div>

            <div className={`${aspectRatio === "16:9" ? "aspect-video" : "aspect-[9/16]"} bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center`}>
              {generatedThumbnail ? (
                <img
                  src={generatedThumbnail}
                  alt="Generated thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <Wand2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {isGenerating
                      ? "Creating your thumbnail..."
                      : "Your thumbnail will appear here"}
                  </p>
                </div>
              )}
            </div>

            {generatedThumbnail && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="edit-prompt" className="text-base font-semibold">
                    Edit with AI
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Describe changes you want to make to this thumbnail
                  </p>
                  <Textarea
                    id="edit-prompt"
                    placeholder="Example: Make the background more vibrant, add a glow effect to the text, change the lighting to sunset..."
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <Button
                    onClick={handleEdit}
                    disabled={isEditing || !editPrompt.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isEditing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Editing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-5 w-5" />
                        Edit Thumbnail
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Thumbnail
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <ThumbnailHistory />
      </div>
    </div>
  );
};
