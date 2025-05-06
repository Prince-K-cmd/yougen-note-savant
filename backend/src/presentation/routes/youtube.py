
from fastapi import APIRouter, Depends, HTTPException, WebSocket, Query
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio

from ...application.use_cases.youtube_analysis import YoutubeAnalysisUseCase
from ...domain.entities.video import VideoMetadata, VideoFormat, VideoDownloadRequest
from ...domain.entities.download import DownloadHistory
from ...infrastructure.tools.download_tool import DownloadTool
from ..websocket import WebSocketManager

router = APIRouter(prefix="/youtube", tags=["youtube"])
websocket_manager = WebSocketManager()

# Models for responses
class VideoResponse(BaseModel):
    platform: str
    video_id: str
    title: str
    thumbnail: Optional[str] = None
    duration: Optional[int] = None
    upload_date: Optional[str] = None
    channel: Optional[str] = None

class FormatResponse(BaseModel):
    format_id: str
    extension: str
    resolution: str
    filesize_approx: Optional[int] = None
    format_note: Optional[str] = None

class FormatsResponse(BaseModel):
    formats: List[FormatResponse]
    video_id: str
    title: str

class DownloadResponse(BaseModel):
    file_url: str
    title: str
    size: Optional[int] = None
    format: str
    resolution: Optional[str] = None

class BatchDownloadResponse(BaseModel):
    task_id: str
    total_videos: int

class PlaylistResponse(BaseModel):
    platform: str
    playlist_id: str
    title: str
    thumbnail: Optional[str] = None
    item_count: Optional[int] = None
    channel: Optional[str] = None
    videos: List[VideoResponse]

class TranscriptResponse(BaseModel):
    video_id: str
    language: str
    segments: List[Dict[str, Any]]

class DownloadHistoryResponse(BaseModel):
    id: str
    video_id: Optional[str] = None
    playlist_id: Optional[str] = None
    title: str
    thumbnail: Optional[str] = None
    format: str
    resolution: Optional[str] = None
    size: Optional[int] = None
    status: str
    download_date: str
    file_path: Optional[str] = None

# Routes
@router.get("/metadata")
async def get_metadata(url: HttpUrl, analysis_use_case: YoutubeAnalysisUseCase = Depends()) -> VideoResponse:
    """Get metadata for a YouTube video."""
    metadata = await analysis_use_case.extract_video_metadata(url)
    if not metadata:
        raise HTTPException(status_code=404, detail="Could not extract video metadata")
    return metadata

@router.post("/formats")
async def get_formats(request: dict) -> FormatsResponse:
    """Get available formats for a YouTube video."""
    video_url = request.get("video_url")
    if not video_url:
        raise HTTPException(status_code=400, detail="Missing video_url parameter")
    
    formats_info = await DownloadTool.get_available_formats(video_url)
    if not formats_info:
        raise HTTPException(status_code=404, detail="Could not extract format information")
    
    return FormatsResponse(**formats_info)

@router.post("/download")
async def download_video(request: VideoDownloadRequest) -> DownloadResponse:
    """Download a YouTube video."""
    # This would actually download the video and store a history record
    # For now, we'll simulate the response
    
    # In a real implementation, you would:
    # 1. Download the video using DownloadTool
    # 2. Store download history in database
    # 3. Return download information
    
    download_info = await DownloadTool.download_video(
        request.video_url,
        request.format,
        request.resolution,
    )
    
    if not download_info:
        raise HTTPException(status_code=500, detail="Download failed")
    
    # Create simulated response
    response = DownloadResponse(
        file_url=f"/downloads/{download_info['video_id']}.{download_info['format']}",
        title=download_info['title'],
        size=download_info.get('file_size'),
        format=download_info['format'],
        resolution=download_info.get('resolution')
    )
    
    # In a real implementation, you would save this to your database
    # downloads_repository.save_download_history(...)
    
    return response

@router.get("/playlist")
async def get_playlist(url: HttpUrl, analysis_use_case: YoutubeAnalysisUseCase = Depends()) -> PlaylistResponse:
    """Get metadata for a YouTube playlist."""
    playlist_info = await DownloadTool.get_playlist_info(str(url))
    if not playlist_info:
        raise HTTPException(status_code=404, detail="Could not extract playlist information")
    
    return PlaylistResponse(**playlist_info)

