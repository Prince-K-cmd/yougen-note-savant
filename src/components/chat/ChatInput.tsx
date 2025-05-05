
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { SpeechButton } from '@/components/speech/SpeechButton';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSend, 
  isLoading = false, 
  disabled = false,
  placeholder = "Ask a question about this video..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { 
    startListening, 
    stopListening, 
    transcript, 
    interimTranscript, 
    isListening, 
    supported 
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true
  });

  useEffect(() => {
    if (transcript) {
      setMessage(prev => prev + transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage('');
      
      // Stop listening if active
      if (isListening) {
        stopListening();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border rounded-lg overflow-hidden flex items-end bg-background"
    >
      <div className="flex-1 flex flex-col">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isLoading || disabled}
          onKeyDown={handleKeyDown}
        />
        {interimTranscript && (
          <div className="px-3 pb-1 text-xs italic text-muted-foreground">
            {interimTranscript}
          </div>
        )}
      </div>
      <div className="p-2 flex items-center gap-1">
        {supported && (
          <SpeechButton 
            onClick={toggleListening} 
            isActive={isListening} 
            mode="listen"
          />
        )}
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || isLoading || disabled}
          className={cn("rounded-full h-8 w-8", isListening && "bg-brand-purple")}
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}
