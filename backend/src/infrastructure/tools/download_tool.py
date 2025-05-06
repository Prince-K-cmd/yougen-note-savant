
import os
import logging
import yt_dlp
import subprocess
from typing import Dict, Any, Optional, Tuple, List

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
    async def get_playlist_info(cls, playlist_url: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a YouTube playlist.
        
        Args:
            playlist_url: YouTube playlist URL
            
        Returns:
            Playlist information or None if an error occurs
        """
        try:
            # Configure yt-dlp options
            ydl_opts = {
                "quiet": True,
                "no_warnings": True,
                "extract_flat": True,
                "ignoreerrors": True,
            }
            
            # Extract info using yt-dlp
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # yt_dlp is not async, but we wrap it in an async method
                info = ydl.extract_info(playlist_url, download=False)
                
                if not info:
                    logger.error(f"Failed to extract playlist info for {playlist_url}")
                    return None
                
                # Get playlist metadata
                playlist_metadata = {
                    "platform": "youtube",
                    "playlist_id": info.get("id"),
                    "title": info.get("title"),
                    "thumbnail": info.get("thumbnail"),
                    "item_count": info.get("playlist_count"),
                    "channel": info.get("uploader"),
                    "videos": [],
                }
                
                # Extract video entries
                entries = info.get("entries", [])
                videos = []
                
                for entry in entries:
                    if not entry:
                        continue
                    
                    video_metadata = {
                        "video_id": entry.get("id"),
                        "platform": "youtube",
                        "title": entry.get("title"),
                        "thumbnail": entry.get("thumbnail"),
                        "duration": entry.get("duration"),
                        "upload_date": entry.get("upload_date"),
                        "channel": entry.get("uploader"),
                    }
                    
                    videos.append(video_metadata)
                
                playlist_metadata["videos"] = videos
                return playlist_metadata
                
        except Exception as e:
            logger.error(f"Error extracting playlist info for {playlist_url}: {e}")
            return None
    
    @classmethod
    async def get_available_formats(cls, video_url: str) -> Optional[Dict[str, Any]]:
        """
        Get available formats for a YouTube video.
        
        Args:
            video_url: YouTube video URL
            
        Returns:
            Dictionary with available formats or None if an error occurs
        """
        try:
            # Configure yt-dlp options
            ydl_opts = {
                "quiet": True,
                "no_warnings": True,
                "listformats": True,
            }
            
            # Extract info using yt-dlp
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                if not info:
                    logger.error(f"Failed to extract format info for {video_url}")
                    return None
                
                # Filter and organize formats
                formats = []
                valid_resolutions = ["240", "360", "480", "720", "1080"]
                
                for fmt in info.get("formats", []):
                    if fmt.get("vcodec") != "none" and fmt.get("acodec") != "none":
                        resolution = fmt.get("height")
                        if resolution and str(resolution) in valid_resolutions:
                            formats.append({
                                "format_id": fmt.get("format_id"),
                                "extension": fmt.get("ext"),
                                "resolution": f"{resolution}p",
                                "filesize_approx": fmt.get("filesize_approx"),
                                "format_note": fmt.get("format_note"),
                            })
                
                # Add audio-only format
                formats.append({
                    "format_id": "audio",
                    "extension": "mp3",
                    "resolution": "audio only",
                    "filesize_approx": None,
                    "format_note": "MP3 audio",
                })
                
                return {
                    "formats": formats,
                    "video_id": info.get("id"),
                    "title": info.get("title"),
                }
                
        except Exception as e:
            logger.error(f"Error extracting format info for {video_url}: {e}")
            return None
    
    @classmethod
    async def download_video(cls, video_url: str, format_type: str = "mp4", resolution: str = "720") -> Optional[Dict[str, Any]]:
        """
        Download a YouTube video.
        
        Args:
            video_url: YouTube video URL
            format_type: Format to download (mp4 or mp3)
            resolution: Video resolution for mp4 (240, 360, 480, 720, 1080)
            
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
                final_resolution = None
            else:
                # Video download with specific resolution
                format_spec = f"bestvideo[height<={resolution}]+bestaudio/best[height<={resolution}]"
                ydl_opts = {
                    "format": format_spec,
                    "outtmpl": os.path.join(cls.DOWNLOAD_DIR, "%(id)s.%(ext)s"),
                    "merge_output_format": "mp4",
                }
                final_ext = "mp4"
                final_resolution = f"{resolution}p"
            
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
                    "resolution": final_resolution,
                    "file_path": file_path,
                    "file_size": file_size,
                }
                
        except Exception as e:
            logger.error(f"Error downloading {video_url}: {e}")
            return None
