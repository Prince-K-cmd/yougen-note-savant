
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


class PlaylistMetadataRequest(BaseModel):
    """Request model for fetching playlist metadata."""
    
    url: str = Field(..., description="YouTube playlist URL")


class PlaylistMetadata(BaseModel):
    """Response model for playlist metadata."""
    
    platform: str = Field(..., description="Video platform (e.g., 'youtube')")
    playlist_id: str = Field(..., description="Unique playlist identifier")
    title: str = Field(..., description="Playlist title")
    thumbnail: Optional[str] = Field(None, description="Thumbnail URL")
    item_count: Optional[int] = Field(None, description="Number of videos in playlist")
    channel: Optional[str] = Field(None, description="Channel name")
    videos: List[VideoMetadata] = Field(default_factory=list, description="Videos in the playlist")


class TranscriptSegment(BaseModel):
    """Model for a transcript segment."""
    
    text: str = Field(..., description="Segment text")
    start: float = Field(..., description="Start time in seconds")
    duration: float = Field(..., description="Duration in seconds")


class TranscriptRequest(BaseModel):
    """Request model for fetching video transcript."""
    
    video_id: str = Field(..., description="YouTube video ID")
    language: str = Field("en", description="Language code")


class VideoFormat(BaseModel):
    """Model for video format information."""
    
    format_id: str = Field(..., description="Format identifier")
    extension: str = Field(..., description="File extension")
    resolution: str = Field(..., description="Video resolution")
    filesize_approx: Optional[int] = Field(None, description="Approximate file size in bytes")
    format_note: Optional[str] = Field(None, description="Format description")


class DownloadRequest(BaseModel):
    """Request model for downloading videos."""
    
    video_url: str = Field(..., description="YouTube video URL")
    format: str = Field("mp4", description="File format (mp4 or mp3)")
    resolution: Optional[str] = Field("720", description="Video resolution for mp4 (240, 360, 480, 720, 1080)")


class BatchDownloadRequest(BaseModel):
    """Request model for batch downloading videos."""
    
    playlist_url: str = Field(..., description="YouTube playlist URL")
    format: str = Field("mp4", description="Format to download (mp4 or mp3)")
    resolution: Optional[str] = Field("720", description="Video resolution for mp4 (240, 360, 480, 720, 1080)")


class DownloadResponse(BaseModel):
    """Response model for download requests."""
    
    file_url: str = Field(..., description="URL to download the file")
    title: str = Field(..., description="Video title")
    size: Optional[int] = Field(None, description="File size in bytes")
    format: str = Field(..., description="File format")
    resolution: Optional[str] = Field(None, description="Video resolution (for mp4)")


class BatchDownloadResponse(BaseModel):
    """Response model for batch download requests."""
    
    task_id: str = Field(..., description="Task ID for tracking progress")
    total_videos: int = Field(..., description="Total number of videos to download")


class FormatListRequest(BaseModel):
    """Request model for listing available formats."""
    
    video_url: str = Field(..., description="YouTube video URL")


class FormatListResponse(BaseModel):
    """Response model for listing available formats."""
    
    formats: List[VideoFormat] = Field(default_factory=list, description="Available video formats")
    video_id: str = Field(..., description="YouTube video ID")
    title: str = Field(..., description="Video title")
