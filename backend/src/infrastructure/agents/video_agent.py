
import logging
from typing import Dict, Any, Optional
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
    async def download_video(cls, url: str, format_type: str = "mp4") -> Optional[Dict[str, Any]]:
        """
        Download a YouTube video.
        
        Args:
            url: YouTube video URL
            format_type: Format to download (mp4 or mp3)
            
        Returns:
            Download information or None if an error occurs
        """
        try:
            video_id = cls.extract_video_id(url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {url}")
                return None
                
            download_info = await DownloadTool.download_video(url, format_type)
            return download_info
            
        except Exception as e:
            logger.error(f"Error in download_video for {url}: {e}")
            return None
