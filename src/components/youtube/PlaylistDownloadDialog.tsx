
import { useState } from "react";
import { youtubeApi } from "@/services/api";
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
import { Progress } from "@/components/ui/progress";
import { Loader2, Download } from "lucide-react";

interface PlaylistDownloadDialogProps {
  playlistId: string;
  playlistTitle: string;
  isOpen: boolean;
  onClose: () => void;
  downloadProgress?: {
    taskId: string;
    completed: number;
    failed: number;
    total: number;
    percentage: number;
    currentVideo?: string;
  };
  isDownloading: boolean;
  onStartDownload: (format: "mp3" | "mp4", resolution?: string) => void;
}

export function PlaylistDownloadDialog({ 
  playlistId, 
  playlistTitle, 
  isOpen, 
  onClose,
  downloadProgress,
  isDownloading,
  onStartDownload
}: PlaylistDownloadDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<"mp4" | "mp3">("mp4");
  const [selectedResolution, setSelectedResolution] = useState<string>("720");
  
  function handleDownload() {
    onStartDownload(
      selectedFormat, 
      selectedFormat === "mp4" ? selectedResolution : undefined
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDownloading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Playlist</DialogTitle>
          <DialogDescription>
            Download "{playlistTitle.length > 40 ? playlistTitle.substring(0, 40) + '...' : playlistTitle}"
          </DialogDescription>
        </DialogHeader>
        
        {isDownloading && downloadProgress ? (
          <div className="space-y-4 py-4">
            <Progress value={downloadProgress.percentage} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {downloadProgress.completed + downloadProgress.failed} of {downloadProgress.total} videos
              </span>
              <span>{downloadProgress.percentage}%</span>
            </div>
            {downloadProgress.currentVideo && (
              <p className="text-sm mt-2 text-muted-foreground">
                Currently downloading: {downloadProgress.currentVideo.length > 40 ? 
                  downloadProgress.currentVideo.substring(0, 40) + '...' : 
                  downloadProgress.currentVideo}
              </p>
            )}
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
                  onValueChange={setSelectedResolution}
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
            
            <div className="text-sm text-muted-foreground pt-2">
              This will download all videos in the playlist with the selected settings.
              The download will continue in the background even if you close this dialog.
            </div>
          </div>
        )}
        
        <DialogFooter>
          {!isDownloading ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
