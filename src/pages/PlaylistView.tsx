
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VideoCard } from "@/components/youtube/VideoCard";
import { getPlaylistMetadata } from "@/utils/storage";
import { PlaylistMetadata } from "@/types/youtube";
import { Download, ListVideo } from "lucide-react";

// Mock playlist data for initial UI rendering
const mockPlaylistData: PlaylistMetadata = {
  id: "",
  title: "Sample Playlist",
  channelTitle: "Sample Channel",
  channelId: "",
  description: "This is a sample playlist description.",
  publishedAt: new Date().toISOString(),
  thumbnailUrl: "",
  itemCount: 0,
  videos: [],
};

export default function PlaylistView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlistId, setPlaylistId] = useState(id || "");
  const [playlistData, setPlaylistData] = useState<PlaylistMetadata>(mockPlaylistData);
  const [isLoading, setIsLoading] = useState(true);

  // Load playlist data
  useEffect(() => {
    if (!playlistId) {
      navigate("/");
      return;
    }

    // Load playlist metadata from storage
    const storedPlaylist = getPlaylistMetadata(playlistId);
    if (storedPlaylist) {
      setPlaylistData(storedPlaylist);
    } else {
      // If no stored metadata, use a placeholder with the correct ID
      setPlaylistData({
        ...mockPlaylistData,
        id: playlistId,
        thumbnailUrl: `https://i.ytimg.com/vi/${playlistId}/hqdefault.jpg`,
      });
      
      // In a real app, we would fetch the metadata from YouTube API
      // and save it to storage
    }

    setIsLoading(false);
  }, [playlistId, navigate]);

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
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
                    {playlistData.itemCount || 0} videos
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
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download Playlist
                    </Button>
                  </div>
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
                    <VideoCard
                      key={video.id}
                      video={video}
                      onClick={() => handleVideoClick(video.id)}
                    />
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
