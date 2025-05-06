
from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from typing import Optional, List

from src.models.youtube import (
    VideoMetadataRequest, 
    VideoMetadata, 
    PlaylistMetadata,
    DownloadRequest, 
    BatchDownloadRequest,
    DownloadResponse, 
    BatchDownloadResponse
)
from src.application.use_cases.youtube_analysis import YoutubeAnalysisUseCase
from src.infrastructure.repositories.video_repository import VideoRepository
from src.presentation.websocket import WebSocketManager

router = APIRouter()

# Dependencies
async def get_youtube_use_case() -> YoutubeAnalysisUseCase:
    """Dependency for YoutubeAnalysisUseCase."""
    video_repository = VideoRepository()
    return YoutubeAnalysisUseCase(video_repository)


@router.get("/metadata", response_model=VideoMetadata)
async def get_video_metadata(
    url: str = Query(..., description="YouTube video URL"),
    use_case: YoutubeAnalysisUseCase = Depends(get_youtube_use_case),
):
    """
    Get metadata for a YouTube video.
    """
    metadata = await use_case.get_video_metadata(url)
    
    if not metadata:
        raise HTTPException(
            status_code=404,
            detail="Video metadata could not be retrieved. Check if the URL is valid.",
        )
    
    return VideoMetadata(**metadata)


@router.get("/playlist", response_model=PlaylistMetadata)
async def get_playlist_metadata(
    url: str = Query(..., description="YouTube playlist URL"),
    use_case: YoutubeAnalysisUseCase = Depends(get_youtube_use_case),
):
    """
    Get metadata for a YouTube playlist, including video details.
    """
    playlist_data = await use_case.get_playlist_metadata(url)
    
    if not playlist_data:
        raise HTTPException(
            status_code=404,
            detail="Playlist metadata could not be retrieved. Check if the URL is valid.",
        )
    
    return PlaylistMetadata(**playlist_data)


@router.get("/transcript")
async def get_transcript(
    video_id: str = Query(..., description="YouTube video ID"),
    language: str = Query("en", description="Language code"),
    use_case: YoutubeAnalysisUseCase = Depends(get_youtube_use_case),
):
    """
    Get the transcript for a YouTube video.
    """
    transcript = await use_case.get_video_transcript(
        f"https://www.youtube.com/watch?v={video_id}", 
        language
    )
    
    if not transcript:
        raise HTTPException(
            status_code=404,
            detail="Transcript could not be retrieved. The video might not have subtitles.",
        )
    
    return transcript


@router.post("/download", response_model=DownloadResponse)
async def download_video(
    request: DownloadRequest,
    use_case: YoutubeAnalysisUseCase = Depends(get_youtube_use_case),
):
    """
    Download a YouTube video in the specified format.
    """
    if request.format not in ["mp4", "mp3"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid format. Supported formats are 'mp4' and 'mp3'.",
        )
    
    download_info = await use_case.download_video(request.video_url, request.format)
    
    if not download_info:
        raise HTTPException(
            status_code=500,
            detail="Video download failed. The video might be unavailable or restricted.",
        )
    
    return DownloadResponse(**download_info)


@router.post("/download/batch", response_model=BatchDownloadResponse)
async def download_playlist(
    request: BatchDownloadRequest,
    background_tasks: BackgroundTasks,
    use_case: YoutubeAnalysisUseCase = Depends(get_youtube_use_case),
    websocket_manager: WebSocketManager = Depends(lambda: WebSocketManager()),
):
    """
    Download all videos in a YouTube playlist in the specified format.
    This is an async operation that will send progress updates via WebSocket.
    """
    if request.format not in ["mp4", "mp3"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid format. Supported formats are 'mp4' and 'mp3'.",
        )
    
    # Get playlist metadata to know how many videos to download
    playlist_data = await use_case.get_playlist_metadata(request.playlist_url)
    
    if not playlist_data:
        raise HTTPException(
            status_code=404,
            detail="Playlist metadata could not be retrieved. Check if the URL is valid.",
        )
    
    # Generate a task ID for tracking
    import uuid
    task_id = str(uuid.uuid4())
    
    # Start background task for downloading videos
    background_tasks.add_task(
        use_case.download_playlist,
        request.playlist_url, 
        request.format, 
        task_id,
        websocket_manager
    )
    
    return BatchDownloadResponse(
        task_id=task_id,
        total_videos=playlist_data["item_count"] or len(playlist_data["videos"])
    )
