
from fastapi import APIRouter, HTTPException, Depends, Path, Query
from typing import List, Optional

from src.models.note import NoteRequest, NoteResponse
from src.application.use_cases.note_management import NoteManagementUseCase
from src.infrastructure.repositories.note_repository import NoteRepository

router = APIRouter()

# Dependencies
async def get_note_use_case() -> NoteManagementUseCase:
    """Dependency for NoteManagementUseCase."""
    note_repository = NoteRepository()
    return NoteManagementUseCase(note_repository)


@router.post("/save", response_model=NoteResponse)
async def save_note(
    request: NoteRequest,
    use_case: NoteManagementUseCase = Depends(get_note_use_case),
):
    """
    Save a note for a video.
    """
    saved_note = await use_case.save_note(
        video_url=request.video_url,
        content=request.content,
        timestamp=request.timestamp,
        tags=request.tags,
    )
    
    if not saved_note:
        raise HTTPException(
            status_code=500,
            detail="Failed to save note. Please check the video URL and try again.",
        )
    
    return NoteResponse(**saved_note)


@router.get("/list", response_model=List[NoteResponse])
async def list_notes_for_video(
    video_url: str = Query(..., description="YouTube video URL"),
    use_case: NoteManagementUseCase = Depends(get_note_use_case),
):
    """
    Get all notes for a video.
    """
    notes = await use_case.get_notes_for_video(video_url)
    return [NoteResponse(**note) for note in notes]


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int = Path(..., description="Note ID"),
    request: NoteRequest = None,
    use_case: NoteManagementUseCase = Depends(get_note_use_case),
):
    """
    Update a note.
    """
    if not request:
        raise HTTPException(
            status_code=400,
            detail="Request body is required.",
        )
    
    updated_note = await use_case.update_note(
        note_id=note_id,
        content=request.content,
        timestamp=request.timestamp,
        tags=request.tags,
    )
    
    if not updated_note:
        raise HTTPException(
            status_code=404,
            detail=f"Note with ID {note_id} not found.",
        )
    
    return NoteResponse(**updated_note)
