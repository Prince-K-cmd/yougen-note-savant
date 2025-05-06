
from datetime import datetime
from typing import Optional
from dataclasses import dataclass


@dataclass
class Video:
    """Video entity representing core video information."""
    
    video_id: str
    platform: str
    title: str
    thumbnail: Optional[str] = None
    duration: Optional[int] = None
    upload_date: Optional[datetime] = None
    channel: Optional[str] = None
    created_at: Optional[datetime] = None
