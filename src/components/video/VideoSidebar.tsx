
import { VideoTabs } from "./VideoTabs";
import { Message } from "@/types/chat";
import { Note } from "@/types/note";
import { TranscriptSegment } from "@/components/transcripts/TranscriptViewer";

interface VideoSidebarProps {
  videoId: string;
  messages: Message[];
  notes: Note[];
  transcript: TranscriptSegment[];
  isLoading: boolean;
  isLoadingTranscript: boolean;
  onSendMessage: (content: string) => void;
  onTimestampClick: (seconds: number) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateNote: () => void;
  onPinNote?: (noteId: string, pinned: boolean) => void;
}

export function VideoSidebar(props: VideoSidebarProps) {
  return (
    <div className="h-[calc(100vh-16rem)] flex flex-col">
      <VideoTabs {...props} />
    </div>
  );
}
