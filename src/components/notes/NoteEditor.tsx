
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { YoutubeTimestamp } from '@/types/youtube';
import { createTimestamp } from '@/utils/youtube';

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  videoTimestamp?: YoutubeTimestamp;
  currentVideoTime?: number;
  onSave: (note: { title: string; content: string; videoTimestamp?: YoutubeTimestamp }) => void;
  onCancel?: () => void;
}

export function NoteEditor({
  initialTitle = '',
  initialContent = '',
  videoTimestamp,
  currentVideoTime,
  onSave,
  onCancel
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [timestamp, setTimestamp] = useState<YoutubeTimestamp | undefined>(videoTimestamp);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }
    
    onSave({
      title: title.trim(),
      content: content.trim(),
      videoTimestamp: timestamp
    });
  };

  const addCurrentTimestamp = () => {
    if (currentVideoTime !== undefined) {
      setTimestamp(createTimestamp(currentVideoTime));
      
      // Add timestamp to content if there is a cursor position
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const textBefore = content.substring(0, cursorPos);
        const textAfter = content.substring(cursorPos);
        const timestampText = `[${createTimestamp(currentVideoTime).formatted}] `;
        
        setContent(textBefore + timestampText + textAfter);
        
        // Reset cursor position after the inserted timestamp
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = cursorPos + timestampText.length;
          textarea.selectionEnd = cursorPos + timestampText.length;
        }, 0);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="font-medium"
        />
        
        <div className="flex items-center gap-2">
          {currentVideoTime !== undefined && (
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={addCurrentTimestamp}
              className="text-xs"
            >
              Add current timestamp
            </Button>
          )}
          
          {timestamp && (
            <span className="text-xs bg-muted px-2 py-1 rounded-md">
              Timestamp: {timestamp.formatted}
            </span>
          )}
        </div>
      </div>
      
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        className="min-h-[150px] resize-none"
      />
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={!title.trim()}>
          Save Note
        </Button>
      </div>
    </div>
  );
}
