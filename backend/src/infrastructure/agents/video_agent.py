
import logging
from typing import Dict, Any, Optional, List
from urllib.parse import urlparse, parse_qs

from src.infrastructure.tools.download_tool import DownloadTool
from src.infrastructure.tools.transcript_tool import TranscriptTool

logger = logging.getLogger(__name__)


class VideoAgent:
    """Agent for handling video-related operations."""
    
    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """
        Extract the video ID from a YouTube URL.
        
        Args:
            url: YouTube URL
            
        Returns:
            Video ID or None if the URL is invalid
        """
        try:
            parsed_url = urlparse(url)
            
            # Handle youtube.com URLs
            if "youtube.com" in parsed_url.netloc:
                if parsed_url.path == "/watch":
                    return parse_qs(parsed_url.query).get("v", [None])[0]
                elif "/shorts/" in parsed_url.path:
                    return parsed_url.path.split("/shorts/")[1].split("/")[0]
            
            # Handle youtu.be URLs
            elif "youtu.be" in parsed_url.netloc:
                return parsed_url.path.lstrip("/").split("/")[0]
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting video ID from {url}: {e}")
            return None
    
    @staticmethod
    def extract_playlist_id(url: str) -> Optional[str]:
        """
        Extract the playlist ID from a YouTube URL.
        
        Args:
            url: YouTube URL
            
        Returns:
            Playlist ID or None if the URL is invalid
        """
        try:
            parsed_url = urlparse(url)
            
            # Handle youtube.com URLs
            if "youtube.com" in parsed_url.netloc:
                if parsed_url.path == "/playlist":
                    return parse_qs(parsed_url.query).get("list", [None])[0]
                elif "/watch" in parsed_url.path:
                    # Videos in a playlist also have a list parameter
                    return parse_qs(parsed_url.query).get("list", [None])[0]
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting playlist ID from {url}: {e}")
            return None
    
    @classmethod
    async def get_video_metadata(cls, url: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a YouTube video.
        
        Args:
            url: YouTube video URL
            
        Returns:
            Video metadata or None if an error occurs
        """
        try:
            video_id = cls.extract_video_id(url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {url}")
                return None
                
            metadata = await DownloadTool.get_metadata(url)
            if not metadata:
                logger.error(f"Failed to fetch metadata for {url}")
                return None
                
            return metadata
            
        except Exception as e:
            logger.error(f"Error in get_video_metadata for {url}: {e}")
            return None
    
    @classmethod
    async def get_playlist_metadata(cls, url: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a YouTube playlist.
        
        Args:
            url: YouTube playlist URL
            
        Returns:
            Playlist metadata or None if an error occurs
        """
        try:
            playlist_id = cls.extract_playlist_id(url)
            if not playlist_id:
                logger.error(f"Invalid YouTube playlist URL: {url}")
                return None
                
            playlist_data = await DownloadTool.get_playlist_info(url)
            if not playlist_data:
                logger.error(f"Failed to fetch playlist data for {url}")
                return None
                
            return playlist_data
            
        except Exception as e:
            logger.error(f"Error in get_playlist_metadata for {url}: {e}")
            return None
    
    @classmethod
    async def get_available_formats(cls, url: str) -> Optional[Dict[str, Any]]:
        """
        Get available formats for a YouTube video.
        
        Args:
            url: YouTube video URL
            
        Returns:
            Dictionary with format information or None if an error occurs
        """
        try:
            video_id = cls.extract_video_id(url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {url}")
                return None
                
            formats_info = await DownloadTool.get_available_formats(url)
            return formats_info
            
        except Exception as e:
            logger.error(f"Error getting available formats for {url}: {e}")
            return None
    
    @classmethod
    async def get_transcript_segments(cls, video_id: str, language: str = "en") -> Optional[List[Dict[str, Any]]]:
        """
        Get transcript segments for a YouTube video.
        
        Args:
            video_id: YouTube video ID
            language: Preferred language code
            
        Returns:
            List of transcript segments or None if not available
        """
        try:
            transcript_segments = await TranscriptTool.get_transcript(video_id, language)
            return transcript_segments
            
        except Exception as e:
            logger.error(f"Error fetching transcript segments for video {video_id}: {e}")
            return None
    
    @classmethod
    async def get_transcript(cls, url: str, language: str = "en") -> Optional[str]:
        """
        Get transcript text for a YouTube video.
        
        Args:
            url: YouTube video URL
            language: Preferred language code
            
        Returns:
            Transcript text or None if not available
        """
        try:
            video_id = cls.extract_video_id(url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {url}")
                return None
                
            transcript_text = await TranscriptTool.get_transcript_text(video_id, language)
            return transcript_text or None
            
        except Exception as e:
            logger.error(f"Error in get_transcript for {url}: {e}")
            return None
    
    @classmethod
    async def download_video(
        cls, 
        url: str, 
        format_type: str = "mp4", 
        resolution: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Download a YouTube video.
        
        Args:
            url: YouTube video URL
            format_type: Format to download (mp4 or mp3)
            resolution: Video resolution for mp4 (240, 360, 480, 720, 1080)
            
        Returns:
            Download information or None if an error occurs
        """
        try:
            video_id = cls.extract_video_id(url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {url}")
                return None
                
            download_info = await DownloadTool.download_video(url, format_type, resolution)
            return download_info
            
        except Exception as e:
            logger.error(f"Error in download_video for {url}: {e}")
            return None
