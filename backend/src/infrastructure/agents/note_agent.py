
import json
import logging
from typing import Dict, Any, Optional, List

from src.infrastructure.services.groq_service import GroqService

logger = logging.getLogger(__name__)


class NoteAgent:
    """Agent for handling note-related operations."""
    
    @staticmethod
    def extract_plain_text(content: Dict[str, Any]) -> str:
        """
        Extract plain text from Lexical JSON content.
        
        Args:
            content: Lexical JSON content
            
        Returns:
            Plain text extracted from the content
        """
        try:
            # Basic extraction of text from Lexical JSON
            # This is a simplified version and may need to be enhanced
            # based on the actual structure of Lexical JSON
            
            text = ""
            
            if not content or not isinstance(content, dict):
                return text
                
            # Process root
            root = content.get("root", {})
            
            # Process children recursively
            if "children" in root:
                for child in root["children"]:
                    if child.get("type") == "paragraph":
                        for text_node in child.get("children", []):
                            if text_node.get("type") == "text":
                                text += text_node.get("text", "") + " "
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting plain text from Lexical JSON: {e}")
            return ""
    
    @classmethod
    async def generate_summary(cls, text: str, max_length: int = 200) -> str:
        """
        Generate a summary of the note content.
        
        Args:
            text: Plain text content
            max_length: Maximum length of the summary
            
        Returns:
            Summary of the content
        """
        if not text or len(text) < max_length:
            return text
            
        try:
            system_prompt = f"""
            You are a helpful assistant that summarizes text content.
            Create a concise summary (maximum {max_length} characters) that captures the key points.
            """
            
            prompt = f"Please summarize the following content:\n\n{text}"
            
            response = await GroqService.chat_completion(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=100,
            )
            
            summary = response["text"].strip()
            
            # Truncate if still too long
            if len(summary) > max_length:
                summary = summary[:max_length-3] + "..."
                
            return summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return text[:max_length-3] + "..." if len(text) > max_length else text
    
    @classmethod
    async def suggest_tags(cls, content: str, max_tags: int = 5) -> List[str]:
        """
        Suggest tags based on note content.
        
        Args:
            content: Note content
            max_tags: Maximum number of tags to suggest
            
        Returns:
            List of suggested tags
        """
        if not content:
            return []
            
        try:
            system_prompt = f"""
            You are a helpful assistant that suggests relevant tags for content.
            Create up to {max_tags} relevant tags based on the content.
            Return them as a comma-separated list without explanations.
            Each tag should be a single word or short phrase (1-3 words).
            """
            
            prompt = f"Please suggest relevant tags for this content:\n\n{content[:1000]}"
            
            response = await GroqService.chat_completion(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=100,
            )
            
            # Parse the response to extract tags
            tags_text = response["text"].strip()
            
            # Split by commas and clean up
            tags = [tag.strip() for tag in tags_text.split(",") if tag.strip()]
            
            # Limit to max_tags
            return tags[:max_tags]
            
        except Exception as e:
            logger.error(f"Error suggesting tags: {e}")
            return []
