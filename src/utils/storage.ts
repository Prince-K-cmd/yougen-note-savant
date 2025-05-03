
import { VideoMetadata, PlaylistMetadata } from '@/types/youtube';

// Interface for app settings
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  autoplay: boolean;
  muteByDefault: boolean;
  defaultQuality: string;
  downloadFormat: string;
  downloadSubtitles: boolean;
  downloadPath: string;
  enableHotkeys: boolean;
  enableNotifications: boolean;
}

// Default settings
const defaultSettings: Settings = {
  theme: 'system',
  autoplay: false,
  muteByDefault: false,
  defaultQuality: 'auto',
  downloadFormat: 'MP4',
  downloadSubtitles: true,
  downloadPath: '',
  enableHotkeys: true,
  enableNotifications: true,
};

// Function to get app settings
export const getSettings = (): Settings => {
  const storedSettings = localStorage.getItem('yougen_settings');
  return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
};

// Function to save app settings
export const saveSettings = (settings: Settings): void => {
  localStorage.setItem('yougen_settings', JSON.stringify(settings));
};

// Function to save a video's metadata to local storage
export const saveVideo = (video: VideoMetadata): void => {
  const videos = getAllVideos();
  // Check if the video already exists
  const existingIndex = videos.findIndex(v => v.id === video.id);

  if (existingIndex !== -1) {
    // Update existing video
    videos[existingIndex] = video;
  } else {
    // Add new video
    videos.push(video);
  }
  localStorage.setItem('yougen_videos', JSON.stringify(videos));
};

// Save video metadata (alias for saveVideo)
export const saveVideoMetadata = saveVideo;

// Function to retrieve all saved videos from local storage
export const getAllVideos = (): VideoMetadata[] => {
  const storedVideos = localStorage.getItem('yougen_videos');
  return storedVideos ? JSON.parse(storedVideos) : [];
};

// Function to get a specific video by ID from local storage
export const getVideoMetadata = (id: string): VideoMetadata | null => {
  const videos = getAllVideos();
  return videos.find(video => video.id === id) || null;
};

// Function to save a playlist's metadata to local storage
export const savePlaylist = (playlist: PlaylistMetadata): void => {
  const playlists = getAllPlaylists();
  // Check if the playlist already exists
  const existingIndex = playlists.findIndex(p => p.id === playlist.id);

  if (existingIndex !== -1) {
    // Update existing playlist
    playlists[existingIndex] = playlist;
  } else {
    // Add new playlist
    playlists.push(playlist);
  }
  localStorage.setItem('yougen_playlists', JSON.stringify(playlists));
};

// Function to retrieve all saved playlists from local storage
export const getAllPlaylists = (): PlaylistMetadata[] => {
  const storedPlaylists = localStorage.getItem('yougen_playlists');
  return storedPlaylists ? JSON.parse(storedPlaylists) : [];
};

// Function to get a specific playlist by ID from local storage
export const getPlaylistMetadata = (id: string): PlaylistMetadata | null => {
  const playlists = getAllPlaylists();
  return playlists.find(playlist => playlist.id === id) || null;
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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

// Save a chat to local storage
export const saveChat = (chat: Chat): void => {
  const chats = getAllChats();
  const existingIndex = chats.findIndex(c => c.id === chat.id);
  
  if (existingIndex !== -1) {
    chats[existingIndex] = chat;
  } else {
    chats.push(chat);
  }
  
  localStorage.setItem('yougen_chats', JSON.stringify(chats));
};

// Get a chat by resource ID (video or playlist ID)
export const getChat = (resourceId: string): Chat | null => {
  const chats = getAllChats();
  return chats.find(chat => chat.resourceId === resourceId) || null;
};

// Get all chats from local storage
export const getAllChats = (): Chat[] => {
  const storedChats = localStorage.getItem('yougen_chats');
  return storedChats ? JSON.parse(storedChats) : [];
};

// Delete a chat by ID
export const deleteChat = (id: string): void => {
  const chats = getAllChats();
  const updatedChats = chats.filter(chat => chat.id !== id);
  localStorage.setItem('yougen_chats', JSON.stringify(updatedChats));
};
