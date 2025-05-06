
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ...infrastructure.repositories.history_repository import HistoryRepository

router = APIRouter(tags=["downloads"])

class DownloadHistoryResponse(BaseModel):
    id: str
    video_id: Optional[str] = None
    title: str
    thumbnail: Optional[str] = None
    format: str
    file_size: Optional[int] = None
    file_path: Optional[str] = None
    status: str
    download_date: str

@router.get("/downloads")
async def get_downloads() -> List[DownloadHistoryResponse]:
    """Get user's download history."""
    try:
        download_items = HistoryRepository.get_download_history()
        
        # Convert to response model
        response = []
        for item in download_items:
            response.append(DownloadHistoryResponse(
                id=str(item["id"]),
                video_id=item["video_id"],
                title=item["title"],
                thumbnail=item["thumbnail"],
                format=item["format"],
                file_size=item["file_size"],
                file_path=item["file_path"],
                status=item["status"],
                download_date=item["download_date"]
            ))
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving download history: {str(e)}")

@router.get("/downloads/{download_id}")
async def get_download_detail(download_id: int) -> DownloadHistoryResponse:
    """Get details for a specific download."""
    try:
        download_item = HistoryRepository.get_download_detail(download_id)
        
        if not download_item:
            raise HTTPException(status_code=404, detail=f"Download with ID {download_id} not found")
        
        return DownloadHistoryResponse(
            id=download_item["id"],
            video_id=download_item["video_id"],
            title=download_item["title"],
            thumbnail=download_item["thumbnail"],
            format=download_item["format"],
            file_size=download_item["file_size"],
            file_path=download_item["file_path"],
            status=download_item["status"],
            download_date=download_item["download_date"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving download detail: {str(e)}")
