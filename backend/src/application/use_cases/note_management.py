
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime

from src.domain.entities.note import Note
from src.infrastructure.agents.note_agent import NoteAgent
from src.infrastructure.agents.video_agent import VideoAgent
from src.infrastructure.repositories.note_repository import NoteRepository

logger = logging.getLogger(__name__)


class NoteManagementUseCase:
    """Use case for note management."""
    
    def __init__(self, note_repository: NoteRepository):
        self.note_repository = note_repository
        self.note_agent = NoteAgent
        self.video_agent = VideoAgent
    
    async def save_note(self, video_url: str, content: Dict[str, Any], 
                       timestamp: Optional[int] = None, 
                       tags: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
        """
        Save a note for a video.
        
        Args:
            video_url: YouTube video URL
            content: Lexical JSON content
            timestamp: Timestamp in seconds
            tags: List of tags
            
        Returns:
            Saved note or None if an error occurs
        """
        try:
            # Extract video ID
            video_id = self.video_agent.extract_video_id(video_url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {video_url}")
                return None
            
            # Extract plain text from content
            content_text = self.note_agent.extract_plain_text(content)
            
            # If no tags provided, suggest some
            if not tags and content_text:
                tags = await self.note_agent.suggest_tags(content_text)
            
            # Create note entity
            note = Note(
                video_id=video_id,
                content=content,
                content_text=content_text,
                timestamp=timestamp,
                tags=tags or [],
            )
            
            # Save to database
            saved_note = await self.note_repository.save_note(note)
            
            return {
                "id": saved_note.id,
                "video_url": f"https://youtube.com/watch?v={saved_note.video_id}",
                "video_id": saved_note.video_id,
                "content": saved_note.content,
                "timestamp": saved_note.timestamp,
                "tags": saved_note.tags,
                "created_at": saved_note.created_at,
                "updated_at": saved_note.updated_at,
            }
            
        except Exception as e:
            logger.error(f"Error in save_note use case: {e}")
            return None
    
    async def get_notes_for_video(self, video_url: str) -> List[Dict[str, Any]]:
        """
        Get all notes for a video.
        
        Args:
            video_url: YouTube video URL
            
        Returns:
            List of notes
        """
        try:
            # Extract video ID
            video_id = self.video_agent.extract_video_id(video_url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {video_url}")
                return []
            
            # Get notes from database
            notes = await self.note_repository.get_notes_by_video_id(video_id)
            
            return [
                {
                    "id": note.id,
                    "video_url": f"https://youtube.com/watch?v={note.video_id}",
                    "video_id": note.video_id,
                    "content": note.content,
                    "timestamp": note.timestamp,
                    "tags": note.tags,
                    "created_at": note.created_at,
                    "updated_at": note.updated_at,
                }
                for note in notes
            ]
            
        except Exception as e:
            logger.error(f"Error in get_notes_for_video use case: {e}")
            return []
    
    async def update_note(self, note_id: int, content: Dict[str, Any],
                         timestamp: Optional[int] = None,
                         tags: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
        """
        Update a note.
        
        Args:
            note_id: ID of the note to update
            content: Updated Lexical JSON content
            timestamp: Updated timestamp in seconds
            tags: Updated list of tags
            
        Returns:
            Updated note or None if an error occurs
        """
        try:
            # Extract plain text from content
            content_text = self.note_agent.extract_plain_text(content)
            
            # Update note in database
            updated_note = await self.note_repository.update_note(
                note_id, content, content_text, timestamp, tags
            )
            
            if not updated_note:
                logger.error(f"Note not found: {note_id}")
                return None
            
            return {
                "id": updated_note.id,
                "video_url": f"https://youtube.com/watch?v={updated_note.video_id}",
                "video_id": updated_note.video_id,
                "content": updated_note.content,
                "timestamp": updated_note.timestamp,
                "tags": updated_note.tags,
                "created_at": updated_note.created_at,
                "updated_at": updated_note.updated_at,
            }
            
        except Exception as e:
            logger.error(f"Error in update_note use case: {e}")
            return None
