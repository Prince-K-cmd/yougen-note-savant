
import os
import logging
import yt_dlp
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)


class DownloadTool:
    """Tool for downloading YouTube videos."""
    
    DOWNLOAD_DIR = os.path.join(os.getcwd(), "downloads")
    
    @classmethod
    async def get_metadata(cls, video_url: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a YouTube video.
        
        Args:
            video_url: YouTube video URL
            
        Returns:
            Video metadata or None if an error occurs
        """
        # Ensure the download directory exists
        os.makedirs(cls.DOWNLOAD_DIR, exist_ok=True)
        
        try:
            # Configure yt-dlp options
            ydl_opts = {
                "quiet": True,
                "no_warnings": True,
                "extract_flat": True,
            }
            
            # Extract info using yt-dlp
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # yt_dlp is not async, but we wrap it in an async method
                info = ydl.extract_info(video_url, download=False)
                
                # Extract relevant metadata
                metadata = {
                    "video_id": info.get("id"),
                    "platform": "youtube",  # Assuming YouTube for now
                    "title": info.get("title"),
                    "thumbnail": info.get("thumbnail"),
                    "duration": info.get("duration"),
                    "upload_date": info.get("upload_date"),
                    "channel": info.get("uploader"),
                }
                
                return metadata
                
        except Exception as e:
            logger.error(f"Error extracting metadata for {video_url}: {e}")
            return None
    
    @classmethod
    async def download_video(cls, video_url: str, format_type: str = "mp4") -> Optional[Dict[str, Any]]:
        """
        Download a YouTube video.
        
        Args:
            video_url: YouTube video URL
            format_type: Format to download (mp4 or mp3)
            
        Returns:
            Download information or None if an error occurs
        """
        # Ensure the download directory exists
        os.makedirs(cls.DOWNLOAD_DIR, exist_ok=True)
        
        try:
            # Configure yt-dlp options based on format
            if format_type.lower() == "mp3":
                # Audio-only download
                ydl_opts = {
                    "format": "bestaudio/best",
                    "postprocessors": [{
                        "key": "FFmpegExtractAudio",
                        "preferredcodec": "mp3",
                        "preferredquality": "192",
                    }],
                    "outtmpl": os.path.join(cls.DOWNLOAD_DIR, "%(id)s.%(ext)s"),
                }
                final_ext = "mp3"
            else:
                # Video download (default to mp4)
                ydl_opts = {
                    "format": "best[ext=mp4]/best",
                    "outtmpl": os.path.join(cls.DOWNLOAD_DIR, "%(id)s.%(ext)s"),
                }
                final_ext = "mp4"
            
            # Download using yt-dlp
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # yt_dlp is not async, but we wrap it in an async method
                info = ydl.extract_info(video_url, download=True)
                
                # Construct the file path
                video_id = info.get("id")
                file_path = os.path.join(cls.DOWNLOAD_DIR, f"{video_id}.{final_ext}")
                
                # Get file size
                file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
                
                return {
                    "video_id": video_id,
                    "title": info.get("title"),
                    "format": format_type.lower(),
                    "file_path": file_path,
                    "file_size": file_size,
                }
                
        except Exception as e:
            logger.error(f"Error downloading {video_url}: {e}")
            return None
