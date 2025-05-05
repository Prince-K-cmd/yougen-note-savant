
import { TranscriptViewer, TranscriptSegment } from "@/components/transcripts/TranscriptViewer";

interface TranscriptTabProps {
  videoId: string;
  transcript: TranscriptSegment[];
  onSegmentClick: (seconds: number) => void;
  isLoading: boolean;
}

export function TranscriptTab({
  videoId,
  transcript,
  onSegmentClick,
  isLoading
}: TranscriptTabProps) {
  return (
    <div className="p-4 h-full">
      <TranscriptViewer
        videoId={videoId}
        transcript={transcript}
        onSegmentClick={onSegmentClick}
        isLoading={isLoading}
      />
    </div>
  );
}
