
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { getPlaylistMetadata, savePlaylist, saveVideo } from "@/utils/storage";
import { VideoCard } from "@/components/youtube/VideoCard";
import { VideoMetadata } from "@/types/youtube";
import { fetchVideoDetails } from "@/utils/youtube";

// A simple placeholder component for PlaylistView
// This would be expanded with proper functionality in a real implementation
export default function PlaylistView() {
  const { id } = useParams<{id: string}>();
  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Try to get from local storage first
        const storedPlaylist = getPlaylistMetadata(id);
        
        if (storedPlaylist) {
          setPlaylist(storedPlaylist);
        } else {
          // Fetch from API (in a real app)
          // For now, just create a placeholder
          // Creating sample videos with proper types
          const sampleVideos: VideoMetadata[] = [
            {
              id: "video1",
              title: "Video 1",
              description: "Sample video description",
              thumbnailUrl: "https://via.placeholder.com/480x360",
              author: "YouTube Creator",
              uploadDate: new Date().toISOString(),
              viewCount: "1000",
              channelId: "channel123",
              channelTitle: "YouTube Creator",
              publishedAt: new Date().toISOString(),
              duration: "5:00"
            },
            {
              id: "video2",
              title: "Video 2",
              description: "Sample video description",
              thumbnailUrl: "https://via.placeholder.com/480x360",
              author: "YouTube Creator",
              uploadDate: new Date().toISOString(),
              viewCount: "2000",
              channelId: "channel123",
              channelTitle: "YouTube Creator",
              publishedAt: new Date().toISOString(),
              duration: "7:30"
            },
            {
              id: "video3",
              title: "Video 3",
              description: "Sample video description",
              thumbnailUrl: "https://via.placeholder.com/480x360",
              author: "YouTube Creator",
              uploadDate: new Date().toISOString(),
              viewCount: "1500",
              channelId: "channel123",
              channelTitle: "YouTube Creator",
              publishedAt: new Date().toISOString(),
              duration: "3:45"
            }
          ];
          
          const placeholderPlaylist = {
            id,
            title: `Playlist ${id}`,
            description: "This is a placeholder for the playlist view. In a real app, this would fetch and display actual playlist data.",
            thumbnailUrl: "https://via.placeholder.com/480x360",
            author: "YouTube Creator",
            channelTitle: "YouTube Creator",
            channelId: "channel123",
            videoCount: sampleVideos.length,
            itemCount: sampleVideos.length,
            publishedAt: new Date().toISOString(),
            videos: sampleVideos
          };
          
          setPlaylist(placeholderPlaylist);
          
          // Save to storage
          savePlaylist(placeholderPlaylist);
          
          // Save videos too
          sampleVideos.forEach(video => {
            saveVideo(video);
          });
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlaylist();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto"></div>
            <p className="mt-2">Loading playlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-6 flex-1">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Playlist not found</h1>
            <p className="text-muted-foreground">The playlist you requested could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container py-6 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{playlist.title}</h1>
          <p className="text-muted-foreground mb-4">
            By {playlist.author} • {playlist.videoCount} videos
          </p>
          <p>{playlist.description}</p>
        </div>

        <h2 className="text-2xl font-bold mb-4">Videos in this playlist</h2>
        
        {playlist.videos && playlist.videos.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {playlist.videos.map((video: VideoMetadata) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No videos in this playlist.
          </div>
        )}
      </main>
    </div>
  );
}
