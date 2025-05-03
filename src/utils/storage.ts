
import { v4 as uuidv4 } from 'uuid';

// Types
export enum ResourceType {
  VIDEO = 'video',
  PLAYLIST = 'playlist',
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

export interface Chat {
  id: string;
  resourceId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface VideoMetadata {
  id: string;
  title: string;
  author: string;
  viewCount: number;
  uploadDate: string;
  thumbnailUrl: string;
  description: string;
  channelTitle?: string;
  channelId?: string;
  publishedAt?: string;
  duration?: number;
}

export interface PlaylistMetadata {
  id: string;
  title: string;
  author: string;
  videoCount: number;
  thumbnailUrl: string;
  description: string;
  channelTitle?: string;
  channelId?: string;
  publishedAt?: string;
  itemCount?: number;
  videos?: string[];
}

// =========================
// Chat Storage
// =========================

const CHATS_KEY = 'chats';

// Initialize chats in localStorage if it doesn't exist
if (!localStorage.getItem(CHATS_KEY)) {
  localStorage.setItem(CHATS_KEY, JSON.stringify([]));
}

export const createChat = (resourceId: string, title: string): Chat => {
  const newChat: Chat = {
    id: uuidv4(),
    resourceId: resourceId,
    title: title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const chats = getAllChats();
  localStorage.setItem(CHATS_KEY, JSON.stringify([...chats, newChat]));
  return newChat;
};

export const getChat = (chatId: string): Chat | undefined => {
  const chats = getAllChats();
  return chats.find((chat) => chat.id === chatId);
};

export const getAllChats = (): Chat[] => {
  const chatsString = localStorage.getItem(CHATS_KEY);
  return chatsString ? JSON.parse(chatsString) : [];
};

export const updateChat = (chatId: string, updates: Partial<Chat>): Chat | undefined => {
  const chats = getAllChats();
  const chatIndex = chats.findIndex((chat) => chat.id === chatId);

  if (chatIndex === -1) {
    console.warn(`Chat with id ${chatId} not found`);
    return undefined;
  }

  const updatedChat = { ...chats[chatIndex], ...updates, updatedAt: Date.now() };
  chats[chatIndex] = updatedChat;
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  return updatedChat;
};

export const deleteChat = (chatId: string): void => {
  const chats = getAllChats();
  const updatedChats = chats.filter((chat) => chat.id !== chatId);
  localStorage.setItem(CHATS_KEY, JSON.stringify(updatedChats));
};

// Add the missing saveChat function
export const saveChat = (chat: Chat): void => {
  const chats = getAllChats();
  const existingChatIndex = chats.findIndex((c) => c.id === chat.id);
  
  if (existingChatIndex !== -1) {
    // Update existing chat
    chats[existingChatIndex] = chat;
  } else {
    // Add new chat
    chats.push(chat);
  }
  
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
};

// =========================
// Video Metadata Storage
// =========================

const VIDEOS_KEY = 'videos';

// Initialize videos in localStorage if it doesn't exist
if (!localStorage.getItem(VIDEOS_KEY)) {
  localStorage.setItem(VIDEOS_KEY, JSON.stringify([]));
}

export const saveVideoMetadata = (metadata: VideoMetadata): void => {
  const videos = getAllVideos();
  localStorage.setItem(VIDEOS_KEY, JSON.stringify([...videos, metadata]));
};

export const getVideoMetadata = (videoId: string): VideoMetadata | undefined => {
  const videos = getAllVideos();
  return videos.find((video) => video.id === videoId);
};

export const getAllVideos = (): VideoMetadata[] => {
  const videosString = localStorage.getItem(VIDEOS_KEY);
  return videosString ? JSON.parse(videosString) : [];
};

// =========================
// Playlist Metadata Storage
// =========================

const PLAYLISTS_KEY = 'playlists';

// Initialize playlists in localStorage if it doesn't exist
if (!localStorage.getItem(PLAYLISTS_KEY)) {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify([]));
}

export const savePlaylistMetadata = (metadata: PlaylistMetadata): void => {
  const playlists = getAllPlaylists();
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify([...playlists, metadata]));
};

export const getPlaylistMetadata = (playlistId: string): PlaylistMetadata | undefined => {
  const playlists = getAllPlaylists();
  return playlists.find((playlist) => playlist.id === playlistId);
};

export const getAllPlaylists = (): PlaylistMetadata[] => {
  const playlistsString = localStorage.getItem(PLAYLISTS_KEY);
  return playlistsString ? JSON.parse(playlistsString) : [];
};

// Added helper functions for PlaylistView.tsx
export const saveVideo = (video: VideoMetadata): void => {
  const videos = getAllVideos();
  const existingIndex = videos.findIndex((v) => v.id === video.id);
  
  if (existingIndex >= 0) {
    videos[existingIndex] = video;
  } else {
    videos.push(video);
  }
  
  localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
};

export const savePlaylist = (playlist: PlaylistMetadata): void => {
  const playlists = getAllPlaylists();
  const existingIndex = playlists.findIndex((p) => p.id === playlist.id);
  
  if (existingIndex >= 0) {
    playlists[existingIndex] = playlist;
  } else {
    playlists.push(playlist);
  }
  
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
};

// Default settings
const defaultSettings = {
  theme: 'system' as 'light' | 'dark' | 'system',
  autoplay: true,
  muteByDefault: false,
  defaultQuality: '720p',
  downloadFormat: 'MP4',
  downloadSubtitles: true,
  downloadPath: '',
  enableHotkeys: true,
  enableNotifications: true
};

// Get settings from localStorage or return defaults
export const getSettings = () => {
  const settings = localStorage.getItem('settings');
  return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
};

// Save settings to localStorage
export const saveSettings = (settings: any) => {
  localStorage.setItem('settings', JSON.stringify(settings));
};
