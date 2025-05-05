
import { Note } from '@/types/note';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash2, Pin, PinOff } from 'lucide-react';
import { RichTextEditor } from './editor';
import { useState } from 'react';
import { SpeechButton } from '@/components/speech/SpeechButton';

interface NoteCardProps {
  note: Note;
  onEdit?: () => void;
  onDelete?: () => void;
  onTimestampClick?: () => void;
  onPin?: (noteId: string, pinned: boolean) => void;
}

// Array of background colors for notes
const noteColors = [
  "bg-blue-50 dark:bg-blue-900/20",
  "bg-green-50 dark:bg-green-900/20",
  "bg-yellow-50 dark:bg-yellow-900/20", 
  "bg-pink-50 dark:bg-pink-900/20",
  "bg-purple-50 dark:bg-purple-900/20",
  "bg-orange-50 dark:bg-orange-900/20",
  "bg-teal-50 dark:bg-teal-900/20",
  "bg-indigo-50 dark:bg-indigo-900/20",
];

export function NoteCard({ note, onEdit, onDelete, onTimestampClick, onPin }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Use the note's color if it exists, otherwise generate a consistent one based on note id
  const noteColor = note.color || noteColors[Math.abs(note.id.charCodeAt(0) + note.id.charCodeAt(1)) % noteColors.length];
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const displayContent = note.richContent || note.content;
  
  const handleSpeakNote = () => {
    // Toggle speech
    if (!isSpeaking) {
      const speech = new SpeechSynthesisUtterance(note.title + '. ' + (note.rawContent || note.content));
      speech.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(speech);
      setIsSpeaking(true);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  const handlePinToggle = () => {
    if (onPin) {
      onPin(note.id, !note.pinned);
    }
  };
  
  return (
    <Card className={`overflow-hidden shadow-md transition-all hover:shadow-lg ${noteColor} ${note.pinned ? 'border-2 border-primary' : ''}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base line-clamp-1 cursor-pointer" onClick={toggleExpand}>
          {note.title}
        </CardTitle>
        {onPin && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={handlePinToggle}
            title={note.pinned ? "Unpin note" : "Pin note"}
          >
            {note.pinned ? (
              <Pin className="h-3.5 w-3.5 fill-primary text-primary" />
            ) : (
              <Pin className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        {expanded ? (
          <div className="w-full">
            <RichTextEditor 
              content={displayContent} 
              onChange={() => {}} 
              editable={false} 
              minHeight="auto"
            />
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={toggleExpand}
            >
              Show less
            </Button>
          </div>
        ) : (
          <div 
            className="text-sm line-clamp-3 cursor-pointer" 
            onClick={toggleExpand}
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 pb-2 text-xs text-muted-foreground border-t">
        <div className="flex items-center gap-1">
          {note.videoTimestamp && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs px-2 flex gap-1 items-center" 
              onClick={onTimestampClick}
            >
              <Clock className="h-3 w-3" />
              {note.videoTimestamp.formatted}
            </Button>
          )}
        </div>
        <div className="flex gap-1">
          <SpeechButton
            onClick={handleSpeakNote}
            isActive={isSpeaking}
            mode="speak"
            className="h-6 px-2"
            disabled={false}
          />
          
          {onEdit && (
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={onEdit}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-destructive hover:bg-destructive/10" 
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
