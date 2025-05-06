
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from ...domain.models import Note, Video, Download
from ...domain.entities.note import Note as NoteEntity
from ..db.connection import db_session


class HistoryRepository:
    """Repository for history operations."""
    
    @staticmethod
    def get_user_history(limit: int = 50) -> List[Dict[str, Any]]:
        """Get user's history of note activities."""
        session = db_session()
        try:
            # Get notes with related video info
            history = (
                session.query(
                    Note.id,
                    Note.content_text,
                    Note.created_at,
                    Note.updated_at,
                    Video.video_id,
                    Video.title
                )
                .join(Video, Note.video_id == Video.video_id)
                .order_by(desc(Note.updated_at))
                .limit(limit)
                .all()
            )
            
            # Convert to list of dicts
            result = []
            for h in history:
                result.append({
                    "id": h.id,
                    "content_text": h.content_text,
                    "video_id": h.video_id,
                    "title": h.title,
                    "created_at": h.created_at.isoformat() if h.created_at else None,
                    "updated_at": h.updated_at.isoformat() if h.updated_at else None,
                })
            
            return result
        finally:
            session.close()
    
    @staticmethod
    def get_history_detail(history_id: int) -> Optional[Dict[str, Any]]:
        """Get details for a specific history item."""
        session = db_session()
        try:
            # Get note with related video info
            history = (
                session.query(
                    Note.id,
                    Note.content,
                    Note.content_text,
                    Note.created_at,
                    Note.updated_at,
                    Video.video_id,
                    Video.title
                )
                .join(Video, Note.video_id == Video.video_id)
                .filter(Note.id == history_id)
                .first()
            )
            
            if not history:
                return None
            
            # Convert to dict
            return {
                "id": history.id,
                "content": history.content,
                "content_text": history.content_text,
                "video_id": history.video_id,
                "title": history.title,
                "created_at": history.created_at.isoformat() if history.created_at else None,
                "updated_at": history.updated_at.isoformat() if history.updated_at else None,
            }
        finally:
            session.close()
            
    @staticmethod
    def get_download_history(limit: int = 50) -> List[Dict[str, Any]]:
        """Get user's download history."""
        session = db_session()
        try:
            # Get downloads with related video info
            history = (
                session.query(
                    Download.id,
                    Download.format,
                    Download.file_path,
                    Download.file_size,
                    Download.created_at,
                    Video.video_id,
                    Video.title,
                    Video.thumbnail
                )
                .join(Video, Download.video_id == Video.video_id)
                .order_by(desc(Download.created_at))
                .limit(limit)
                .all()
            )
            
            # Convert to list of dicts
            result = []
            for h in history:
                result.append({
                    "id": h.id,
                    "video_id": h.video_id,
                    "title": h.title,
                    "thumbnail": h.thumbnail,
                    "format": h.format,
                    "file_size": h.file_size,
                    "file_path": h.file_path,
                    "status": "completed",  # All entries in the downloads table are completed
                    "download_date": h.created_at.isoformat() if h.created_at else None,
                })
            
            return result
        finally:
            session.close()
            
    @staticmethod
    def get_download_detail(download_id: int) -> Optional[Dict[str, Any]]:
        """Get details for a specific download."""
        session = db_session()
        try:
            # Get download with related video info
            download = (
                session.query(
                    Download.id,
                    Download.format,
                    Download.file_path,
                    Download.file_size,
                    Download.created_at,
                    Video.video_id,
                    Video.title,
                    Video.thumbnail
                )
                .join(Video, Download.video_id == Video.video_id)
                .filter(Download.id == download_id)
                .first()
            )
            
            if not download:
                return None
            
            # Convert to dict
            return {
                "id": str(download.id),  # Convert to string for API consistency
                "video_id": download.video_id,
                "title": download.title,
                "thumbnail": download.thumbnail,
                "format": download.format,
                "file_size": download.file_size,
                "file_path": download.file_path,
                "status": "completed",  # All entries in the downloads table are completed
                "download_date": download.created_at.isoformat() if download.created_at else None,
            }
        finally:
            session.close()
