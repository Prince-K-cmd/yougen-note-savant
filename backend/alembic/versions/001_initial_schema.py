
"""Initial database schema

Revision ID: 001
Revises: 
Create Date: 2025-05-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create videos table
    op.create_table('videos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('video_id', sa.String(), nullable=False),
        sa.Column('platform', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('thumbnail', sa.String(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('upload_date', sa.DateTime(), nullable=True),
        sa.Column('channel', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('video_id')
    )
    
    # Create chats table
    op.create_table('chats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('video_id', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('response', sa.Text(), nullable=False),
        sa.Column('language', sa.String(), server_default='en', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['video_id'], ['videos.video_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create notes table
    op.create_table('notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('video_id', sa.String(), nullable=False),
        sa.Column('content', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('content_text', sa.Text(), nullable=False),
        sa.Column('content_embedding', postgresql.BYTEA(), nullable=True),
        sa.Column('timestamp', sa.Integer(), nullable=True),
        sa.Column('tags', sa.ARRAY(sa.String()), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['video_id'], ['videos.video_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create downloads table
    op.create_table('downloads',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('video_id', sa.String(), nullable=False),
        sa.Column('format', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['video_id'], ['videos.video_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better performance
    op.create_index(op.f('ix_videos_video_id'), 'videos', ['video_id'], unique=True)
    op.create_index(op.f('ix_notes_video_id'), 'notes', ['video_id'], unique=False)
    op.create_index(op.f('ix_chats_video_id'), 'chats', ['video_id'], unique=False)
    op.create_index(op.f('ix_downloads_video_id'), 'downloads', ['video_id'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('downloads')
    op.drop_table('notes')
    op.drop_table('chats')
    op.drop_table('videos')
