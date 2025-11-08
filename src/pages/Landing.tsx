import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Youtube, Wand2, Image, Sparkles, Zap, ArrowRight, Play, Eye, TrendingUp, Stars, Palette, MousePointer2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState<string>("gaming");
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [stats, setStats] = useState({ thumbnails: 0, users: 0, views: 0 });

  // Animated statistics
  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        setStats({
          thumbnails: Math.floor(10000 * progress),
          users: Math.floor(1500 * progress),
          views: Math.floor(500000 * progress),
        });

        if (currentStep >= steps) clearInterval(timer);
      }, interval);

      return () => clearInterval(timer);
    };

    animateStats();
  }, []);

  const thumbnailStyles = [
    { id: "gaming", name: "Gaming", color: "from-purple-500 to-pink-500", icon: "🎮" },
    { id: "tech", name: "Tech", color: "from-blue-500 to-cyan-500", icon: "💻" },
    { id: "vlog", name: "Vlog", color: "from-orange-500 to-red-500", icon: "📹" },
    { id: "tutorial", name: "Tutorial", color: "from-green-500 to-emerald-500", icon: "📚" },
  ];

  const features = [
    {
      icon: Wand2,
      title: "AI-Powered Generation",
      description: "Advanced AI creates stunning, click-worthy thumbnails in seconds using Google Gemini image generation."
    },
    {
      icon: Image,
      title: "Multi-Image Merging",
      description: "Upload and combine multiple images seamlessly. AI intelligently blends them into one perfect thumbnail."
    },
    {
      icon: Sparkles,
      title: "Multiple Styles",
      description: "Choose from Gaming, Tech, Vlog, or Tutorial styles. Each optimized for maximum engagement."
    },
    {
      icon: Zap,
      title: "Flexible Formats",
      description: "Generate in 16:9 landscape or 9:16 portrait. Perfect for YouTube, Shorts, and social media."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Describe Your Video",
      description: "Tell the AI what your video is about and what you want in the thumbnail"
    },
    {
      number: "02",
      title: "Upload Images (Optional)",
      description: "Add your own images for the AI to merge and enhance"
    },
    {
      number: "03",
      title: "Choose Style & Format",
      description: "Select from preset styles and aspect ratios"
    },
    {
      number: "04",
      title: "Generate & Download",
      description: "AI creates your thumbnail in seconds. Edit with AI if needed, then download"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-3xl shadow-[var(--shadow-glow)] animate-in fade-in duration-500">
                <Youtube className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent animate-in slide-in-from-bottom duration-700">
              Create Stunning YouTube Thumbnails with AI
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in slide-in-from-bottom duration-700 delay-100">
              Generate hyper-realistic, click-worthy thumbnails in seconds. Just describe your video, and let AI do the magic.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom duration-700 delay-200">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)] transition-all text-lg px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>

            {/* Interactive Style Selector */}
            <div className="mt-16 space-y-6 animate-in fade-in duration-1000 delay-300">
              <div className="flex items-center justify-center gap-2 mb-6">
                <MousePointer2 className="h-5 w-5 text-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">Click to preview different styles</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {thumbnailStyles.map((style) => (
                  <Button
                    key={style.id}
                    variant={selectedStyle === style.id ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`transition-all duration-300 hover:scale-105 ${
                      selectedStyle === style.id 
                        ? `bg-gradient-to-r ${style.color} text-white border-none shadow-lg` 
                        : ""
                    }`}
                  >
                    <span className="mr-2 text-xl">{style.icon}</span>
                    {style.name}
                  </Button>
                ))}
              </div>

              <div className="relative mx-auto max-w-3xl">
                <div className={`absolute -inset-4 bg-gradient-to-r ${
                  thumbnailStyles.find(s => s.id === selectedStyle)?.color
                } opacity-20 rounded-2xl blur-2xl transition-all duration-500`} />
                
                <Card className="relative overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-2xl group">
                  <div className={`aspect-video bg-gradient-to-br ${
                    thumbnailStyles.find(s => s.id === selectedStyle)?.color
                  } opacity-20 relative transition-all duration-500`}>
                    <div className="absolute inset-0 flex items-center justify-center text-center space-y-4 p-8">
                      <div className="space-y-4 transform group-hover:scale-105 transition-transform duration-300">
                        <div className="text-6xl animate-bounce">
                          {thumbnailStyles.find(s => s.id === selectedStyle)?.icon}
                        </div>
                        <div className={`text-4xl font-bold bg-gradient-to-r ${
                          thumbnailStyles.find(s => s.id === selectedStyle)?.color
                        } bg-clip-text text-transparent`}>
                          {thumbnailStyles.find(s => s.id === selectedStyle)?.name} Style
                        </div>
                        <p className="text-lg text-muted-foreground">Interactive thumbnail preview</p>
                        <Badge variant="secondary" className="text-sm">
                          <Sparkles className="mr-1 h-3 w-3" />
                          AI Generated
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Live Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2 p-4 rounded-lg bg-card/50 backdrop-blur border border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stats.thumbnails.toLocaleString()}+
                </div>
                <p className="text-sm text-muted-foreground">Thumbnails Created</p>
              </div>
              <div className="text-center space-y-2 p-4 rounded-lg bg-card/50 backdrop-blur border border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stats.users.toLocaleString()}+
                </div>
                <p className="text-sm text-muted-foreground">Happy Creators</p>
              </div>
              <div className="text-center space-y-2 p-4 rounded-lg bg-card/50 backdrop-blur border border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stats.views.toLocaleString()}+
                </div>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create professional YouTube thumbnails
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`p-6 bg-card transition-all duration-300 border-border cursor-pointer group ${
                  hoveredFeature === index 
                    ? "shadow-2xl -translate-y-2 border-primary scale-105" 
                    : "hover:shadow-[var(--shadow-card)] hover:-translate-y-1"
                }`}
              >
                <div className={`mb-4 transition-all duration-300 ${
                  hoveredFeature === index ? "animate-bounce" : ""
                }`}>
                  <feature.icon className={`h-12 w-12 transition-colors duration-300 ${
                    hoveredFeature === index ? "text-primary scale-125" : "text-primary"
                  }`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
                {hoveredFeature === index && (
                  <Badge variant="secondary" className="mt-4 animate-in fade-in duration-300">
                    <Stars className="mr-1 h-3 w-3" />
                    Click to learn more
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create professional thumbnails in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative group hover:scale-105 transition-all duration-300"
              >
                <Card className="p-6 space-y-4 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur h-full">
                  <div className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Badge variant="outline" className="text-xs">
                      <Play className="mr-1 h-3 w-3" />
                      Step {index + 1}
                    </Badge>
                  </div>
                </Card>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-12 -right-4 h-8 w-8 text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-float">
            <Youtube className="h-12 w-12 text-primary/20" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
            <Sparkles className="h-16 w-16 text-primary/20" />
          </div>
          <div className="absolute top-1/2 right-20 animate-float" style={{ animationDelay: '2s' }}>
            <Palette className="h-10 w-10 text-primary/20" />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Card className="max-w-4xl mx-auto p-12 text-center bg-card/50 backdrop-blur border-2 border-border hover:border-primary transition-all duration-500 hover:shadow-2xl group">
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Free to Start
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <Eye className="mr-1 h-4 w-4" />
                  No Design Skills Needed
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <Zap className="mr-1 h-4 w-4" />
                  AI-Powered
                </Badge>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 group-hover:scale-105 transition-transform duration-300">
                Ready to Create Amazing Thumbnails?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are generating stunning YouTube thumbnails with AI. Start creating in seconds!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)] transition-all text-lg px-12 py-6 hover:scale-105"
                >
                  Start Creating Now
                  <Wand2 className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-lg px-12 py-6 hover:scale-105"
                >
                  View Examples
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                <Youtube className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">YouTube Thumbnail Maker</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © Created and Developed by Narayan • Generate creative thumbnails in seconds
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
