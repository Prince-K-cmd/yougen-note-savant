
import pytest
from src.infrastructure.agents.video_agent import VideoAgent


class TestVideoAgent:
    """Tests for the VideoAgent class."""
    
    @pytest.mark.parametrize(
        "url,expected_id",
        [
            ("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"),
            ("https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"),
            ("https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"),
            ("https://youtube.com/watch?v=dQw4w9WgXcQ&feature=shared", "dQw4w9WgXcQ"),
            ("invalid-url", None),
            ("https://example.com", None),
        ],
    )
    def test_extract_video_id(self, url, expected_id):
        """Test extracting video ID from URL."""
        assert VideoAgent.extract_video_id(url) == expected_id
    
    @pytest.mark.asyncio
    async def test_get_video_metadata_valid(self, mocker):
        """Test getting video metadata with a valid URL."""
        # Mock the download tool
        mock_metadata = {
            "video_id": "dQw4w9WgXcQ",
            "platform": "youtube",
            "title": "Test Video",
            "thumbnail": "https://example.com/thumbnail.jpg",
            "duration": 212,
            "upload_date": "20200101",
            "channel": "Test Channel",
        }
        mocker.patch(
            "src.infrastructure.tools.download_tool.DownloadTool.get_metadata",
            return_value=mock_metadata,
        )
        
        # Test the method
        metadata = await VideoAgent.get_video_metadata("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        assert metadata == mock_metadata
    
    @pytest.mark.asyncio
    async def test_get_video_metadata_invalid_url(self):
        """Test getting video metadata with an invalid URL."""
        metadata = await VideoAgent.get_video_metadata("invalid-url")
        assert metadata is None
