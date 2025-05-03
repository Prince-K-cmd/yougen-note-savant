
import { ResourceType, VideoMetadata, PlaylistMetadata } from "@/types/youtube";
import { v4 as uuid } from "uuid";
import { Chat, Message } from "@/types/chat";
import { Note } from "@/types/note";

// Define settings interface
export interface Settings {
  theme?: 'light' | 'dark' | 'system';
  fontScale?: number;
  autoplay?: boolean;
  defaultPlaybackSpeed?: number;
  defaultVolume?: number;
  defaultDownloadQuality?: 'low' | 'medium' | 'high';
  autosaveNotes?: boolean;
  enableNotifications?: boolean;
  notifyNewSummaries?: boolean;
  notifyTranscriptReady?: boolean;
  notifyNotesSaved?: boolean;
  [key: string]: any;
}

// Settings functions
export const getSettings = (): Settings => {
  const defaultSettings: Settings = {
    theme: 'system',
    fontScale: 1.0,
    autoplay: true,
    defaultPlaybackSpeed: 1.0,
    defaultVolume: 1.0,
    defaultDownloadQuality: 'medium',
    autosaveNotes: true,
    enableNotifications: true,
    notifyNewSummaries: true,
    notifyTranscriptReady: true,
    notifyNotesSaved: false,
  };

  try {
    const storedSettings = localStorage.getItem('yougen_settings');
    if (storedSettings) {
      return { ...defaultSettings, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  return defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem('yougen_settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Extend VideoMetadata to include the timestamps
interface VideoMetadataWithTimestamps extends VideoMetadata {
  createdAt?: number;
  updatedAt?: number;
}

// Video functions
export const saveVideoMetadata = (video: VideoMetadata): void => {
  try {
    const currentVideos = getAllVideos();
    const existingVideoIndex = currentVideos.findIndex(
      (v) => v.id === video.id
    );

    if (existingVideoIndex >= 0) {
      currentVideos[existingVideoIndex] = {
        ...currentVideos[existingVideoIndex],
        ...video,
        updatedAt: Date.now(),
      };
    } else {
      const videoWithTimestamps: VideoMetadata = {
        ...video,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      currentVideos.push(videoWithTimestamps);
    }

    localStorage.setItem("yougen_videos", JSON.stringify(currentVideos));
  } catch (error) {
    console.error("Error saving video metadata:", error);
  }
};

export const getVideoMetadata = (videoId: string): VideoMetadata | null => {
  try {
    const videos = getAllVideos();
    return videos.find((video) => video.id === videoId) || null;
  } catch (error) {
    console.error("Error getting video metadata:", error);
    return null;
  }
};

export const getAllVideos = (): VideoMetadata[] => {
  try {
    const videos = localStorage.getItem("yougen_videos");
    return videos ? JSON.parse(videos) : [];
  } catch (error) {
    console.error("Error getting all videos:", error);
    return [];
  }
};

// Extend PlaylistMetadata to include the timestamps
interface PlaylistMetadataWithTimestamps extends PlaylistMetadata {
  createdAt?: number;
  updatedAt?: number;
}

// Playlist functions
export const savePlaylistMetadata = (
  playlist: PlaylistMetadata
): void => {
  try {
    const currentPlaylists = getAllPlaylists();
    const existingPlaylistIndex = currentPlaylists.findIndex(
      (p) => p.id === playlist.id
    );

    if (existingPlaylistIndex >= 0) {
      currentPlaylists[existingPlaylistIndex] = {
        ...currentPlaylists[existingPlaylistIndex],
        ...playlist,
        updatedAt: Date.now(),
      };
    } else {
      const playlistWithTimestamps: PlaylistMetadata = {
        ...playlist,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      currentPlaylists.push(playlistWithTimestamps);
    }

    localStorage.setItem("yougen_playlists", JSON.stringify(currentPlaylists));
  } catch (error) {
    console.error("Error saving playlist metadata:", error);
  }
};

export const getPlaylistMetadata = (
  playlistId: string
): PlaylistMetadata | null => {
  try {
    const playlists = getAllPlaylists();
    return playlists.find((playlist) => playlist.id === playlistId) || null;
  } catch (error) {
    console.error("Error getting playlist metadata:", error);
    return null;
  }
};

export const getAllPlaylists = (): PlaylistMetadata[] => {
  try {
    const playlists = localStorage.getItem("yougen_playlists");
    return playlists ? JSON.parse(playlists) : [];
  } catch (error) {
    console.error("Error getting all playlists:", error);
    return [];
  }
};

// Chat functions
export const saveChat = (resourceId: string, title: string): string => {
  try {
    const chatId = uuid();
    const chats = getAllChats();

    const existingChat = chats.find((chat) => chat.resourceId === resourceId);
    
    if (existingChat) {
      return existingChat.id;
    }

    const newChat: Chat = {
      id: chatId,
      resourceId,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    chats.push(newChat);
    localStorage.setItem("yougen_chats", JSON.stringify(chats));
    
    return chatId;
  } catch (error) {
    console.error("Error saving chat:", error);
    return "";
  }
};

export const addChatMessage = (
  chatId: string,
  message: Message
): void => {
  try {
    const chats = getAllChats();
    const chatIndex = chats.findIndex((chat) => chat.id === chatId);

    if (chatIndex >= 0) {
      chats[chatIndex].messages.push(message);
      chats[chatIndex].updatedAt = Date.now();
      localStorage.setItem("yougen_chats", JSON.stringify(chats));
    }
  } catch (error) {
    console.error("Error adding chat message:", error);
  }
};

export const getChatById = (chatId: string): Chat | null => {
  try {
    const chats = getAllChats();
    return chats.find((chat) => chat.id === chatId) || null;
  } catch (error) {
    console.error("Error getting chat by ID:", error);
    return null;
  }
};

export const getChatByResourceId = (resourceId: string): Chat | null => {
  try {
    const chats = getAllChats();
    return chats.find((chat) => chat.resourceId === resourceId) || null;
  } catch (error) {
    console.error("Error getting chat by resource ID:", error);
    return null;
  }
};

export const getChatsByResourceId = (resourceId: string): Chat[] => {
  try {
    const chats = getAllChats();
    return chats.filter((chat) => chat.resourceId === resourceId);
  } catch (error) {
    console.error("Error getting chats by resource ID:", error);
    return [];
  }
};

export const getAllChats = (): Chat[] => {
  try {
    const chats = localStorage.getItem("yougen_chats");
    return chats ? JSON.parse(chats) : [];
  } catch (error) {
    console.error("Error getting all chats:", error);
    return [];
  }
};

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
