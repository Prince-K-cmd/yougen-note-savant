
# VideoNotes Backend

A FastAPI backend for the VideoNotes application, designed to handle YouTube video metadata, transcripts, AI-powered chat, and note-taking features.

## Features

- YouTube metadata extraction
- AI-powered video analysis and chat
- Note management with AI summaries
- YouTube video/audio download capabilities

## Tech Stack

- Python 3.11+
- FastAPI
- PydanticAI with Groq integration
- yt-dlp for YouTube downloads
- youtube-transcript-api for transcripts
- PostgreSQL with asyncpg and pgvector

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL with pgvector extension installed
- Groq API key

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/videonotes
```

### Installation

1. Install dependencies:

```bash
pip install -e .
```

2. Set up the database:

```bash
psql -U postgres -c "CREATE DATABASE videonotes;"
psql -U postgres -d videonotes -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

3. Run database migrations:

```bash
python -m src.infrastructure.db.migrations
```

4. Start the server:

```bash
uvicorn src.presentation.main:app --reload
```

## Database Schema

```sql
-- videos table
CREATE TABLE videos (
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

-- chats table
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    video_id TEXT NOT NULL REFERENCES videos(video_id),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW()
);

-- notes table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    video_id TEXT NOT NULL REFERENCES videos(video_id),
    content JSONB NOT NULL,
    content_text TEXT NOT NULL,
    content_embedding vector(1536),
    timestamp INTEGER,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- downloads table
CREATE TABLE downloads (
    id SERIAL PRIMARY KEY,
    video_id TEXT NOT NULL REFERENCES videos(video_id),
    format TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Documentation

After starting the server, access the API documentation at:
- OpenAPI UI: http://localhost:8000/docs
- ReDoc UI: http://localhost:8000/redoc

## TypeScript Interfaces

TypeScript interfaces for frontend integration are available in `frontend/src/types/api.ts`.
