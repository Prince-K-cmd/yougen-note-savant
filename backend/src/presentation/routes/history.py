
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ...infrastructure.repositories.history_repository import HistoryRepository

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
    try:
        history_items = HistoryRepository.get_user_history()
        
        # Convert to response model
        response = []
        for item in history_items:
            response.append(NoteHistoryResponse(
                id=item["id"],
                title=item["title"],
                content_text=item["content_text"],
                video_id=item["video_id"],
                created_at=item["created_at"],
                updated_at=item["updated_at"]
            ))
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")

@router.get("/history/{history_id}")
async def get_history_detail(history_id: int) -> NoteHistoryResponse:
    """Get details for a specific history item."""
    try:
        history_item = HistoryRepository.get_history_detail(history_id)
        
        if not history_item:
            raise HTTPException(status_code=404, detail=f"History item with ID {history_id} not found")
        
        return NoteHistoryResponse(
            id=history_item["id"],
            title=history_item["title"],
            content_text=history_item["content_text"],
            video_id=history_item["video_id"],
            created_at=history_item["created_at"],
            updated_at=history_item["updated_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history detail: {str(e)}")
