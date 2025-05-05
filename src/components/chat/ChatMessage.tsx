
import { Message } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { SpeechButton } from '@/components/speech/SpeechButton';
import { useSpeech } from '@/hooks/useSpeech';

interface ChatMessageProps {
  message: Message;
  onTimestampClick?: () => void;
}

export function ChatMessage({ message, onTimestampClick }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { speak, stop, speaking } = useSpeech();
  
  const handleSpeakMessage = () => {
    if (speaking) {
      stop();
    } else {
      speak(message.content);
    }
  };

  return (
    <div 
      className={cn(
        "flex gap-3 py-4 px-4 group",
        isUser ? "bg-muted/50 rounded-lg" : ""
      )}
    >
      <Avatar className="h-8 w-8">
        {isUser ? (
          <AvatarFallback className="bg-brand-purple text-white">U</AvatarFallback>
        ) : (
          <>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-brand-teal text-white">AI</AvatarFallback>
          </>
        )}
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div className="font-medium">
            {isUser ? 'You' : 'AI Assistant'}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground invisible group-hover:visible">
            {message.videoTimestamp && (
              <button 
                className="flex items-center gap-1 hover:text-foreground"
                onClick={onTimestampClick}
              >
                <Clock className="h-3 w-3" />
                {message.videoTimestamp.formatted}
              </button>
            )}
            <span>
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            <SpeechButton 
              onClick={handleSpeakMessage}
              isActive={speaking}
              mode="speak"
              className="ml-2"
            />
          </div>
        </div>
        
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}
