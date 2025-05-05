
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { YoutubeTimestamp } from '@/types/youtube';
import { createTimestamp } from '@/utils/youtube';
import { RichTextEditor } from './editor';
import { Undo, Redo } from 'lucide-react';

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
  
  // For versioning
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Update content and add to history
  const updateContent = (newContent: string) => {
    setContent(newContent);
    
    // Add to history if it's different from the latest entry
    if (newContent !== history[historyIndex]) {
      // Remove any future history entries (if we've undone and then made changes)
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  const handleUndo = () => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };
  
  const handleRedo = () => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

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
      const newContent = content + formattedTimestamp;
      updateContent(newContent);
    }
  };

  // Auto-focus on the title input when the editor opens
  useEffect(() => {
    const titleInput = document.querySelector('input[placeholder="Note title"]') as HTMLInputElement;
    if (titleInput) {
      titleInput.focus();
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="font-medium"
          autoFocus
        />
        
        <div className="flex items-center gap-2 flex-wrap">
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
          
          <div className="ml-auto flex gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleUndo} 
              disabled={!canUndo}
              className="h-8 w-8"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleRedo} 
              disabled={!canRedo}
              className="h-8 w-8"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <RichTextEditor 
        content={content} 
        onChange={updateContent} 
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
