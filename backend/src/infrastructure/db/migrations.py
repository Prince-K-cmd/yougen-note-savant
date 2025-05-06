
import asyncio
import logging
from src.infrastructure.db.connection import db

logger = logging.getLogger(__name__)

# SQL to create tables
CREATE_TABLES = """
-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    video_id TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail TEXT,
    duration INTEGER,
    upload_date TIMESTAMP,
    channel TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    video_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_video_id FOREIGN KEY(video_id) REFERENCES videos(video_id)
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    video_id TEXT NOT NULL,
    content JSONB NOT NULL,
    content_text TEXT NOT NULL,
    content_embedding vector(1536),
    timestamp INTEGER,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_video_id FOREIGN KEY(video_id) REFERENCES videos(video_id)
);

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
    id SERIAL PRIMARY KEY,
    video_id TEXT NOT NULL,
    format TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_video_id FOREIGN KEY(video_id) REFERENCES videos(video_id)
);
"""

async def run_migrations():
    """Run database migrations."""
    try:
        await db.connect()
        logger.info("Running migrations...")
        await db.execute(CREATE_TABLES)
        logger.info("Migrations completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(run_migrations())
