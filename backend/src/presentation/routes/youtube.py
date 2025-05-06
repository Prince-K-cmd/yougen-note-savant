
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional

from src.models.youtube import VideoMetadataRequest, VideoMetadata, DownloadRequest, DownloadResponse
from src.application.use_cases.youtube_analysis import YoutubeAnalysisUseCase
from src.infrastructure.repositories.video_repository import VideoRepository

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
