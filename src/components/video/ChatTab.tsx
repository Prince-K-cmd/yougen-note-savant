
import { MessageSquare } from "lucide-react";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Message } from "@/types/chat";

interface ChatTabProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onTimestampClick: (seconds: number) => void;
}

export function ChatTab({
  messages,
  isLoading,
  onSendMessage,
  onTimestampClick
}: ChatTabProps) {
  return (
    <>
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
      
      <div className="p-4 border-t">
        <ChatInput 
          onSend={onSendMessage} 
          isLoading={isLoading}
          placeholder="Ask about this video..."
        />
      </div>
    </>
  );
}
