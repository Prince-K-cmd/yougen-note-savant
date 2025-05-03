
import { YoutubeParseResult, ResourceType, VideoMetadata, PlaylistMetadata } from '@/types/youtube';

// Function to get a placeholder thumbnail for videos or playlists
export const getPlaceholderThumbnail = () => {
  return '/placeholder.svg';
};

// Function to parse YouTube URLs and extract video or playlist IDs
export const parseYoutubeUrl = (url: string): YoutubeParseResult | null => {
  // Video ID regex patterns
  const videoRegexPatterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^?]+)/
  ];

  // Playlist ID regex pattern
  const playlistRegexPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([^&]+)/;

  // Check for video ID
  for (const pattern of videoRegexPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        type: ResourceType.VIDEO,
        id: match[1],
        url: `https://www.youtube.com/watch?v=${match[1]}`
      };
    }
  }

  // Check for playlist ID
  const playlistMatch = url.match(playlistRegexPattern);
  if (playlistMatch && playlistMatch[1]) {
    return {
      type: ResourceType.PLAYLIST,
      id: playlistMatch[1],
      url: `https://www.youtube.com/playlist?list=${playlistMatch[1]}`
    };
  }

  return null;
};

// Extract video ID from YouTube URL
export const extractVideoId = (url: string): string | null => {
  const result = parseYoutubeUrl(url);
  return result?.type === ResourceType.VIDEO ? result.id : null;
};

// Extract playlist ID from YouTube URL
export const extractPlaylistId = (url: string): string | null => {
  const result = parseYoutubeUrl(url);
  return result?.type === ResourceType.PLAYLIST ? result.id : null;
};

// Format YouTube video duration
export const formatDuration = (duration: string): string => {
  // YouTube API returns duration in ISO 8601 format (PT#H#M#S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return '0:00';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

// Format view count with commas
export const formatViewCount = (viewCount: string): string => {
  const count = parseInt(viewCount);
  return count.toLocaleString();
};

// Get appropriate thumbnail URL from YouTube video
export const getThumbnailUrl = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string => {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};
