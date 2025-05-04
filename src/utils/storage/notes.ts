
import { Note } from "@/types/note";
import { v4 as uuid } from "uuid";

// Notes functions
export const saveNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt">): Note => {
  try {
    const notes = getAllNotes();
    const noteWithTimestamps: Note = {
      ...note,
      id: uuid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
    return notes.filter((note) => note.resourceId === resourceId);
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
