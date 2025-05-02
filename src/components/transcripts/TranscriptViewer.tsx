
import { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptViewerProps {
  videoId: string;
  transcript: TranscriptSegment[];
  onSegmentClick: (startTime: number) => void;
  isLoading?: boolean;
}

export function TranscriptViewer({ 
  videoId, 
  transcript, 
  onSegmentClick, 
  isLoading = false 
}: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTranscript, setFilteredTranscript] = useState<TranscriptSegment[]>(transcript);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTranscript(transcript);
      return;
    }

    const filtered = transcript.filter(segment => 
      segment.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTranscript(filtered);
  }, [searchQuery, transcript]);

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transcript..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <ScrollArea className="flex-1 mt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          </div>
        ) : filteredTranscript.length > 0 ? (
          <div className="space-y-1 p-1">
            {filteredTranscript.map((segment) => (
              <Button
                key={segment.id}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => onSegmentClick(segment.startTime)}
              >
                <span className="text-muted-foreground mr-2 min-w-[40px]">
                  {formatTimestamp(segment.startTime)}
                </span>
                <span className="line-clamp-2">{segment.text}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-muted-foreground">
              {transcript.length === 0 ? "No transcript available for this video." : "No matches found."}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
