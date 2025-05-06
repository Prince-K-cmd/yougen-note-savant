
import { useState, useEffect } from "react";
import { youtubeApi } from "@/services/api";
import { IVideoFormat, IDownloadRequest } from "@/types/api";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download } from "lucide-react";

interface DownloadDialogProps {
  videoId: string;
  videoTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DownloadDialog({ videoId, videoTitle, isOpen, onClose }: DownloadDialogProps) {
  const [formats, setFormats] = useState<IVideoFormat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"mp4" | "mp3">("mp4");
  const [selectedResolution, setSelectedResolution] = useState<"240" | "360" | "480" | "720" | "1080">("720");
  const [isDownloading, setIsDownloading] = useState(false);
  
  useEffect(() => {
    if (isOpen && videoId) {
      loadFormats();
    }
  }, [isOpen, videoId]);
  
  async function loadFormats() {
    setIsLoading(true);
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await youtubeApi.getVideoFormats(videoUrl);
      setFormats(response.formats);
      
      // Set default values
      const hasHighRes = response.formats.some(f => f.resolution === "720p");
      setSelectedResolution(hasHighRes ? "720" : "480");
    } catch (error) {
      console.error("Error loading video formats:", error);
      toast({
        title: "Error",
        description: "Could not load video format options",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleDownload() {
    setIsDownloading(true);
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const request: IDownloadRequest = {
        video_url: videoUrl,
        format: selectedFormat,
        resolution: selectedFormat === "mp4" ? selectedResolution : undefined
      };
      
      await youtubeApi.downloadVideo(request);
      
      toast({
        title: "Download Started",
        description: `Downloading "${videoTitle}" in ${selectedFormat}${selectedFormat === "mp4" ? ` (${selectedResolution}p)` : ""}`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error downloading video:", error);
      toast({
        title: "Download Failed",
        description: "Could not start the download",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Video</DialogTitle>
          <DialogDescription>
            Download "{videoTitle.length > 40 ? videoTitle.substring(0, 40) + '...' : videoTitle}"
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Format:</span>
              <Select 
                value={selectedFormat}
                onValueChange={(value: "mp4" | "mp3") => setSelectedFormat(value)}
                disabled={isDownloading}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Format</SelectLabel>
                    <SelectItem value="mp4">MP4 Video</SelectItem>
                    <SelectItem value="mp3">MP3 Audio</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {selectedFormat === "mp4" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Resolution:</span>
                <Select 
                  value={selectedResolution}
                  onValueChange={(value: "240" | "360" | "480" | "720" | "1080") => setSelectedResolution(value)}
                  disabled={isDownloading}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Resolution</SelectLabel>
                      <SelectItem value="240">240p</SelectItem>
                      <SelectItem value="360">360p</SelectItem>
                      <SelectItem value="480">480p</SelectItem>
                      <SelectItem value="720">720p HD</SelectItem>
                      <SelectItem value="1080">1080p Full HD</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDownloading}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={isLoading || isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
