
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class NoteRequest(BaseModel):
    """Request model for saving notes."""
    
    video_url: str = Field(..., description="YouTube video URL")
    content: Dict[str, Any] = Field(..., description="Lexical JSON content")
    timestamp: Optional[int] = Field(None, description="Timestamp in seconds")
    tags: Optional[List[str]] = Field(None, description="List of tags")


class NoteResponse(BaseModel):
    """Response model for notes."""
    
    id: int = Field(..., description="Note ID")
    video_url: str = Field(..., description="YouTube video URL")
    video_id: str = Field(..., description="YouTube video ID")
    content: Dict[str, Any] = Field(..., description="Lexical JSON content")
    timestamp: Optional[int] = Field(None, description="Timestamp in seconds")
    tags: Optional[List[str]] = Field(None, description="List of tags")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
