
import { Button } from "@/components/ui/button";
import { FileText as NoteIcon } from "lucide-react";
import { Note } from "@/types/note";
import { NoteCard } from "@/components/notes/NoteCard";
import { useNavigate } from "react-router-dom";

interface NotesTabProps {
  notes: Note[];
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onTimestampClick: (seconds: number) => void;
  onPinNote?: (noteId: string, pinned: boolean) => void;
}

export function NotesTab({
  notes,
  onCreateNote,
  onDeleteNote,
  onTimestampClick,
  onPinNote
}: NotesTabProps) {
  const navigate = useNavigate();
  
  const goToAllNotes = () => {
    navigate('/notes');
  };

  return (
    <>
      <div className="p-4 pb-2 flex justify-between items-center border-b">
        <h3 className="font-medium">Your Notes</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={goToAllNotes}>
            All Notes
          </Button>
          <Button size="sm" onClick={onCreateNote}>
            New Note
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <NoteIcon className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No notes yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create notes to save important information from this video.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={() => onDeleteNote(note.id)}
                onTimestampClick={note.videoTimestamp ? () => onTimestampClick(note.videoTimestamp!.seconds) : undefined}
                onPin={onPinNote}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
