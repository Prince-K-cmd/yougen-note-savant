
import { Note } from '@/types/note';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { useState } from 'react';

interface NoteCardProps {
  note: Note;
  onEdit?: () => void;
  onDelete?: () => void;
  onTimestampClick?: () => void;
}

export function NoteCard({ note, onEdit, onDelete, onTimestampClick }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const displayContent = note.richContent || note.content;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1 cursor-pointer" onClick={toggleExpand}>
          {note.title}
        </CardTitle>
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
