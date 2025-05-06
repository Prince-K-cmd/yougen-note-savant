
from typing import Dict, Any, Optional, List
import logging

from src.domain.entities.video import Video
from src.infrastructure.agents.video_agent import VideoAgent
from src.infrastructure.repositories.video_repository import VideoRepository

logger = logging.getLogger(__name__)


class YoutubeAnalysisUseCase:
    """Use case for YouTube video analysis."""
    
    def __init__(self, video_repository: VideoRepository):
        self.video_repository = video_repository
        self.video_agent = VideoAgent
    
    async def get_video_metadata(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a YouTube video.
        
        Args:
            url: YouTube video URL
            
        Returns:
            Video metadata or None if an error occurs
        """
        try:
            # Extract video ID
            video_id = self.video_agent.extract_video_id(url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {url}")
                return None
            
            # Check if we already have this video in the database
            existing_video = await self.video_repository.get_video_by_id(video_id)
            if existing_video:
                return {
                    "platform": existing_video.platform,
                    "video_id": existing_video.video_id,
                    "title": existing_video.title,
                    "thumbnail": existing_video.thumbnail,
                    "duration": existing_video.duration,
                    "upload_date": existing_video.upload_date,
                    "channel": existing_video.channel,
                }
            
            # Fetch metadata from YouTube
            metadata = await self.video_agent.get_video_metadata(url)
            if not metadata:
                logger.error(f"Failed to fetch metadata for {url}")
                return None
            
            # Save to database
            video = Video(
                video_id=metadata["video_id"],
                platform=metadata["platform"],
                title=metadata["title"],
                thumbnail=metadata["thumbnail"],
                duration=metadata["duration"],
                upload_date=metadata["upload_date"],
                channel=metadata["channel"],
            )
            
            saved_video = await self.video_repository.save_video(video)
            
            return {
                "platform": saved_video.platform,
                "video_id": saved_video.video_id,
                "title": saved_video.title,
                "thumbnail": saved_video.thumbnail,
                "duration": saved_video.duration,
                "upload_date": saved_video.upload_date,
                "channel": saved_video.channel,
            }
            
        except Exception as e:
            logger.error(f"Error in get_video_metadata use case for {url}: {e}")
            return None
    
    async def download_video(self, url: str, format_type: str = "mp4") -> Optional[Dict[str, Any]]:
        """
        Download a YouTube video.
        
        Args:
            url: YouTube video URL
            format_type: Format to download (mp4 or mp3)
            
        Returns:
            Download information or None if an error occurs
        """
        try:
            # Validate format type
            if format_type not in ["mp4", "mp3"]:
                logger.error(f"Invalid format type: {format_type}")
                return None
            
            # Extract video ID
            video_id = self.video_agent.extract_video_id(url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {url}")
                return None
            
            # Download video
            download_info = await self.video_agent.download_video(url, format_type)
            if not download_info:
                logger.error(f"Failed to download video {url}")
                return None
            
            # Generate file URL (in a real app, this would be a proper URL)
            file_url = f"/downloads/{download_info['video_id']}.{format_type}"
            
            return {
                "file_url": file_url,
                "title": download_info["title"],
                "size": download_info["file_size"],
                "format": download_info["format"],
            }
            
        except Exception as e:
            logger.error(f"Error in download_video use case for {url}: {e}")
            return None
