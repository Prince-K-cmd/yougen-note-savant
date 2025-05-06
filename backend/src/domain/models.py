
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import JSONB, BYTEA
from sqlalchemy.sql import func
from typing import List, Optional
import datetime

Base = declarative_base()

class Video(Base):
    """Video metadata model."""
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True)
    video_id = Column(String, unique=True, nullable=False)
    platform = Column(String, nullable=False)
    title = Column(String, nullable=False)
    thumbnail = Column(String, nullable=True)
    duration = Column(Integer, nullable=True)
    upload_date = Column(DateTime, nullable=True)
    channel = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())

class Chat(Base):
    """Chat history model."""
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True)
    video_id = Column(String, ForeignKey("videos.video_id"), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=func.now())

class Note(Base):
    """Note model."""
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True)
    video_id = Column(String, ForeignKey("videos.video_id"), nullable=False)
    content = Column(JSONB, nullable=False)
    content_text = Column(Text, nullable=False)
    content_embedding = Column(BYTEA, nullable=True)  # For vector search
    timestamp = Column(Integer, nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Download(Base):
    """Download history model."""
    __tablename__ = "downloads"
    
    id = Column(Integer, primary_key=True)
    video_id = Column(String, ForeignKey("videos.video_id"), nullable=False)
    format = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.now())
