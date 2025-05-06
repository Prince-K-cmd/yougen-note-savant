
from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class DownloadStatus(str, Enum):
    COMPLETED = "completed"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"

class DownloadHistory(BaseModel):
    id: str = Field(..., description="Unique identifier for the download")
    video_id: Optional[str] = Field(None, description="YouTube video ID, if applicable")
    playlist_id: Optional[str] = Field(None, description="YouTube playlist ID, if applicable")
    title: str = Field(..., description="Title of the video or playlist")
    thumbnail: Optional[str] = Field(None, description="URL to thumbnail image")
    format: str = Field(..., description="Format of the download (mp3, mp4)")
    resolution: Optional[str] = Field(None, description="Resolution for video downloads")
    size: Optional[int] = Field(None, description="File size in bytes")
    status: DownloadStatus = Field(..., description="Status of the download")
    download_date: datetime = Field(..., description="Date and time when download was initiated")
    file_path: Optional[str] = Field(None, description="Path to the downloaded file")
    
    class Config:
        use_enum_values = True

class BatchDownloadTask(BaseModel):
    task_id: str = Field(..., description="Unique identifier for the batch download task")
    playlist_id: str = Field(..., description="YouTube playlist ID")
    format: str = Field(..., description="Format of the downloads (mp3, mp4)")
    resolution: Optional[str] = Field(None, description="Resolution for video downloads")
    total: int = Field(..., description="Total number of videos to download")
    completed: int = Field(0, description="Number of completed downloads")
    failed: int = Field(0, description="Number of failed downloads")
    status: DownloadStatus = Field(DownloadStatus.IN_PROGRESS, description="Status of the batch download")
    created_at: datetime = Field(default_factory=datetime.now, description="Task creation date")
    updated_at: datetime = Field(default_factory=datetime.now, description="Task last update date")
    downloads: List[str] = Field(default_factory=list, description="IDs of individual downloads in this batch")
