import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ThumbnailGenerator } from "@/components/ThumbnailGenerator";
import { Youtube } from "lucide-react";
import type { User, Session } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-[var(--shadow-glow)]">
              <Youtube className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            YouTube Thumbnail Maker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create stunning, hyper-realistic YouTube thumbnails with AI. 
            Describe your video, upload an image, and let AI do the magic.
          </p>
        </header>

        <ThumbnailGenerator />

        <footer className="text-center mt-16 text-sm text-muted-foreground">
          <p>© Created and Developed by Narayan • Generate creative thumbnails in seconds</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
