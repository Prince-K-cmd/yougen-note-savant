
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .routes import youtube, ai, note, history

# Create FastAPI app
app = FastAPI(
    title="YouGen API",
    description="API for YouGen Note Savant application",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, limit this to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(youtube.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(note.router, prefix="/api")
app.include_router(history.router, prefix="/api")

@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"message": "Welcome to YouGen API", "status": "online"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

# Error handling
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return {"detail": str(exc), "status_code": 500}
