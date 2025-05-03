
import { VideoMetadata, PlaylistMetadata } from '@/utils/storage';
import { ResourceType, YoutubeParseResult, YoutubeTimestamp } from '@/types/youtube';

// This file contains YouTube-specific utility functions

/**
 * Fetches video details from an API or returns placeholder data
 */
export const fetchVideoDetails = async (videoId: string): Promise<VideoMetadata> => {
  // In a real app, this would fetch from the YouTube API
  console.log(`Fetching details for video ${videoId}`);
  
  // Return placeholder data
  return {
    id: videoId,
    title: `Video ${videoId}`,
    author: "YouTube Creator",
    description: "This is a sample video description. In a real application, this would be fetched from the YouTube API.",
    thumbnailUrl: "https://via.placeholder.com/480x360",
    uploadDate: new Date().toISOString(),
    viewCount: 1000,
    channelId: "channel123",
    channelTitle: "YouTube Creator",
    publishedAt: new Date().toISOString(),
    duration: "6:00" // 6 minutes
  };
};

/**
 * Fetches playlist details from an API or returns placeholder data
 */
export const fetchPlaylistDetails = async (playlistId: string): Promise<PlaylistMetadata> => {
  // In a real app, this would fetch from the YouTube API
  console.log(`Fetching details for playlist ${playlistId}`);
  
  // Return placeholder data
  return {
    id: playlistId,
    title: `Playlist ${playlistId}`,
    author: "YouTube Creator",
    description: "This is a sample playlist description. In a real application, this would be fetched from the YouTube API.",
    thumbnailUrl: "https://via.placeholder.com/480x360",
    videoCount: 5,
    channelId: "channel123",
    channelTitle: "YouTube Creator",
    publishedAt: new Date().toISOString(),
    itemCount: 5,
    videos: [
      { id: "video1", title: "Video 1", thumbnailUrl: "https://via.placeholder.com/480x360", channelTitle: "YouTube Creator", publishedAt: new Date().toISOString(), description: "Video description", duration: "5:00", viewCount: "1000", channelId: "channel123" },
      { id: "video2", title: "Video 2", thumbnailUrl: "https://via.placeholder.com/480x360", channelTitle: "YouTube Creator", publishedAt: new Date().toISOString(), description: "Video description", duration: "7:30", viewCount: "2000", channelId: "channel123" },
      { id: "video3", title: "Video 3", thumbnailUrl: "https://via.placeholder.com/480x360", channelTitle: "YouTube Creator", publishedAt: new Date().toISOString(), description: "Video description", duration: "3:45", viewCount: "1500", channelId: "channel123" }
    ]
  };
};

/**
 * Gets a placeholder thumbnail URL for a video
 */
export const getPlaceholderThumbnail = (videoId: string): string => {
  return `https://via.placeholder.com/480x360?text=Video+${videoId}`;
};

/**
 * Parses a YouTube URL to extract video or playlist ID
 */
export const parseYoutubeUrl = (url: string): YoutubeParseResult | null => {
  // Try to match video URLs
  const videoRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i;
  const videoMatch = url.match(videoRegex);

  if (videoMatch && videoMatch[1]) {
    return {
      type: ResourceType.VIDEO,
      id: videoMatch[1],
      url: `https://www.youtube.com/watch?v=${videoMatch[1]}`
    };
  }

  // Try to match playlist URLs
  const playlistRegex = /(?:youtube\.com\/(?:.*[?&]list=))([\w-]+)/i;
  const playlistMatch = url.match(playlistRegex);

  if (playlistMatch && playlistMatch[1]) {
    return {
      type: ResourceType.PLAYLIST,
      id: playlistMatch[1],
      url: `https://www.youtube.com/playlist?list=${playlistMatch[1]}`
    };
  }

  return null;
};

/**
 * Creates a timestamp object from seconds
 */
export const createTimestamp = (seconds: number): YoutubeTimestamp => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  let formatted = '';
  if (hours > 0) {
    formatted = `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    formatted = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return {
    seconds,
    formatted
  };
};

/**
 * Extract video ID from a YouTube URL
 */
export const extractVideoId = (url: string): string | null => {
  const result = parseYoutubeUrl(url);
  return result?.type === ResourceType.VIDEO ? result.id : null;
};

/**
 * Extract playlist ID from a YouTube URL
 */
export const extractPlaylistId = (url: string): string | null => {
  const result = parseYoutubeUrl(url);
  return result?.type === ResourceType.PLAYLIST ? result.id : null;
};
