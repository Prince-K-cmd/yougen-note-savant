
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VideoCard } from "@/components/youtube/VideoCard";
import { getPlaylistMetadata, savePlaylistMetadata } from "@/utils/storage";
import { PlaylistMetadata, VideoMetadata } from "@/types/youtube";
import { Download, ListVideo } from "lucide-react";
import { youtubeApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import websocketService from "@/services/websocket";

// Loading state for playlist data
const loadingPlaylistData: PlaylistMetadata = {
  id: "",
  title: "Loading...",
  channelTitle: "Loading...",
  channelId: "",
  description: "Loading playlist information...",
  publishedAt: new Date().toISOString(),
  thumbnailUrl: "",
  itemCount: 0,
  videos: [],
};

export default function PlaylistView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlistId, setPlaylistId] = useState(id || "");
  const [playlistData, setPlaylistData] = useState<PlaylistMetadata>(loadingPlaylistData);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    taskId: "",
    completed: 0,
    failed: 0,
    total: 0,
    percentage: 0,
    currentVideo: "",
  });

  // Set up WebSocket connection
  useEffect(() => {
    websocketService.connect();
    
    // Listen for download progress updates
    websocketService.on("download_progress", (data: any) => {
      setDownloadProgress(data);
    });
    
    // Listen for download completion
    websocketService.on("download_complete", (data: any) => {
      setIsDownloading(false);
      toast({
        title: "Download Complete",
        description: `Downloaded ${data.completed} videos. ${data.failed} videos failed.`,
      });
    });
    
    // Listen for download errors
    websocketService.on("download_error", (data: any) => {
      setIsDownloading(false);
      toast({
        title: "Download Error",
        description: data.message || "An error occurred during download.",
        variant: "destructive",
      });
    });
    
    return () => {
      // Clean up WebSocket connection
      websocketService.disconnect();
    };
  }, [toast]);

  // Load playlist data
  useEffect(() => {
    if (!playlistId) {
      navigate("/");
      return;
    }

    const fetchPlaylistData = async () => {
      setIsLoading(true);
      
      try {
        // Try to get cached data first
        const storedPlaylist = getPlaylistMetadata(playlistId);
        
        if (storedPlaylist) {
          setPlaylistData(storedPlaylist);
        } else {
          // If no cached data, fetch from API
          const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
          const apiData = await youtubeApi.getPlaylistMetadata(playlistUrl);
          
          if (apiData) {
            // Convert API response to frontend model
            const playlist: PlaylistMetadata = {
              id: apiData.playlist_id,
              title: apiData.title || "Unknown Playlist",
              channelTitle: apiData.channel || "Unknown Channel",
              channelId: "",
              description: "No description available",
              publishedAt: new Date().toISOString(),
              thumbnailUrl: apiData.thumbnail || "",
              itemCount: apiData.item_count || apiData.videos.length,
              videos: apiData.videos.map((video: any) => ({
                id: video.video_id,
                title: video.title || "Unknown Title",
                channelTitle: video.channel || "Unknown Channel",
                channelId: "",
                description: "",
                publishedAt: video.upload_date ? new Date(video.upload_date).toISOString() : new Date().toISOString(),
                thumbnailUrl: video.thumbnail || `https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`,
                duration: formatDuration(video.duration || 0),
                viewCount: "0",
              })),
            };
            
            setPlaylistData(playlist);
            savePlaylistMetadata(playlist);
          }
        }
      } catch (error) {
        console.error("Error fetching playlist data:", error);
        // Fallback to basic info if API fails
        setPlaylistData({
          ...loadingPlaylistData,
          id: playlistId,
          thumbnailUrl: `https://i.ytimg.com/vi/${playlistId}/hqdefault.jpg`,
        });
        
        toast({
          title: "Error loading playlist",
          description: "Could not fetch playlist information from the server.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistData();
  }, [playlistId, navigate, toast]);

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  const handleDownloadPlaylist = async () => {
    try {
      setIsDownloading(true);
      const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
      
      const response = await fetch("http://localhost:8000/api/youtube/download/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlist_url: playlistUrl,
          format: "mp4",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to start playlist download");
      }
      
      const data = await response.json();
      setDownloadProgress({
        taskId: data.task_id,
        completed: 0,
        failed: 0,
        total: data.total_videos,
        percentage: 0,
        currentVideo: "",
      });
      
      toast({
        title: "Download Started",
        description: `Started downloading ${data.total_videos} videos. You'll be notified when complete.`,
      });
    } catch (error) {
      console.error("Error starting playlist download:", error);
      setIsDownloading(false);
      toast({
        title: "Download Error",
        description: "Could not start the playlist download. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadVideo = async (videoId: string) => {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      const response = await youtubeApi.downloadVideo({
        video_url: videoUrl,
        format: "mp4",
      });
      
      if (response) {
        toast({
          title: "Download Started",
          description: `Downloading "${playlistData.videos.find(v => v.id === videoId)?.title || 'video'}"`,
        });
      }
    } catch (error) {
      console.error("Error downloading video:", error);
      toast({
        title: "Download Error",
        description: "Could not download the video. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Helper function to format duration in seconds to mm:ss format
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container py-6 px-4 sm:px-6 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1">
                <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={playlistData.thumbnailUrl || `https://i.ytimg.com/vi/${playlistId}/hqdefault.jpg`}
                    alt={playlistData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white flex items-center">
                    <ListVideo className="h-3 w-3 mr-1" />
                    {playlistData.itemCount || playlistData.videos.length} videos
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex flex-col h-full">
                  <h1 className="text-2xl font-bold">{playlistData.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{playlistData.channelTitle}</p>
                  
                  <div className="mt-4">
                    <p className="text-sm whitespace-pre-wrap">{playlistData.description}</p>
                  </div>
                  
                  <div className="mt-auto pt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadPlaylist}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Downloading {downloadProgress.percentage}%
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Download All Videos
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {isDownloading && downloadProgress.currentVideo && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Currently downloading: {downloadProgress.currentVideo}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <ListVideo className="mr-2 h-5 w-5" />
                Playlist Videos
              </h2>
              
              {playlistData.videos && playlistData.videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {playlistData.videos.map((video) => (
                    <div key={video.id} className="relative group">
                      <VideoCard
                        video={video}
                        onClick={() => handleVideoClick(video.id)}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full bg-black/70 hover:bg-black/90 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadVideo(video.id);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ListVideo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No videos in this playlist yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
