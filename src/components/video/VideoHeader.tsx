
import { VideoMetadata } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { Video, FileText as NoteIcon } from "lucide-react";

interface VideoHeaderProps {
  videoData: VideoMetadata;
  onTakeNote: () => void;
}

export function VideoHeader({ videoData, onTakeNote }: VideoHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{videoData.title}</h2>
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-muted-foreground">{videoData.channelTitle}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={onTakeNote}>
            <NoteIcon className="h-4 w-4 mr-1" />
            Take Note
          </Button>
        </div>
      </div>
    </div>
  );
}
