import { YoutubeParseResult, ResourceType, YoutubeTimestamp } from '@/types/youtube';

/**
 * Extracts video or playlist ID from a YouTube URL
 */
export function parseYoutubeUrl(url: string): YoutubeParseResult | null {
  try {
    const urlObj = new URL(url);
    
    // Handle youtube.com URLs
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      const playlistId = urlObj.searchParams.get('list');
      
      // Handle /playlist?list=PLAYLIST_ID
      if (urlObj.pathname === '/playlist' && playlistId) {
        return {
          type: ResourceType.PLAYLIST,
          id: playlistId,
          url: `https://www.youtube.com/playlist?list=${playlistId}`
        };
      }
      
      // Handle /watch?v=VIDEO_ID
      if (urlObj.pathname === '/watch' && videoId) {
        return {
          type: ResourceType.VIDEO,
          id: videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`
        };
      }
    }
    
    // Handle youtu.be short URLs
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1);
      if (videoId) {
        return {
          type: ResourceType.VIDEO,
          id: videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`
        };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Formats seconds into HH:MM:SS format
 */
export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const hStr = h > 0 ? `${h}:` : '';
  const mStr = h > 0 ? `${m < 10 ? '0' : ''}${m}:` : `${m}:`;
  const sStr = `${s < 10 ? '0' : ''}${s}`;
  
  return `${hStr}${mStr}${sStr}`;
}

/**
 * Converts HH:MM:SS format to seconds
 */
export function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // SS
    return parts[0];
  }
  
  return 0;
}

/**
 * Creates a timestamp object from seconds
 */
export const createTimestamp = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return {
    seconds,
    formatted: `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`,
  };
};

/**
 * Gets a placeholder thumbnail URL for a YouTube video
 */
export const getPlaceholderThumbnail = () => {
  return '/placeholder.svg';
};

/**
 * Formats duration from ISO 8601 format to human readable format
 * Example: PT1H23M45S -> 1:23:45
 */
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
