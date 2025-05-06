
from datetime import datetime
from typing import List, Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class Note:
    """Note entity representing a user note for a video."""
    
    video_id: str
    content: Dict[str, Any]  # Lexical JSON content
    content_text: str  # Plain text extracted from content
    timestamp: Optional[int] = None
    tags: Optional[List[str]] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
