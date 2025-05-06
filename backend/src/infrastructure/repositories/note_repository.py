
from typing import Optional, List, Dict, Any
from src.domain.entities.note import Note
from src.infrastructure.db.connection import db


class NoteRepository:
    """Repository for note data."""
    
    async def save_note(self, note: Note) -> Note:
        """Save a note to the database."""
        query = """
        INSERT INTO notes (video_id, content, content_text, timestamp, tags)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, video_id, content, content_text, timestamp, tags, created_at, updated_at
        """
        
        row = await db.fetchone(
            query,
            note.video_id,
            note.content,
            note.content_text,
            note.timestamp,
            note.tags,
        )
        
        return Note(
            id=row["id"],
            video_id=row["video_id"],
            content=row["content"],
            content_text=row["content_text"],
            timestamp=row["timestamp"],
            tags=row["tags"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
    
    async def get_notes_by_video_id(self, video_id: str) -> List[Note]:
        """Get all notes for a video."""
        query = """
        SELECT id, video_id, content, content_text, timestamp, tags, created_at, updated_at
        FROM notes
        WHERE video_id = $1
        ORDER BY timestamp ASC NULLS LAST, created_at DESC
        """
        
        rows = await db.fetch(query, video_id)
        
        return [
            Note(
                id=row["id"],
                video_id=row["video_id"],
                content=row["content"],
                content_text=row["content_text"],
                timestamp=row["timestamp"],
                tags=row["tags"],
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            )
            for row in rows
        ]
    
    async def update_note(self, note_id: int, content: Dict[str, Any], content_text: str, 
                         timestamp: Optional[int], tags: Optional[List[str]]) -> Optional[Note]:
        """Update a note."""
        query = """
        UPDATE notes
        SET content = $2, content_text = $3, timestamp = $4, tags = $5, updated_at = NOW()
        WHERE id = $1
        RETURNING id, video_id, content, content_text, timestamp, tags, created_at, updated_at
        """
        
        row = await db.fetchone(
            query, note_id, content, content_text, timestamp, tags
        )
        
        if not row:
            return None
            
        return Note(
            id=row["id"],
            video_id=row["video_id"],
            content=row["content"],
            content_text=row["content_text"],
            timestamp=row["timestamp"],
            tags=row["tags"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
    
    async def delete_note(self, note_id: int) -> bool:
        """Delete a note."""
        query = "DELETE FROM notes WHERE id = $1"
        result = await db.execute(query, note_id)
        return "DELETE" in result
