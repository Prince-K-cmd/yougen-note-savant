import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { YoutubeTimestamp } from '@/types/youtube';
import { createTimestamp } from '@/utils/youtube';
import { RichTextEditor } from './editor';

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  videoTimestamp?: YoutubeTimestamp;
  currentVideoTime?: number;
  onSave: (note: { title: string; content: string; richContent?: string; videoTimestamp?: YoutubeTimestamp }) => void;
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
      richContent: content, // Save the HTML content
      videoTimestamp: timestamp
    });
  };

  const addCurrentTimestamp = () => {
    if (currentVideoTime !== undefined) {
      setTimestamp(createTimestamp(currentVideoTime));
      
      // Add timestamp to content at current position or append
      const formattedTimestamp = `[${createTimestamp(currentVideoTime).formatted}] `;
      
      // For rich text, we'll just append the timestamp to the current content
      // A more sophisticated approach would be to insert at cursor position,
      // but that would require more integration with the editor
      setContent((prevContent) => {
        return prevContent + formattedTimestamp;
      });
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
      
      <RichTextEditor 
        content={content} 
        onChange={setContent} 
        placeholder="Write your note..."
        minHeight="200px"
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
