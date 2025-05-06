
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, HttpUrl, Field


class VideoMetadataRequest(BaseModel):
    """Request model for fetching video metadata."""
    
    url: str = Field(..., description="YouTube video URL")


class VideoMetadata(BaseModel):
    """Response model for video metadata."""
    
    platform: str = Field(..., description="Video platform (e.g., 'youtube')")
    video_id: str = Field(..., description="Unique video identifier")
    title: str = Field(..., description="Video title")
    thumbnail: Optional[str] = Field(None, description="Thumbnail URL")
    duration: Optional[int] = Field(None, description="Duration in seconds")
    upload_date: Optional[datetime] = Field(None, description="Upload date")
    channel: Optional[str] = Field(None, description="Channel name")


class DownloadRequest(BaseModel):
    """Request model for downloading videos."""
    
    video_url: str = Field(..., description="YouTube video URL")
    format: str = Field(..., description="Format to download (mp4 or mp3)")


class DownloadResponse(BaseModel):
    """Response model for download requests."""
    
    file_url: str = Field(..., description="URL to download the file")
    title: str = Field(..., description="Video title")
    size: Optional[int] = Field(None, description="File size in bytes")
    format: str = Field(..., description="File format")
