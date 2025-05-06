
from typing import Dict, Any, Optional, List
import logging

from src.infrastructure.agents.video_agent import VideoAgent
from src.infrastructure.services.groq_service import GroqService

logger = logging.getLogger(__name__)


class AiChatUseCase:
    """Use case for AI-powered chat."""
    
    def __init__(self):
        self.video_agent = VideoAgent
    
    async def get_chat_response(self, video_url: str, message: str, language: str = "en") -> Dict[str, Any]:
        """
        Get AI response for a chat message about a video.
        
        Args:
            video_url: YouTube video URL
            message: User message
            language: Language code
            
        Returns:
            AI response and suggestions
        """
        try:
            # Extract video ID
            video_id = self.video_agent.extract_video_id(video_url)
            if not video_id:
                logger.error(f"Invalid YouTube URL: {video_url}")
                return {
                    "response": "I couldn't process that YouTube URL. Please make sure it's a valid YouTube video link.",
                    "suggestions": [],
                    "video_id": "",
                }
            
            # Get transcript for context
            transcript = await self.video_agent.get_transcript(video_url, language)
            
            # Create system prompt with video context
            system_prompt = """
            You are a helpful AI assistant specialized in discussing YouTube videos.
            Based on the video transcript and the user's question, provide a helpful,
            accurate, and concise response. If you don't know the answer based on
            the provided transcript, admit that you don't have enough information.
            """
            
            # Create prompt with transcript context
            transcript_context = "No transcript available for this video." if not transcript else transcript[:4000]
            prompt = f"""
            Video transcript:
            {transcript_context}
            
            User question: {message}
            """
            
            # Get AI response
            response = await GroqService.chat_completion(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
            )
            
            # Generate follow-up suggestions
            suggestions = await GroqService.generate_suggestions(transcript_context, message)
            
            return {
                "response": response["text"],
                "suggestions": suggestions,
                "video_id": video_id,
            }
            
        except Exception as e:
            logger.error(f"Error in get_chat_response use case: {e}")
            return {
                "response": "I'm sorry, but I encountered an error processing your request.",
                "suggestions": [],
                "video_id": video_id if 'video_id' in locals() else "",
            }
