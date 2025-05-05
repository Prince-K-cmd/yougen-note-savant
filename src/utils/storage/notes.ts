
import { Note } from "@/types/note";
import { v4 as uuid } from "uuid";

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

// Notes functions
export const saveNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt">): Note => {
  try {
    const notes = getAllNotes();
    const noteWithTimestamps: Note = {
      ...note,
      id: uuid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: note.pinned || false,
      color: note.color || noteColors[Math.floor(Math.random() * noteColors.length)],
    };
    
    notes.push(noteWithTimestamps);
    localStorage.setItem("yougen_notes", JSON.stringify(notes));
    
    return noteWithTimestamps;
  } catch (error) {
    console.error("Error saving note:", error);
    return {
      id: uuid(),
      title: "Error note",
      content: "Error creating note",
      resourceId: "",
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      color: noteColors[0],
    };
  }
};

export const updateNote = (note: Note): void => {
  try {
    const notes = getAllNotes();
    const noteIndex = notes.findIndex((n) => n.id === note.id);
    
    if (noteIndex >= 0) {
      notes[noteIndex] = {
        ...note,
        updatedAt: Date.now(),
      };
      localStorage.setItem("yougen_notes", JSON.stringify(notes));
    }
  } catch (error) {
    console.error("Error updating note:", error);
  }
};

export const pinNote = (noteId: string, pinned: boolean): void => {
  try {
    const notes = getAllNotes();
    const noteIndex = notes.findIndex((n) => n.id === noteId);
    
    if (noteIndex >= 0) {
      notes[noteIndex] = {
        ...notes[noteIndex],
        pinned,
        updatedAt: Date.now(),
      };
      localStorage.setItem("yougen_notes", JSON.stringify(notes));
    }
  } catch (error) {
    console.error("Error pinning note:", error);
  }
};

export const deleteNote = (noteId: string): void => {
  try {
    const notes = getAllNotes();
    const filteredNotes = notes.filter((note) => note.id !== noteId);
    localStorage.setItem("yougen_notes", JSON.stringify(filteredNotes));
  } catch (error) {
    console.error("Error deleting note:", error);
  }
};

export const getNotesByResourceId = (resourceId: string): Note[] => {
  try {
    const notes = getAllNotes();
    const filteredNotes = notes.filter((note) => note.resourceId === resourceId);
    
    // Sort notes: pinned first, then by creation date (newest first)
    return filteredNotes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
  } catch (error) {
    console.error("Error getting notes by resource ID:", error);
    return [];
  }
};

export const getAllNotes = (): Note[] => {
  try {
    const notes = localStorage.getItem("yougen_notes");
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    console.error("Error getting all notes:", error);
    return [];
  }
};

export const getSortedNotes = (): Note[] => {
  try {
    const notes = getAllNotes();
    
    // Sort notes: pinned first, then by creation date (newest first)
    return notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
  } catch (error) {
    console.error("Error getting sorted notes:", error);
    return [];
  }
};

export const getNoteById = (noteId: string): Note | undefined => {
  try {
    const notes = getAllNotes();
    return notes.find((note) => note.id === noteId);
  } catch (error) {
    console.error("Error getting note by ID:", error);
    return undefined;
  }
};

export const exportNotesToMarkdown = (): string => {
  try {
    const notes = getAllNotes();
    let markdownContent = '';
    
    notes.forEach((note) => {
      markdownContent += `# ${note.title}\n\n`;
      
      if (note.videoTimestamp) {
        markdownContent += `Timestamp: ${note.videoTimestamp.formatted}\n\n`;
      }
      
      // Convert HTML to plain text or use content directly
      const content = note.richContent 
        ? note.richContent.replace(/<[^>]*>?/gm, '') 
        : note.content;
        
      markdownContent += `${content}\n\n`;
      markdownContent += `---\n\n`;
    });
    
    return markdownContent;
  } catch (error) {
    console.error("Error exporting notes to markdown:", error);
    return "Error exporting notes";
  }
};
