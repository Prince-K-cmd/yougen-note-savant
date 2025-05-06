
import { useState } from "react";
import { VideoPlayer } from "@/components/youtube/VideoPlayer";
import { VideoHeader } from "./VideoHeader";
import { VideoDescription } from "./VideoDescription";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { Separator } from "@/components/ui/separator";
import { VideoMetadata } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DownloadDialog } from "@/components/youtube/DownloadDialog";

interface VideoSectionProps {
  videoId: string;
  videoData: VideoMetadata;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSaveNote: (note: { title: string; content: string; richContent?: string; videoTimestamp?: { seconds: number; formatted: string } }) => void;
  isCreatingNote: boolean;
  onCreateNoteToggle: (isCreating: boolean) => void;
  isLoading?: boolean;
}

export function VideoSection({ 
  videoId, 
  videoData, 
  currentTime, 
  onTimeUpdate, 
  onSaveNote,
  isCreatingNote,
  onCreateNoteToggle,
  isLoading = false
}: VideoSectionProps) {
  
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  
  const handleNoteCreation = (note: { 
    title: string;
    content: string;
    richContent?: string;
    videoTimestamp?: { seconds: number; formatted: string };
  }) => {
    onSaveNote(note);
    onCreateNoteToggle(false);
  };

  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="relative">
        <VideoPlayer
          videoId={videoId}
          onTimeUpdate={onTimeUpdate}
          onReady={() => console.log("Video ready")}
        />
        
        {/* Download button overlay */}
        <div className="absolute top-3 right-3 z-10">
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-black/60 hover:bg-black/80 text-white"
            onClick={() => setShowDownloadDialog(true)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
      
      <VideoHeader 
        videoData={videoData} 
        onTakeNote={() => onCreateNoteToggle(true)}
      />

      {isCreatingNote && (
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-medium mb-2">Create a Note</h3>
          <NoteEditor
            currentVideoTime={currentTime}
            onSave={handleNoteCreation}
            onCancel={() => onCreateNoteToggle(false)}
          />
        </div>
      )}

      <Separator className="my-6" />
      
      <VideoDescription description={videoData.description} />
      
      {/* Download Dialog */}
      <DownloadDialog 
        videoId={videoId}
        videoTitle={videoData.title}
        isOpen={showDownloadDialog}
        onClose={() => setShowDownloadDialog(false)}
      />
    </div>
  );
}
