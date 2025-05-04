
import { useState } from "react";
import { VideoPlayer } from "@/components/youtube/VideoPlayer";
import { VideoHeader } from "./VideoHeader";
import { VideoDescription } from "./VideoDescription";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { Separator } from "@/components/ui/separator";
import { VideoMetadata } from "@/types/youtube";

interface VideoSectionProps {
  videoId: string;
  videoData: VideoMetadata;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSaveNote: (note: { title: string; content: string; richContent?: string; videoTimestamp?: { seconds: number; formatted: string } }) => void;
}

export function VideoSection({ 
  videoId, 
  videoData, 
  currentTime, 
  onTimeUpdate, 
  onSaveNote 
}: VideoSectionProps) {
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  
  const handleNoteCreation = (note: { 
    title: string;
    content: string;
    richContent?: string;
    videoTimestamp?: { seconds: number; formatted: string };
  }) => {
    onSaveNote(note);
    setIsCreatingNote(false);
  };

  return (
    <div className="lg:col-span-2 space-y-4">
      <VideoPlayer
        videoId={videoId}
        onTimeUpdate={onTimeUpdate}
        onReady={() => console.log("Video ready")}
      />
      
      <VideoHeader 
        videoData={videoData} 
        onTakeNote={() => setIsCreatingNote(true)}
      />

      {isCreatingNote && (
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-medium mb-2">Create a Note</h3>
          <NoteEditor
            currentVideoTime={currentTime}
            onSave={handleNoteCreation}
            onCancel={() => setIsCreatingNote(false)}
          />
        </div>
      )}

      <Separator className="my-6" />
      
      <VideoDescription description={videoData.description} />
    </div>
  );
}
