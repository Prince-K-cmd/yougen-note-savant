import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Message } from "@/types/chat";
import { Note } from "@/types/note";
import { ResourceType, VideoMetadata } from "@/types/youtube";
import { v4 as uuidv4 } from "uuid";

import { createTimestamp } from "@/utils/youtube";
import { 
  getVideoMetadata, 
  saveVideoMetadata, 
  saveNote, 
  getNotesByResourceId, 
  saveChat, 
  getChatByResourceId, 
  getChatsByResourceId,
  addChatMessage,
  deleteNote as deleteNoteFromStorage,
  updateNote as updateNoteInStorage,
  pinNote
} from "@/utils/storage";

import { VideoSection } from "@/components/video/VideoSection";
import { VideoSidebar } from "@/components/video/VideoSidebar";
import { TranscriptSegment } from "@/components/transcripts/TranscriptViewer";
import { getTranscriptByVideoId } from "@/utils/transcriptService";
import { Header } from "@/components/layout/Header";
import { UrlInput } from "@/components/youtube/UrlInput";
import { useToast } from "@/hooks/use-toast";

// API Services
import { youtubeApi, aiApi, notesApi } from "@/services/api";
import { IChatRequest } from "@/types/api";

// Mock video data for initial UI rendering
const mockVideoData = {
  id: "",
  title: "Loading...",
  channelTitle: "Loading...",
  channelId: "",
  description: "Loading video information...",
  publishedAt: new Date().toISOString(),
  thumbnailUrl: "",
  duration: "0:00",
  viewCount: "0",
};

