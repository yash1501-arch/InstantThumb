import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ThumbnailHistoryItem {
  id: string;
  description: string;
  style: string;
  aspect_ratio: string;
  image_data: string;
  created_at: string;
}

export const ThumbnailHistory = () => {
  const [history, setHistory] = useState<ThumbnailHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    
    // Listen for new thumbnails being saved
    const handleThumbnailSaved = () => {
      loadHistory();
    };
    
    window.addEventListener("thumbnail-saved", handleThumbnailSaved);
    
    return () => {
      window.removeEventListener("thumbnail-saved", handleThumbnailSaved);
    };
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("thumbnail_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load thumbnail history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageData: string, id: string) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `thumbnail-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Thumbnail downloaded!");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("thumbnail_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setHistory(history.filter((item) => item.id !== id));
      toast.success("Thumbnail deleted");
    } catch (error) {
      console.error("Error deleting thumbnail:", error);
      toast.error("Failed to delete thumbnail");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-card shadow-[var(--shadow-card)] border-border">
        <Label className="text-base font-semibold">Loading history...</Label>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-6 bg-card shadow-[var(--shadow-card)] border-border">
        <Label className="text-base font-semibold">Thumbnail History</Label>
        <p className="text-sm text-muted-foreground mt-2">
          Your generated thumbnails will appear here
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card shadow-[var(--shadow-card)] border-border">
      <Label className="text-base font-semibold mb-4 block">Thumbnail History</Label>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="border border-border rounded-lg p-3 space-y-2"
          >
            <img
              src={item.image_data}
              alt={item.description}
              className={`w-full ${
                item.aspect_ratio === "16:9" ? "aspect-video" : "aspect-[9/16]"
              } object-cover rounded`}
            />
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-muted rounded">{item.style}</span>
              <span className="px-2 py-1 bg-muted rounded">{item.aspect_ratio}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(item.image_data, item.id)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
