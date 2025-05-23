
export interface VideoMetadata {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface PlaylistMetadata {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  itemCount: number;
  videos: VideoMetadata[];
  createdAt?: number;
  updatedAt?: number;
}

export type YoutubeResource = VideoMetadata | PlaylistMetadata;

export interface YoutubeTimestamp {
  seconds: number;
  formatted: string; // HH:MM:SS format
}

export enum ResourceType {
  VIDEO = 'video',
  PLAYLIST = 'playlist',
}

export interface YoutubeParseResult {
  type: ResourceType;
  id: string;
  url: string;
}
