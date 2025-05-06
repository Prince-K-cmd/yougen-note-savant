
import logging
from typing import List, Dict, Any, Optional
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

logger = logging.getLogger(__name__)


class TranscriptTool:
    """Tool for fetching YouTube transcripts."""
    
    @staticmethod
    async def get_transcript(video_id: str, language: str = "en") -> Optional[List[Dict[str, Any]]]:
        """
        Get the transcript for a YouTube video.
        
        Args:
            video_id: YouTube video ID
            language: Preferred language code
            
        Returns:
            List of transcript segments or None if no transcript is available
        """
        try:
            # YouTubeTranscriptApi is not async, but we wrap it in an async method
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            try:
                # Try to get the transcript in the requested language
                transcript = transcript_list.find_transcript([language])
            except NoTranscriptFound:
                # Fall back to any available transcript and translate it
                try:
                    transcript = transcript_list.find_transcript(['en'])
                    transcript = transcript.translate(language)
                except Exception as e:
                    logger.warning(f"Couldn't translate transcript: {e}")
                    # Use any available transcript
                    transcript = transcript_list.find_generated_transcript()
            
            # Get the transcript data
            transcript_data = transcript.fetch()
            return transcript_data
            
        except TranscriptsDisabled:
            logger.warning(f"Transcripts are disabled for video {video_id}")
            return None
        except NoTranscriptFound:
            logger.warning(f"No transcript found for video {video_id}")
            return None
        except Exception as e:
            logger.error(f"Error fetching transcript for video {video_id}: {e}")
            return None
    
    @staticmethod
    async def get_transcript_text(video_id: str, language: str = "en") -> str:
        """
        Get the full transcript text for a YouTube video.
        
        Args:
            video_id: YouTube video ID
            language: Preferred language code
            
        Returns:
            Full transcript text or empty string if no transcript is available
        """
        transcript_data = await TranscriptTool.get_transcript(video_id, language)
        
        if not transcript_data:
            return ""
        
        # Concatenate all transcript segments
        transcript_text = " ".join(segment["text"] for segment in transcript_data)
        return transcript_text
