import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, MessageSquare, Plus, MoreVertical, Send } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateSummary, sendMessage } from "@/utils/api";
import { 
  getVideoMetadata as getVideoMetadataFromStorage, 
  saveVideoMetadata, 
  getChat, 
  saveChat,
  Chat,
  ChatMessage
} from "@/utils/storage";
import { formatTime } from "@/utils/helpers";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { getSettings } from "@/utils/storage";

interface VideoPlayerProps {
  videoId: string | undefined;
  onTimeUpdate: (time: number) => void;
  autoplay: boolean;
  muted: boolean;
}

const VideoPlayer = ({ videoId, onTimeUpdate, autoplay, muted }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(muted);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlayPause = () => {
      setIsPlaying(!isPlaying);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlayPause);
    video.addEventListener('pause', handlePlayPause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlayPause);
      video.removeEventListener('pause', handlePlayPause);
    };
  }, [videoId, onTimeUpdate, isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const seek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <div className="relative">
      <video 
        ref={videoRef} 
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&origin=${window.location.origin}`}
        className="w-full aspect-video"
        autoPlay={autoplay}
        muted={isMuted}
        controls
      />

      <div className="absolute bottom-0 left-0 w-full bg-black/50 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={togglePlay}>
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="w-32 md:w-64"
        />
      </div>
    </div>
  );
};

// Adapter for chat message types - updating to match the new ChatMessage interface
const adaptChatMessages = (chat: Chat) => {
  return {
    ...chat,
    messages: chat.messages // No need to transform since they already match our interface
  };
};

// Adapter to convert back to storage format (already matches our interface, so no transformation needed)
const adaptToStorageChat = (chat: any) => {
  return chat; // No transformation needed as the types now match
};

export default function VideoView() {
  const { id } = useParams<{ id: string }>();
  const [videoMetadata, setVideoMetadata] = useState<any>(null);
  const [chat, setChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const settings = getSettings();

  const { data: initialVideoMetadata, isLoading: isMetadataLoading } = useQuery({
    queryKey: ['videoMetadata', id],
    queryFn: async () => {
      if (!id) throw new Error("Video ID is required");

      // First, try to get the video metadata from local storage
      let metadata = getVideoMetadataFromStorage(id);

      if (metadata) {
        return metadata;
      } else {
        // If not in local storage, fetch it from the API
        const response = await fetch(`/api/youtube/video-metadata?videoId=${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch video metadata: ${response.status} ${response.statusText}`);
        }
        metadata = await response.json();

        // Save the fetched metadata to local storage
        saveVideoMetadata(metadata);
        return metadata;
      }
    },
    meta: {
      onError: (error: any) => {
        console.error("Error fetching video metadata:", error);
        toast({
          title: "Error",
          description: "Failed to load video metadata. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  useEffect(() => {
    if (initialVideoMetadata) {
      setVideoMetadata(initialVideoMetadata);
    }
  }, [initialVideoMetadata]);

  useEffect(() => {
    if (id) {
      const storedChat = getChat(id);
      if (storedChat) {
        setChat(adaptChatMessages(storedChat));
      } else {
        // Initialize a new chat
        const newChat = {
          id: new Date().getTime().toString(),
          resourceId: id,
          title: videoMetadata?.title || 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setChat(newChat);
        saveChat(newChat);
      }
    }
  }, [id, videoMetadata]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat?.messages]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTimestamp(time);
  };

  const generateSummaryMutation = useMutation({
    mutationFn: generateSummary,
    onSuccess: (data) => {
      setSummary(data.summary);
      setIsGenerating(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleGenerateSummary = async () => {
    if (!id) {
      toast({
        title: "Error",
        description: "Video ID is required to generate a summary.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateSummaryMutation.mutate({ videoId: id });
  };

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      if (!chat) return;

      const newMessage = {
        id: new Date().getTime().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
      };

      const updatedChat = {
        ...chat,
        messages: [...chat.messages, newMessage],
        updatedAt: Date.now(),
      };

      setChat(updatedChat);
      saveChat(adaptToStorageChat(updatedChat));
      setMessage('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !id || !chat) return;

    const userMessage = {
      id: new Date().getTime().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    const updatedChat = {
      ...chat,
      messages: [...chat.messages, userMessage],
      updatedAt: Date.now(),
    };

    setChat(updatedChat);
    saveChat(adaptToStorageChat(updatedChat));
    setMessage('');

    sendMessageMutation.mutate({ videoId: id, message });
  };

  if (isMetadataLoading) {
    return <div>Loading...</div>;
  }

  if (!videoMetadata) {
    return <div>Video not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 py-6">
        <div className="flex flex-col gap-4">
          <VideoPlayer 
            videoId={id} 
            onTimeUpdate={handleTimeUpdate}
            autoplay={settings.autoplay}
            muted={settings.muteByDefault}
          />

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{videoMetadata.title}</h1>
              <p className="text-sm text-muted-foreground">
                By {videoMetadata.author} | Uploaded {videoMetadata.uploadDate}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGenerateSummary}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Summary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-muted-foreground">{videoMetadata.description}</p>
          <Separator />

          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">AI Chat</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? 'Hide' : 'Show'} Chat
                <MessageSquare className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {isSidebarOpen && (
              <div className="flex flex-col gap-4">
                <div 
                  className="h-[400px] p-4 rounded-md bg-secondary overflow-y-auto"
                  ref={chatContainerRef}
                >
                  {chat?.messages.map((msg: any) => (
                    <div key={msg.id} className={`mb-2 p-3 rounded-md ${msg.role === 'user' ? 'bg-muted' : 'bg-accent'}`}>
                      <div className="text-sm text-muted-foreground">
                        {msg.role === 'user' ? 'You' : 'YouGen'}
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask a question about the video..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage}>
                    Send
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="hidden lg:flex flex-col gap-4">
          <h2 className="text-xl font-bold">Summary</h2>
          <div className="bg-secondary p-4 rounded-md">
            {isGenerating ? (
              <div>Generating summary...</div>
            ) : (
              <>
                <div className="flex justify-end">
                  <Badge className="mb-2">{formatTime(currentTimestamp)}</Badge>
                </div>
                {summary ? (
                  <ScrollArea className="h-[400px]">
                    <p className="text-sm">{summary}</p>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No summary generated yet.
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Summary'}
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
