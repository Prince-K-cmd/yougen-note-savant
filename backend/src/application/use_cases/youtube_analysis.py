
from typing import Dict, Any, Optional, List
import logging
import uuid

from src.domain.entities.video import Video
from src.infrastructure.agents.video_agent import VideoAgent
from src.infrastructure.repositories.video_repository import VideoRepository
from src.presentation.websocket import WebSocketManager

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

    async def get_playlist_metadata(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a YouTube playlist, including video details.
        
        Args:
            url: YouTube playlist URL
            
        Returns:
            Playlist metadata or None if an error occurs
        """
        try:
            # Extract playlist ID
            playlist_id = self.video_agent.extract_playlist_id(url)
            if not playlist_id:
                logger.error(f"Invalid YouTube playlist URL: {url}")
                return None
            
            # Fetch playlist metadata from YouTube
            playlist_data = await self.video_agent.get_playlist_metadata(url)
            if not playlist_data:
                logger.error(f"Failed to fetch playlist metadata for {url}")
                return None
            
            # Save videos from playlist to database
            videos = []
            for video_data in playlist_data.get("videos", []):
                video = Video(
                    video_id=video_data["video_id"],
                    platform=video_data["platform"],
                    title=video_data["title"],
                    thumbnail=video_data["thumbnail"],
                    duration=video_data["duration"],
                    upload_date=video_data["upload_date"],
                    channel=video_data["channel"],
                )
                
                await self.video_repository.save_video(video)
                videos.append(video_data)
            
            return {
                "platform": "youtube",
                "playlist_id": playlist_id,
                "title": playlist_data["title"],
                "thumbnail": playlist_data["thumbnail"],
                "item_count": playlist_data["item_count"],
                "channel": playlist_data["channel"],
                "videos": videos,
            }
            
        except Exception as e:
            logger.error(f"Error in get_playlist_metadata use case for {url}: {e}")
            return None
    
    async def get_video_transcript(self, url: str, language: str = "en") -> Optional[List[Dict[str, Any]]]:
        """
        Get transcript for a YouTube video.
        
        Args:
            url: YouTube video URL
            language: Language code
            
        Returns:
            List of transcript segments or None if not available
        """
        try:
            video_id = self.video_agent.extract_video_id(url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {url}")
                return None
                
            transcript_segments = await self.video_agent.get_transcript_segments(video_id, language)
            return transcript_segments
            
        except Exception as e:
            logger.error(f"Error in get_video_transcript use case for {url}: {e}")
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

    async def download_playlist(
        self, 
        url: str, 
        format_type: str, 
        task_id: str,
        websocket_manager: WebSocketManager
    ) -> None:
        """
        Download all videos in a YouTube playlist.
        
        Args:
            url: YouTube playlist URL
            format_type: Format to download (mp4 or mp3)
            task_id: Task ID for tracking progress
            websocket_manager: WebSocket manager for progress updates
        """
        try:
            # Get playlist metadata
            playlist_data = await self.get_playlist_metadata(url)
            if not playlist_data:
                await websocket_manager.broadcast({
                    "type": "download_error",
                    "data": {
                        "task_id": task_id,
                        "message": "Failed to fetch playlist metadata",
                    }
                })
                return
            
            videos = playlist_data.get("videos", [])
            total_videos = len(videos)
            completed = 0
            failed = 0
            
            # Send initial progress update
            await websocket_manager.broadcast({
                "type": "download_progress",
                "data": {
                    "task_id": task_id,
                    "completed": completed,
                    "failed": failed,
                    "total": total_videos,
                    "percentage": 0,
                }
            })
            
            # Download each video in the playlist
            for video_data in videos:
                try:
                    video_url = f"https://www.youtube.com/watch?v={video_data['video_id']}"
                    download_info = await self.download_video(video_url, format_type)
                    
                    if download_info:
                        completed += 1
                    else:
                        failed += 1
                    
                    # Send progress update
                    await websocket_manager.broadcast({
                        "type": "download_progress",
                        "data": {
                            "task_id": task_id,
                            "completed": completed,
                            "failed": failed,
                            "total": total_videos,
                            "percentage": int((completed + failed) * 100 / total_videos),
                            "current_video": video_data["title"],
                        }
                    })
                    
                except Exception as e:
                    logger.error(f"Error downloading video {video_data['video_id']}: {e}")
                    failed += 1
            
            # Send completion update
            await websocket_manager.broadcast({
                "type": "download_complete",
                "data": {
                    "task_id": task_id,
                    "completed": completed,
                    "failed": failed,
                    "total": total_videos,
                }
            })
            
        except Exception as e:
            logger.error(f"Error in download_playlist use case for {url}: {e}")
            await websocket_manager.broadcast({
                "type": "download_error",
                "data": {
                    "task_id": task_id,
                    "message": str(e),
                }
            })
