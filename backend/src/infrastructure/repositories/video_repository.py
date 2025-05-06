
from typing import Optional, List
from datetime import datetime
from src.domain.entities.video import Video
from src.infrastructure.db.connection import db


class VideoRepository:
    """Repository for video data."""
    
    async def save_video(self, video: Video) -> Video:
        """Save a video to the database."""
        query = """
        INSERT INTO videos (video_id, platform, title, thumbnail, duration, upload_date, channel)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (video_id) DO UPDATE SET
            title = $3,
            thumbnail = $4,
            duration = $5,
            upload_date = $6,
            channel = $7
        RETURNING id, video_id, platform, title, thumbnail, duration, upload_date, channel, created_at
        """
        
        row = await db.fetchone(
            query,
            video.video_id,
            video.platform,
            video.title,
            video.thumbnail,
            video.duration,
            video.upload_date,
            video.channel,
        )
        
        return Video(
            video_id=row["video_id"],
            platform=row["platform"],
            title=row["title"],
            thumbnail=row["thumbnail"],
            duration=row["duration"],
            upload_date=row["upload_date"],
            channel=row["channel"],
            created_at=row["created_at"],
        )
    
    async def get_video_by_id(self, video_id: str) -> Optional[Video]:
        """Get a video by ID."""
        query = """
        SELECT video_id, platform, title, thumbnail, duration, upload_date, channel, created_at
        FROM videos
        WHERE video_id = $1
        """
        
        row = await db.fetchone(query, video_id)
        
        if not row:
            return None
            
        return Video(
            video_id=row["video_id"],
            platform=row["platform"],
            title=row["title"],
            thumbnail=row["thumbnail"],
            duration=row["duration"],
            upload_date=row["upload_date"],
            channel=row["channel"],
            created_at=row["created_at"],
        )
