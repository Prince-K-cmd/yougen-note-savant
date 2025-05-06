
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UrlInput } from "@/components/youtube/UrlInput";
import { VideoCard } from "@/components/youtube/VideoCard";
import { PlaylistCard } from "@/components/youtube/PlaylistCard";
import { Header } from "@/components/layout/Header";
import { ResourceType, VideoMetadata, PlaylistMetadata } from "@/types/youtube";
import { getAllVideos, getAllPlaylists } from "@/utils/storage";
import { Youtube, MessageSquare, FileText as NoteIcon, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { youtubeApi } from "@/services/api";

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recentVideos, setRecentVideos] = useState<VideoMetadata[]>(() => getAllVideos().slice(0, 6));
  const [recentPlaylists, setRecentPlaylists] = useState<PlaylistMetadata[]>(() => getAllPlaylists().slice(0, 3));
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  // Check if backend is available
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/');
        setIsBackendAvailable(response.ok);
      } catch (error) {
        console.error('Backend connection failed:', error);
        setIsBackendAvailable(false);
      }
    };
    
    checkBackend();
  }, []);

  const handleUrlSubmit = async (parseResult: { type: string; id: string; url: string }) => {
    if (parseResult.type === ResourceType.VIDEO) {
      // If backend is available, try to fetch metadata first
      if (isBackendAvailable) {
        try {
          await youtubeApi.getMetadata(parseResult.url);
        } catch (error) {
          console.error('Error fetching video metadata:', error);
          toast({
            title: 'Warning',
            description: 'Could not fetch video metadata from backend. Using client-side parsing.',
            variant: 'default',
          });
        }
      }
      navigate(`/video/${parseResult.id}`);
    } else if (parseResult.type === ResourceType.PLAYLIST) {
      // If backend is available, try to fetch playlist metadata first
      if (isBackendAvailable) {
        try {
          await youtubeApi.getPlaylistMetadata(parseResult.url);
        } catch (error) {
          console.error('Error fetching playlist metadata:', error);
          toast({
            title: 'Warning',
            description: 'Could not fetch playlist metadata from backend. Using client-side parsing.',
            variant: 'default',
          });
        }
      }
      navigate(`/playlist/${parseResult.id}`);
    }
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  const handlePlaylistClick = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-12 px-4 md:py-24">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-brand-purple/10 p-4 rounded-full">
                <Youtube className="h-12 w-12 text-brand-purple" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-3">
              YouGen <span className="text-brand-teal">Note Savant</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Enhance your YouTube experience with AI-powered insights, smart notes, and video downloads.
            </p>
            
            <div className="max-w-2xl mx-auto">
              <UrlInput onSubmit={handleUrlSubmit} />
            </div>
            
            {!isBackendAvailable && (
              <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md max-w-2xl mx-auto text-sm">
                Warning: Backend server not connected. Some features may be unavailable. Make sure the backend is running at http://localhost:8000
              </div>
            )}
          </div>
        </section>

        {/* Recent Videos Section */}
        {recentVideos.length > 0 && (
          <section className="py-8 px-4">
            <div className="container">
              <h2 className="text-2xl font-bold mb-6">Recent Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={() => handleVideoClick(video.id)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Playlists Section */}
        {recentPlaylists.length > 0 && (
          <section className="py-8 px-4">
            <div className="container">
              <h2 className="text-2xl font-bold mb-6">Recent Playlists</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recentPlaylists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => handlePlaylistClick(playlist.id)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Feature highlights */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-12">Powerful Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-brand-purple/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-brand-purple" />
                </div>
                <h3 className="text-xl font-medium mb-2">AI-Powered Insights</h3>
                <p className="text-muted-foreground">
                  Ask questions about video content, get contextual information, and generate summaries automatically.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-brand-teal/10 flex items-center justify-center mb-4">
                  <NoteIcon className="h-6 w-6 text-brand-teal" />
                </div>
                <h3 className="text-xl font-medium mb-2">Smart Note-Taking</h3>
                <p className="text-muted-foreground">
                  Create timestamped notes, organize with tags, and convert AI chat interactions into notes.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-brand-purple/10 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-brand-purple" />
                </div>
                <h3 className="text-xl font-medium mb-2">Video Downloads</h3>
                <p className="text-muted-foreground">
                  Download videos or playlists in multiple formats with quality options for offline viewing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 px-4">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} YouGen Note Savant. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Not affiliated with YouTube or Google
          </p>
        </div>
      </footer>
    </div>
  );
}
