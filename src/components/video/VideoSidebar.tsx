
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText as NoteIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { NoteCard } from "@/components/notes/NoteCard";
import { Message } from "@/types/chat";
import { Note } from "@/types/note";
import { TranscriptViewer, TranscriptSegment } from "@/components/transcripts/TranscriptViewer";

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
}

export function VideoSidebar({
  videoId,
  messages,
  notes,
  transcript,
  isLoading,
  isLoadingTranscript,
  onSendMessage,
  onTimestampClick,
  onDeleteNote,
  onCreateNote
}: VideoSidebarProps) {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="h-[calc(100vh-16rem)] flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1">
            <NoteIcon className="h-4 w-4" />
            <span>Notes</span>
          </TabsTrigger>
          <TabsTrigger value="transcript" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Transcript</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No messages yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a conversation about this video with our AI assistant.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {messages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    onTimestampClick={message.videoTimestamp ? () => onTimestampClick(message.videoTimestamp!.seconds) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 mt-auto">
            <ChatInput 
              onSend={onSendMessage} 
              isLoading={isLoading}
              placeholder="Ask about this video..."
            />
          </div>
        </TabsContent>
        
        {/* Notes Tab */}
        <TabsContent value="notes" className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <h3 className="font-medium">Your Notes</h3>
            <Button size="sm" onClick={onCreateNote}>
              New Note
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-3">
            {notes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <NoteIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No notes yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create notes to save important information from this video.
                </p>
              </div>
            ) : (
              notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={() => onDeleteNote(note.id)}
                  onTimestampClick={note.videoTimestamp ? () => onTimestampClick(note.videoTimestamp!.seconds) : undefined}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Transcript Tab */}
        <TabsContent value="transcript" className="flex-1 flex flex-col h-full overflow-hidden">
          <TranscriptViewer
            videoId={videoId}
            transcript={transcript}
            onSegmentClick={onTimestampClick}
            isLoading={isLoadingTranscript}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