@router.post("/download/batch")
async def download_playlist(request: dict) -> BatchDownloadResponse:
    """Download all videos in a YouTube playlist."""
    playlist_url = request.get("playlist_url")
    format_type = request.get("format", "mp4")
    resolution = request.get("resolution")
    
    if not playlist_url:
        raise HTTPException(status_code=400, detail="Missing playlist_url parameter")
    
    # Get playlist info
    playlist_info = await DownloadTool.get_playlist_info(playlist_url)
    if not playlist_info:
        raise HTTPException(status_code=404, detail="Could not extract playlist information")
    
    # In a real implementation, you would:
    # 1. Create a background task to download all videos
    # 2. Store the task ID and return it
    # 3. Update progress via WebSocket
    
    task_id = "task_" + datetime.now().strftime("%Y%m%d%H%M%S")
    total_videos = len(playlist_info["videos"])
    
    # Just for simulation, we'll create a task that sends WebSocket updates
    asyncio.create_task(
        simulate_batch_download(task_id, playlist_info, format_type, resolution)
    )
    
    return BatchDownloadResponse(task_id=task_id, total_videos=total_videos)

@router.get("/transcript")
async def get_transcript(
    video_id: str,
    language: str = "en",
    analysis_use_case: YoutubeAnalysisUseCase = Depends()
) -> TranscriptResponse:
    """Get transcript for a YouTube video."""
    transcript = await analysis_use_case.get_transcript(video_id, language)
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
        
    return TranscriptResponse(
        video_id=video_id,
        language=language,
        segments=transcript["segments"]
    )

@router.get("/downloads/history")
async def get_download_history() -> List[DownloadHistoryResponse]:
    """Get download history."""
    # In a real implementation, you would fetch this from a database
    # Here, we'll return simulated data
    
    # Simulate download history
    now = datetime.now()
    history = [
        DownloadHistoryResponse(
            id="dl_001",
            video_id="dQw4w9WgXcQ",
            title="Never Gonna Give You Up",
            thumbnail="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            format="mp4",
            resolution="720",
            size=15728640,  # 15MB
            status="completed",
            download_date=(now - timedelta(days=1)).isoformat(),
            file_path="/downloads/dQw4w9WgXcQ.mp4"
        ),
        DownloadHistoryResponse(
            id="dl_002",
            video_id="9bZkp7q19f0",
            title="PSY - GANGNAM STYLE",
            thumbnail="https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
            format="mp3",
            size=5242880,  # 5MB
            status="completed",
            download_date=(now - timedelta(days=2)).isoformat(),
            file_path="/downloads/9bZkp7q19f0.mp3"
        ),
        DownloadHistoryResponse(
            id="dl_003",
            playlist_id="PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI",
            title="Top Music Videos Playlist",
            format="mp4",
            resolution="480",
            status="in_progress",
            download_date=now.isoformat()
        ),
        DownloadHistoryResponse(
            id="dl_004",
            video_id="kJQP7kiw5Fk",
            title="Luis Fonsi - Despacito ft. Daddy Yankee",
            thumbnail="https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
            format="mp4",
            resolution="1080",
            size=52428800,  # 50MB
            status="failed",
            download_date=(now - timedelta(hours=5)).isoformat()
        ),
    ]
    
    return history

@router.get("/downloads/{download_id}")
async def get_download_details(download_id: str) -> DownloadHistoryResponse:
    """Get details for a specific download."""
    # In a real implementation, you would fetch this from a database
    # For now, we'll simulate the response
    
    now = datetime.now()
    
    # Just return a simulated record
    if download_id == "dl_001":
        return DownloadHistoryResponse(
            id="dl_001",
            video_id="dQw4w9WgXcQ",
            title="Never Gonna Give You Up",
            thumbnail="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            format="mp4",
            resolution="720",
            size=15728640,  # 15MB
            status="completed",
            download_date=(now - timedelta(days=1)).isoformat(),
            file_path="/downloads/dQw4w9WgXcQ.mp4"
        )
    
    # If the download_id is not found
    raise HTTPException(status_code=404, detail=f"Download with ID {download_id} not found")

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket connection for real-time download updates."""
    connection_id = await websocket_manager.connect(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            # In a real implementation, you would process WebSocket messages here
            await websocket_manager.send_personal_message({"type": "ack", "data": {"message": "Message received"}}, connection_id)
    except Exception as e:
        websocket_manager.disconnect(websocket)

# Simulated background task to demonstrate WebSocket updates
async def simulate_batch_download(task_id: str, playlist_info: dict, format_type: str, resolution: str):
    """Simulate a batch download process with progress updates via WebSocket."""
    videos = playlist_info["videos"]
    total = len(videos)
    
    for i, video in enumerate(videos):
        # Simulate download progress
        await websocket_manager.broadcast({
            "type": "download_progress",
            "data": {
                "task_id": task_id,
                "completed": i,
                "failed": 0,
                "total": total,
                "percentage": int((i / total) * 100),
                "current_video": video["title"]
            }
        })
        
        # Simulate download time
        await asyncio.sleep(1)
    
    # Final update - all complete
    await websocket_manager.broadcast({
        "type": "download_complete",
        "data": {
            "task_id": task_id,
            "completed": total,
            "failed": 0,
            "total": total
        }
    })
