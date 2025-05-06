
-- Create tables for YouGen application

-- Video metadata table
CREATE TABLE IF NOT EXISTS video_metadata (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(20) UNIQUE NOT NULL,
    platform VARCHAR(20) NOT NULL DEFAULT 'youtube',
    title TEXT NOT NULL,
    thumbnail VARCHAR(255),
    duration INTEGER,
    upload_date DATE,
    channel VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(20) REFERENCES video_metadata(video_id),
    content JSONB NOT NULL,
    content_text TEXT NOT NULL,
    timestamp INTEGER,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Download history table
CREATE TABLE IF NOT EXISTS download_history (
    id VARCHAR(36) PRIMARY KEY,
    video_id VARCHAR(20),
    playlist_id VARCHAR(50),
    batch_id VARCHAR(36),
    title TEXT NOT NULL,
    thumbnail VARCHAR(255),
    format VARCHAR(10) NOT NULL,
    resolution VARCHAR(10),
    size BIGINT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'failed', 'in_progress')),
    download_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_path TEXT,
    CONSTRAINT download_source_check CHECK (video_id IS NOT NULL OR playlist_id IS NOT NULL)
);

-- Batch download tasks table
CREATE TABLE IF NOT EXISTS batch_downloads (
    task_id VARCHAR(36) PRIMARY KEY,
    playlist_id VARCHAR(50) NOT NULL,
    format VARCHAR(10) NOT NULL,
    resolution VARCHAR(10),
    total INTEGER NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'failed', 'in_progress')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notes_video_id ON notes(video_id);
CREATE INDEX idx_downloads_video_id ON download_history(video_id);
CREATE INDEX idx_downloads_playlist_id ON download_history(playlist_id);
CREATE INDEX idx_downloads_batch_id ON download_history(batch_id);
CREATE INDEX idx_downloads_status ON download_history(status);
CREATE INDEX idx_batch_downloads_playlist_id ON batch_downloads(playlist_id);
CREATE INDEX idx_batch_downloads_status ON batch_downloads(status);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for video_metadata
CREATE TRIGGER update_video_metadata_modtime
BEFORE UPDATE ON video_metadata
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create trigger for notes
CREATE TRIGGER update_notes_modtime
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create trigger for batch_downloads
CREATE TRIGGER update_batch_downloads_modtime
BEFORE UPDATE ON batch_downloads
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
