
from fastapi import APIRouter, HTTPException, Depends

from src.models.chat import ChatRequest, ChatResponse
from src.application.use_cases.ai_chat import AiChatUseCase

router = APIRouter()

# Dependencies
async def get_ai_chat_use_case() -> AiChatUseCase:
    """Dependency for AiChatUseCase."""
    return AiChatUseCase()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_video(
    request: ChatRequest,
    use_case: AiChatUseCase = Depends(get_ai_chat_use_case),
):
    """
    Get AI-generated response for a chat about a video.
    """
    response = await use_case.get_chat_response(
        video_url=request.video_url,
        message=request.message,
        language=request.language,
    )
    
    if not response["video_id"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL. Please provide a valid YouTube video link.",
        )
    
    return ChatResponse(**response)
