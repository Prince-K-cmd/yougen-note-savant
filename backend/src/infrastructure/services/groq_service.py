
import os
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from openai import AsyncGroq

load_dotenv()
logger = logging.getLogger(__name__)

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    logger.warning("GROQ_API_KEY not found in environment variables")

groq_client = AsyncGroq(api_key=groq_api_key)


class GroqService:
    """Service for interacting with the Groq API."""
    
    MODEL = "llama-3.3-70b-versatile"
    
    @classmethod
    async def chat_completion(
        cls,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> Dict[str, Any]:
        """
        Generate a chat completion using Groq API.
        
        Args:
            prompt: The user's message
            system_prompt: Optional system prompt to guide the model
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Dictionary with response text and other metadata
        """
        try:
            messages = []
            
            # Add system message if provided
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            # Add user message
            messages.append({"role": "user", "content": prompt})
            
            # Call Groq API
            response = await groq_client.chat.completions.create(
                model=cls.MODEL,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            
            # Extract response content
            response_text = response.choices[0].message.content
            
            return {
                "text": response_text,
                "model": cls.MODEL,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                }
            }
            
        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")
            return {
                "text": "I'm sorry, but I encountered an error processing your request.",
                "error": str(e),
            }
    
    @classmethod
    async def generate_suggestions(cls, transcript: str, current_message: str) -> List[str]:
        """
        Generate suggested follow-up questions based on transcript and current message.
        
        Args:
            transcript: Video transcript
            current_message: Current message/question
            
        Returns:
            List of suggested follow-up questions
        """
        system_prompt = """
        Based on the video transcript and the current conversation, generate 3 potential
        follow-up questions that the user might want to ask. Keep them concise, relevant,
        and natural. Return just the questions as a numbered list without any explanation.
        """
        
        prompt = f"""
        Video transcript summary: {transcript[:1000]}...
        
        Current question: {current_message}
        
        Generate 3 relevant follow-up questions:
        """
        
        try:
            response = await cls.chat_completion(
                prompt=prompt, 
                system_prompt=system_prompt,
                temperature=0.8,
                max_tokens=256
            )
            
            # Parse the response to extract questions
            suggestion_text = response["text"]
            
            # Handle different formats of returned questions
            lines = suggestion_text.strip().split("\n")
            suggestions = []
            
            for line in lines:
                # Remove numbering and clean up
                clean_line = line.strip()
                for prefix in ["1.", "2.", "3.", "-", "*", "•"]:
                    if clean_line.startswith(prefix):
                        clean_line = clean_line[len(prefix):].strip()
                
                # Remove quotes if present
                if clean_line.startswith('"') and clean_line.endswith('"'):
                    clean_line = clean_line[1:-1]
                
                if clean_line and len(clean_line) > 10:  # Only add non-empty, meaningful questions
                    suggestions.append(clean_line)
            
            # Limit to 3 suggestions
            return suggestions[:3]
            
        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            return []
