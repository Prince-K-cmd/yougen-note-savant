
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Note } from "@/types/note";
import { notesApi } from "@/services/api";
import { pinNote, deleteNote, updateNote, saveNote } from "@/utils/storage";
import { Header } from "@/components/layout/Header";
import { NoteCard } from "@/components/notes/NoteCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useToast } from "@/hooks/use-toast";

export default function NotesView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  
  // Fetch notes from API
  const { data: notes, isLoading, error, refetch } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      try {
        // First try to get notes from API
        const apiNotes = await notesApi.getAllNotes();
        // Convert API notes to the Note format
        return apiNotes.map(note => ({
          id: note.id.toString(),
          title: note.content_text.split('\n')[0] || 'Untitled Note', // Use first line as title
          content: note.content_text,
          richContent: JSON.stringify(note.content),
          resourceId: note.video_id,
          videoTimestamp: note.timestamp ? { seconds: note.timestamp } : undefined,
          tags: note.tags || [],
          pinned: false, // API doesn't support pinning yet
          createdAt: new Date(note.created_at).getTime(),
          updatedAt: new Date(note.updated_at).getTime()
        }));
      } catch (error) {
        console.error('Error fetching notes from API:', error);
        // Fallback to local storage
        const localNotes = localStorage.getItem("yougen_notes");
        return localNotes ? JSON.parse(localNotes) : [];
      }
    },
    staleTime: 60000, // 1 minute
  });

  // Filter notes when search term or notes change
  useState(() => {
    if (!notes) return;
    
    if (searchTerm.trim() === "") {
      setFilteredNotes(notes);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredNotes(
        notes.filter(
          (note) =>
            note.title.toLowerCase().includes(term) ||
            note.content.toLowerCase().includes(term)
        )
      );
    }
  });

  const handlePinNote = (noteId: string, pinned: boolean) => {
    pinNote(noteId, pinned);
    toast({
      title: pinned ? "Note pinned" : "Note unpinned",
      description: pinned ? "Note has been pinned to the top." : "Note has been unpinned.",
    });
    refetch();
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      // First try to delete from API
      // await notesApi.deleteNote(parseInt(noteId)); // This API endpoint would need to be added
      
      // Then delete from local storage
      deleteNote(noteId);
      
      toast({
        title: "Note deleted",
        description: "Your note has been deleted.",
        variant: "destructive"
      });
      refetch();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Could not delete note. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setIsEditing(true);
  };

  const handleSaveNote = async (updatedNote: { 
    title: string; 
    content: string; 
    richContent?: string; 
    videoTimestamp?: any;
  }) => {
    try {
      if (currentNote) {
        // Update existing note
        const updated = {
          ...currentNote,
          title: updatedNote.title,
          content: updatedNote.content,
          richContent: updatedNote.richContent,
          updatedAt: Date.now(),
        };
        
        // Try to update in API first
        // await notesApi.updateNote(parseInt(currentNote.id), {
        //   video_url: currentNote.resourceId ? `https://www.youtube.com/watch?v=${currentNote.resourceId}` : '',
        //   content: JSON.parse(updatedNote.richContent || '{}'),
        //   timestamp: updatedNote.videoTimestamp?.seconds
        // });
        
        // Then update in local storage
        updateNote(updated);
        
        toast({
          title: "Note updated",
          description: "Your changes have been saved.",
        });
      } else {
        // Create new note
        const newNote = saveNote({
          title: updatedNote.title,
          content: updatedNote.content,
          richContent: updatedNote.richContent,
          resourceId: "",
          tags: [],
          videoTimestamp: updatedNote.videoTimestamp,
        });
        
        // Try to save in API
        // await notesApi.saveNote({
        //   video_url: '',  // No video URL for standalone notes
        //   content: JSON.parse(updatedNote.richContent || '{}'),
        //   timestamp: updatedNote.videoTimestamp?.seconds
        // });
        
        toast({
          title: "Note created",
          description: "Your new note has been saved.",
        });
      }
      
      setIsEditing(false);
      setCurrentNote(null);
      refetch();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Could not save note. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateNewNote = () => {
    setCurrentNote(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentNote(null);
  };

  const handleTimestampClick = (note: Note) => {
    if (note.videoTimestamp && note.resourceId) {
      navigate(`/video/${note.resourceId}`, { 
        state: { 
          timestamp: note.videoTimestamp.seconds 
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-12 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-12 flex-grow flex flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Notes</h2>
            <p className="text-muted-foreground mb-4">
              Could not connect to the backend server. Showing locally stored notes.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Sort notes: pinned first, then by creation date (newest first)
  const sortedNotes = [...(notes || [])].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });
  
  // Apply search filter
  const displayedNotes = searchTerm.trim() === "" 
    ? sortedNotes
    : sortedNotes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container py-6 px-4 sm:px-6 flex-grow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">All Notes</h1>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={handleCreateNewNote} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </div>
        </div>
        
        {isEditing ? (
          <div className="bg-card border rounded-lg p-4 mb-6">
            <h2 className="text-lg font-medium mb-4">
              {currentNote ? "Edit Note" : "Create New Note"}
            </h2>
            <NoteEditor
              initialTitle={currentNote?.title || ""}
              initialContent={currentNote?.richContent || currentNote?.content || ""}
              onSave={handleSaveNote}
              onCancel={handleCancelEdit}
            />
          </div>
        ) : (
          <>
            {!displayedNotes.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M6 4v16"></path>
                    <path d="M6 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6"></path>
                    <path d="M10 4v4"></path>
                    <path d="M14 4v4"></path>
                    <path d="M10 12h8"></path>
                    <path d="M10 16h5"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">No notes found</h2>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No notes match your search term." : "Create your first note to get started."}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={() => handleDeleteNote(note.id)}
                    onEdit={() => handleEditNote(note)}
                    onPin={handlePinNote}
                    onTimestampClick={note.videoTimestamp ? 
                      () => handleTimestampClick(note) : undefined}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
