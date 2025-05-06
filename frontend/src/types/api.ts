
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

// Download types
export interface IDownloadRequest {
  video_url: string;
  format: 'mp4' | 'mp3';
}

export interface IDownloadResponse {
  file_url: string;
  title: string;
  size?: number;
  format: string;
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
