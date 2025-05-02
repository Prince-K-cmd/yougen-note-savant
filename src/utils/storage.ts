
import { Chat } from '@/types/chat';
import { Note } from '@/types/note';
import { VideoMetadata, PlaylistMetadata } from '@/types/youtube';

// Storage keys
const STORAGE_KEYS = {
  VIDEOS: 'yougen_videos',
  PLAYLISTS: 'yougen_playlists',
  CHATS: 'yougen_chats',
  NOTES: 'yougen_notes',
  SETTINGS: 'yougen_settings',
};

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
  }
};

// Video metadata storage
export const saveVideoMetadata = (video: VideoMetadata): void => {
  const videos = getItem<VideoMetadata[]>(STORAGE_KEYS.VIDEOS, []);
  const existingIndex = videos.findIndex(v => v.id === video.id);
  
  if (existingIndex >= 0) {
    videos[existingIndex] = video;
  } else {
    videos.push(video);
  }
  
  setItem(STORAGE_KEYS.VIDEOS, videos);
};

export const getVideoMetadata = (id: string): VideoMetadata | undefined => {
  const videos = getItem<VideoMetadata[]>(STORAGE_KEYS.VIDEOS, []);
  return videos.find(video => video.id === id);
};

export const getAllVideos = (): VideoMetadata[] => {
  return getItem<VideoMetadata[]>(STORAGE_KEYS.VIDEOS, []);
};

// Playlist metadata storage
export const savePlaylistMetadata = (playlist: PlaylistMetadata): void => {
  const playlists = getItem<PlaylistMetadata[]>(STORAGE_KEYS.PLAYLISTS, []);
  const existingIndex = playlists.findIndex(p => p.id === playlist.id);
  
  if (existingIndex >= 0) {
    playlists[existingIndex] = playlist;
  } else {
    playlists.push(playlist);
  }
  
  setItem(STORAGE_KEYS.PLAYLISTS, playlists);
};

export const getPlaylistMetadata = (id: string): PlaylistMetadata | undefined => {
  const playlists = getItem<PlaylistMetadata[]>(STORAGE_KEYS.PLAYLISTS, []);
  return playlists.find(playlist => playlist.id === id);
};

export const getAllPlaylists = (): PlaylistMetadata[] => {
  return getItem<PlaylistMetadata[]>(STORAGE_KEYS.PLAYLISTS, []);
};

// Chat storage
export const saveChat = (chat: Chat): void => {
  const chats = getItem<Chat[]>(STORAGE_KEYS.CHATS, []);
  const existingIndex = chats.findIndex(c => c.id === chat.id);
  
  if (existingIndex >= 0) {
    chats[existingIndex] = chat;
  } else {
    chats.push(chat);
  }
  
  setItem(STORAGE_KEYS.CHATS, chats);
};

export const getChat = (id: string): Chat | undefined => {
  const chats = getItem<Chat[]>(STORAGE_KEYS.CHATS, []);
  return chats.find(chat => chat.id === id);
};

export const getChatsByResourceId = (resourceId: string): Chat[] => {
  const chats = getItem<Chat[]>(STORAGE_KEYS.CHATS, []);
  return chats.filter(chat => chat.resourceId === resourceId);
};

export const getAllChats = (): Chat[] => {
  return getItem<Chat[]>(STORAGE_KEYS.CHATS, []);
};

export const deleteChat = (id: string): void => {
  const chats = getItem<Chat[]>(STORAGE_KEYS.CHATS, []);
  const filteredChats = chats.filter(chat => chat.id !== id);
  setItem(STORAGE_KEYS.CHATS, filteredChats);
};

// Note storage
export const saveNote = (note: Note): void => {
  const notes = getItem<Note[]>(STORAGE_KEYS.NOTES, []);
  const existingIndex = notes.findIndex(n => n.id === note.id);
  
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.push(note);
  }
  
  setItem(STORAGE_KEYS.NOTES, notes);
};

export const getNote = (id: string): Note | undefined => {
  const notes = getItem<Note[]>(STORAGE_KEYS.NOTES, []);
  return notes.find(note => note.id === id);
};

export const getNotesByResourceId = (resourceId: string): Note[] => {
  const notes = getItem<Note[]>(STORAGE_KEYS.NOTES, []);
  return notes.filter(note => note.resourceId === resourceId);
};

export const getAllNotes = (): Note[] => {
  return getItem<Note[]>(STORAGE_KEYS.NOTES, []);
};

export const deleteNote = (id: string): void => {
  const notes = getItem<Note[]>(STORAGE_KEYS.NOTES, []);
  const filteredNotes = notes.filter(note => note.id !== id);
  setItem(STORAGE_KEYS.NOTES, filteredNotes);
};

// Settings
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultDownloadQuality: string;
  fontScale: number;
}

export const defaultSettings: AppSettings = {
  theme: 'system',
  defaultDownloadQuality: 'high',
  fontScale: 1,
};

export const getSettings = (): AppSettings => {
  return getItem<AppSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
};

export const saveSettings = (settings: AppSettings): void => {
  setItem(STORAGE_KEYS.SETTINGS, settings);
};
