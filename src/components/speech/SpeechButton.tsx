
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume1, Volume2, VolumeX } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SpeechButtonProps {
  onClick: () => void;
  isActive: boolean;
  mode: 'listen' | 'speak';
  className?: string;
  disabled?: boolean;
}

export function SpeechButton({
  onClick,
  isActive,
  mode,
  className,
  disabled = false
}: SpeechButtonProps) {
  const tooltipText = mode === 'listen' 
    ? (isActive ? 'Stop listening' : 'Start listening') 
    : (isActive ? 'Stop speaking' : 'Read aloud');
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={cn("h-8 px-2 text-xs", className)}
            onClick={onClick}
            disabled={disabled}
          >
            {mode === 'listen' ? (
              isActive ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />
            ) : (
              isActive ? <VolumeX className="h-4 w-4 text-destructive" /> : <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
