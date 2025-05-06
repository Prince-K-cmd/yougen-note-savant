
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.presentation.routes import youtube, note, ai

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="VideoNotes API",
    description="API for the VideoNotes application",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(youtube.router, prefix="/api/youtube", tags=["YouTube"])
app.include_router(note.router, prefix="/api/note", tags=["Notes"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {"status": "healthy", "message": "VideoNotes API is running"}