export default function VideoView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [videoId, setVideoId] = useState(id || "");
  const [currentTime, setCurrentTime] = useState(0);
  const [videoData, setVideoData] = useState<VideoMetadata>(mockVideoData);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Load video data and notes
  useEffect(() => {
    if (!videoId) {
      navigate("/");
      return;
    }

    const fetchVideoMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        // Try to get cached metadata first
        const storedVideo = getVideoMetadata(videoId);
        if (storedVideo) {
          setVideoData(storedVideo);
        } else {
          // If no cached data, fetch from API
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          const metadata = await youtubeApi.getMetadata(videoUrl);
          
          // Convert API response to frontend model
          const videoMetadata: VideoMetadata = {
            id: metadata.video_id,
            title: metadata.title || "Unknown Title",
            channelTitle: metadata.channel || "Unknown Channel",
            channelId: "",
            description: "No description available",
            publishedAt: metadata.upload_date ? new Date(metadata.upload_date).toISOString() : new Date().toISOString(),
            thumbnailUrl: metadata.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            duration: metadata.duration ? formatDuration(metadata.duration) : "0:00",
            viewCount: "0",
          };
          
          setVideoData(videoMetadata);
          saveVideoMetadata(videoMetadata);
        }
      } catch (error) {
        console.error("Error fetching video metadata:", error);
        // If API fails, fallback to basic data
        setVideoData({
          ...mockVideoData,
          id: videoId,
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        });
        
        toast({
          title: "Error loading video data",
          description: "Could not fetch video information from the server.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    fetchVideoMetadata();

    // Check if we have a timestamp from navigation state
    if (location.state?.timestamp) {
      const timestampSeconds = location.state.timestamp;
      setTimeout(() => {
        handleTimestampClick(timestampSeconds);
      }, 1000);
    }

    loadVideoNotes();

    // Load chat history for this video
    const videoChats = getChatsByResourceId(videoId);
    if (videoChats.length > 0) {
      // Use the most recent chat
      const latestChat = videoChats.sort((a, b) => b.updatedAt - a.updatedAt)[0];
      setMessages(latestChat.messages);
    }
  }, [videoId, navigate, location.state, toast]);

  // Load transcript data
  useEffect(() => {
    if (!videoId) return;
    
    const loadTranscript = async () => {
      setIsLoadingTranscript(true);
      try {
        // Check if we have a cached transcript
        let videoTranscript = getTranscriptByVideoId(videoId);
        
        // If not, fetch from API
        if (!videoTranscript) {
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          
          try {
            const response = await fetch(`http://localhost:8000/api/youtube/transcript?video_id=${videoId}`);
            if (response.ok) {
              const data = await response.json();
              videoTranscript = data.map((segment: any) => ({
                start: segment.start,
                duration: segment.duration,
                text: segment.text
              }));
            }
          } catch (error) {
            console.error("Failed to fetch transcript from API, using fallback method:", error);
            // Fallback to client-side transcript generation
            videoTranscript = await getTranscriptByVideoId(videoId);
          }
        }
        
        setTranscript(videoTranscript || []);
      } catch (error) {
        console.error("Error loading transcript:", error);
      } finally {
        setIsLoadingTranscript(false);
      }
    };
    
    loadTranscript();
  }, [videoId]);

  const loadVideoNotes = async () => {
    // Load notes from storage first for immediate display
    const storedNotes = getNotesByResourceId(videoId);
    setNotes(storedNotes);
    
    // Then try to fetch from API
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const apiNotes = await notesApi.getNotesForVideo(videoUrl);
      
      // If successful, update the notes
      if (apiNotes && apiNotes.length > 0) {
        // Convert API notes to frontend model
        const convertedNotes: Note[] = apiNotes.map(note => ({
          id: note.id.toString(),
          resourceId: videoId,
          title: note.content.title || "Untitled",
          content: note.content_text,
          richContent: JSON.stringify(note.content),
          tags: note.tags?.map(tag => ({ 
            id: tag, 
            name: tag,
            color: getRandomColor()
          })) || [],
          createdAt: new Date(note.created_at).getTime(),
          updatedAt: new Date(note.updated_at).getTime(),
          videoTimestamp: note.timestamp ? {
            seconds: note.timestamp,
            formatted: formatTimestamp(note.timestamp)
          } : undefined
        }));
        
        setNotes(convertedNotes);
      }
    } catch (error) {
      console.error("Error fetching notes from API:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Create and add user message immediately for better UX
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: "user",
      timestamp: Date.now(),
      videoTimestamp: createTimestamp(currentTime),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Send message to API
      const chatRequest: IChatRequest = {
        video_url: `https://www.youtube.com/watch?v=${videoId}`,
        message: content,
        language: "en"
      };
      
      const response = await aiApi.sendMessage(chatRequest);
      
      // Create AI response message
      const aiMessage: Message = {
        id: uuidv4(),
        content: response.response,
        role: "assistant",
        timestamp: Date.now(),
      };
      
      const newMessages = [...updatedMessages, aiMessage];
      setMessages(newMessages);
      
      // Save chat to storage
      const chatId = saveChat(videoId, `Chat about ${videoData.title}`);
      const chat = getChatByResourceId(videoId);
      
      if (chat) {
        newMessages.forEach(msg => {
          if (!chat.messages.some(m => m.id === msg.id)) {
            addChatMessage(chat.id, msg);
          }
        });
      }
    } catch (error) {
      console.error("Error sending message to API:", error);
      
      // Create fallback AI response message
      const aiMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, but I couldn't process your request. There might be an issue with the connection to the AI service.",
        role: "assistant",
        timestamp: Date.now(),
      };
      
      setMessages([...updatedMessages, aiMessage]);
      
      // Show error toast
      toast({
        title: "AI Service Error",
        description: "Could not connect to the AI service. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async ({ title, content, richContent, videoTimestamp }: { 
    title: string;
    content: string;
    richContent?: string;
    videoTimestamp?: { seconds: number; formatted: string };
  }) => {
    if (editingNote) {
      // Update existing note
      const updatedNote = {
        ...editingNote,
        title,
        content,
        richContent,
        videoTimestamp,
        updatedAt: Date.now()
      };
      
      updateNoteInStorage(updatedNote);
      setEditingNote(null);
      
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });
      
      // Try to update note on API
      try {
        const parsedRichContent = richContent ? JSON.parse(richContent) : { text: content };
        await notesApi.updateNote(parseInt(editingNote.id), {
          video_url: `https://www.youtube.com/watch?v=${videoId}`,
          content: parsedRichContent,
          timestamp: videoTimestamp?.seconds,
          tags: editingNote.tags.map(tag => tag.name)
        });
      } catch (error) {
        console.error("Error updating note on API:", error);
      }
    } else {
      // Create new note
      try {
        // Save to local storage first for immediate update
        const newNote = saveNote({
          resourceId: videoId,
          title,
          content,
          richContent,
          tags: [],
          videoTimestamp,
        });
        
        setNotes([...notes, newNote]);
        
        // Then save to API
        const parsedRichContent = richContent ? JSON.parse(richContent) : { text: content };
        const apiNote = await notesApi.saveNote({
          video_url: `https://www.youtube.com/watch?v=${videoId}`,
          content: parsedRichContent,
          timestamp: videoTimestamp?.seconds,
          tags: []
        });
        
        // Update local note with API ID
        if (apiNote && apiNote.id) {
          const updatedNote = {
            ...newNote,
            id: apiNote.id.toString()
          };
          
          // Update in storage
          updateNoteInStorage(updatedNote);
        }
        
        toast({
          title: "Note saved",
          description: "Your note has been saved successfully.",
        });
      } catch (error) {
        console.error("Error saving note to API:", error);
        toast({
          title: "Note saved locally",
          description: "Your note was saved locally but couldn't be synced to the server.",
          variant: "default"
        });
      }
    }
    
    setIsCreatingNote(false);
    loadVideoNotes(); // Refresh notes
  };

  const handlePinNote = (noteId: string, isPinned: boolean) => {
    pinNote(noteId, isPinned);
    toast({
      title: isPinned ? "Note pinned" : "Note unpinned",
      description: isPinned ? "Note has been pinned to the top." : "Note has been unpinned.",
    });
    loadVideoNotes();
  };

  const handleDeleteNote = async (noteId: string) => {
    // Delete from local storage
    deleteNoteFromStorage(noteId);
    
    // Try to delete from API
    try {
      await fetch(`http://localhost:8000/api/note/${noteId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("Error deleting note from API:", error);
    }
    
    loadVideoNotes();
    
    toast({
      title: "Note deleted",
      description: "Your note has been deleted.",
      variant: "destructive"
    });
  };

  const handleTimestampClick = (seconds: number) => {
    if (document.querySelector('iframe')) {
      // Access the YouTube iframe player
      const iframe = document.querySelector('iframe');
      const player = iframe?.contentWindow;
      
      // Send a postMessage to seek to the specified time
      player?.postMessage(JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [seconds, true]
      }), '*');
    }
  };

  const handleUrlSubmit = (parseResult: { type: string; id: string; url: string }) => {
    if (parseResult.type === ResourceType.VIDEO) {
      navigate(`/video/${parseResult.id}`);
    } else if (parseResult.type === ResourceType.PLAYLIST) {
      navigate(`/playlist/${parseResult.id}`);
    }
  };

  // Helper function to format duration in seconds to mm:ss format
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Helper function to format timestamp in seconds to mm:ss format
  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Helper function to generate random color for tags
  const getRandomColor = () => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container py-6 px-4 sm:px-6 flex-grow">
        <div className="mb-4">
          <UrlInput onSubmit={handleUrlSubmit} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <VideoSection 
            videoId={videoId}
            videoData={videoData}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onSaveNote={handleSaveNote}
            isCreatingNote={isCreatingNote}
            onCreateNoteToggle={setIsCreatingNote}
            isLoading={isLoadingMetadata}
          />
          
          {/* Sidebar with Tabs */}
          <VideoSidebar 
            videoId={videoId}
            messages={messages}
            notes={notes}
            transcript={transcript}
            isLoading={isLoading}
            isLoadingTranscript={isLoadingTranscript}
            onSendMessage={handleSendMessage}
            onTimestampClick={handleTimestampClick}
            onDeleteNote={handleDeleteNote}
            onCreateNote={() => {
              setEditingNote(null);
              setIsCreatingNote(true);
            }}
            onPinNote={handlePinNote}
          />
        </div>
      </div>
    </div>
  );
}
