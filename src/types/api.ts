
// Video metadata types
export interface IVideoMetadataRequest {
  url: string;
}

export interface IVideoMetadata {
  platform: string;
  video_id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  upload_date?: string;
  channel?: string;
}

// Playlist metadata types
export interface IPlaylistMetadataRequest {
  url: string;
}

export interface IPlaylistMetadata {
  platform: string;
  playlist_id: string;
  title: string;
  thumbnail?: string;
  item_count?: number;
  channel?: string;
  videos: IVideoMetadata[];
}

// Video format types
export interface IVideoFormat {
  format_id: string;
  extension: string;
  resolution: string;
  filesize_approx?: number;
  format_note?: string;
}

export interface IFormatListRequest {
  video_url: string;
}

export interface IFormatListResponse {
  formats: IVideoFormat[];
  video_id: string;
  title: string;
}

// Download types
export interface IDownloadRequest {
  video_url: string;
  format: 'mp4' | 'mp3';
  resolution?: '240' | '360' | '480' | '720' | '1080';
}

export interface IBatchDownloadRequest {
  playlist_url: string;
  format: 'mp4' | 'mp3';
  resolution?: '240' | '360' | '480' | '720' | '1080';
}

export interface IDownloadResponse {
  file_url: string;
  title: string;
  size?: number;
  format: string;
  resolution?: string;
}

export interface IBatchDownloadResponse {
  task_id: string;
  total_videos: number;
}

// Download history types
export interface IDownloadHistory {
  id: string;
  video_id?: string;
  playlist_id?: string;
  title: string;
  thumbnail?: string;
  format: 'mp4' | 'mp3';
  resolution?: string;
  size?: number;
  status: 'completed' | 'failed' | 'in_progress';
  download_date: string;
  file_path?: string;
}

// Note types
export interface INoteRequest {
  video_url: string;
  content: Record<string, any>; // Lexical JSON content
  timestamp?: number;
  tags?: string[];
}

export interface INoteResponse {
  id: number;
  video_url: string;
  video_id: string;
  content: Record<string, any>; // Lexical JSON content
  content_text: string; // Plain text extracted from content
  timestamp?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// Chat types
export interface IChatRequest {
  video_url: string;
  message: string;
  language?: string;
}

export interface IChatResponse {
  response: string;
  suggestions: string[];
  video_id: string;
}

// API client configuration
export interface IApiConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

// WebSocket types
export interface IDownloadProgress {
  task_id: string;
  completed: number;
  failed: number;
  total: number;
  percentage: number;
  current_video?: string;
}

export interface IDownloadComplete {
  task_id: string;
  completed: number;
  failed: number;
  total: number;
}

export interface IDownloadError {
  task_id: string;
  message: string;
}
