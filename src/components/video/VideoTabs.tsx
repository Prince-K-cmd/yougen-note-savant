
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText } from "lucide-react";
import { Message } from "@/types/chat";
import { Note } from "@/types/note";
import { TranscriptSegment } from "@/components/transcripts/TranscriptViewer";
import { NotesTab } from "./NotesTab";
import { ChatTab } from "./ChatTab";
import { TranscriptTab } from "./TranscriptTab";

interface VideoTabsProps {
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

export function VideoTabs({
  videoId,
  messages,
  notes,
  transcript,
  isLoading,
  isLoadingTranscript,
  onSendMessage,
  onTimestampClick,
  onDeleteNote,
  onCreateNote,
  onPinNote
}: VideoTabsProps) {
  const [activeTab, setActiveTab] = useState("chat");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="chat" className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>Chat</span>
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>Notes</span>
        </TabsTrigger>
        <TabsTrigger value="transcript" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>Transcript</span>
        </TabsTrigger>
      </TabsList>
      
      {/* Chat Tab */}
      <TabsContent value="chat" className="flex-1 flex flex-col h-full">
        <ChatTab 
          messages={messages} 
          isLoading={isLoading} 
          onSendMessage={onSendMessage} 
          onTimestampClick={onTimestampClick} 
        />
      </TabsContent>
      
      {/* Notes Tab */}
      <TabsContent value="notes" className="flex-1 flex flex-col h-full">
        <NotesTab 
          notes={notes} 
          onCreateNote={onCreateNote} 
          onDeleteNote={onDeleteNote} 
          onTimestampClick={onTimestampClick}
          onPinNote={onPinNote}
        />
      </TabsContent>
      
      {/* Transcript Tab */}
      <TabsContent value="transcript" className="flex-1 flex flex-col h-full">
        <TranscriptTab 
          videoId={videoId} 
          transcript={transcript} 
          onSegmentClick={onTimestampClick} 
          isLoading={isLoadingTranscript} 
        />
      </TabsContent>
    </Tabs>
  );
}
