
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request model for AI chat."""
    
    video_url: str = Field(..., description="YouTube video URL")
    message: str = Field(..., description="User message")
    language: str = Field("en", description="Language code (e.g., 'en', 'es')")


class ChatResponse(BaseModel):
    """Response model for AI chat."""
    
    response: str = Field(..., description="AI response")
    suggestions: List[str] = Field(
        default_factory=list, description="Suggested follow-up questions"
    )
    video_id: str = Field(..., description="YouTube video ID")
