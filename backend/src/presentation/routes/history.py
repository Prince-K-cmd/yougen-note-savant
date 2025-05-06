
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random

router = APIRouter(tags=["history"])

class NoteHistoryResponse(BaseModel):
    id: int
    title: str
    content_text: str
    video_id: Optional[str] = None
    created_at: str
    updated_at: str

@router.get("/history")
async def get_history() -> List[NoteHistoryResponse]:
    """Get user's history of note activities."""
    # In a real implementation, you would fetch this from a database
    # For now, we'll return simulated data
    
    # Generate random dates within the last week
    now = datetime.now()
    
    # Simulated history data
    history = []
    
    # Today's notes
    for i in range(3):
        created = now - timedelta(hours=random.randint(1, 8))
        updated = created + timedelta(minutes=random.randint(10, 60))
        history.append(NoteHistoryResponse(
            id=i+1,
            title=f"Today's Note {i+1}",
            content_text=f"This is a note created today. It contains some sample content for testing purposes.",
            video_id="dQw4w9WgXcQ" if i % 2 == 0 else None,
            created_at=created.isoformat(),
            updated_at=updated.isoformat()
        ))
    
    # This week's notes
    for i in range(4):
        days_ago = random.randint(1, 6)
        created = now - timedelta(days=days_ago, hours=random.randint(1, 12))
        updated = created + timedelta(minutes=random.randint(10, 120))
        history.append(NoteHistoryResponse(
            id=i+4,
            title=f"Weekly Note {i+1}",
            content_text=f"This is a note created {days_ago} days ago. It has some content that demonstrates the history view.",
            video_id="9bZkp7q19f0" if i % 2 == 0 else None,
            created_at=created.isoformat(),
            updated_at=updated.isoformat()
        ))
    
    # Older notes
    for i in range(5):
        days_ago = random.randint(7, 30)
        created = now - timedelta(days=days_ago, hours=random.randint(1, 12))
        updated = created + timedelta(hours=random.randint(1, 48))
        history.append(NoteHistoryResponse(
            id=i+8,
            title=f"Archived Note {i+1}",
            content_text=f"This is an older note created {days_ago} days ago. This appears in the 'Older' section of the history.",
            video_id="kJQP7kiw5Fk" if i % 2 == 0 else None,
            created_at=created.isoformat(),
            updated_at=updated.isoformat()
        ))
    
    return history

@router.get("/history/{history_id}")
async def get_history_detail(history_id: int) -> NoteHistoryResponse:
    """Get details for a specific history item."""
    # In a real implementation, you would fetch this from a database
    # For now, we'll return simulated data or 404
    
    if 1 <= history_id <= 12:
        now = datetime.now()
        days_ago = random.randint(0, 14)
        created = now - timedelta(days=days_ago, hours=random.randint(1, 12))
        updated = created + timedelta(hours=random.randint(1, 48))
        
        return NoteHistoryResponse(
            id=history_id,
            title=f"Note {history_id}",
            content_text=f"This is note {history_id} with detailed content. It was created {days_ago} days ago.",
            video_id="dQw4w9WgXcQ" if history_id % 3 == 0 else None,
            created_at=created.isoformat(),
            updated_at=updated.isoformat()
        )
    
    raise HTTPException(status_code=404, detail=f"History item with ID {history_id} not found")
