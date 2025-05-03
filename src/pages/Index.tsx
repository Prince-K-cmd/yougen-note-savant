
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { VideoCard } from "@/components/youtube/VideoCard";
import { PlaylistCard } from "@/components/youtube/PlaylistCard";
import { useToast } from "@/components/ui/use-toast";
import { extractVideoId, extractPlaylistId } from "@/hooks/useYoutubeUrl";
import { getAllVideos, getAllPlaylists } from "@/utils/storage";
import { VideoMetadata, PlaylistMetadata } from "@/types/youtube";

export default function Index() {
  const recentVideos = getAllVideos();
  const recentPlaylists = getAllPlaylists();
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoId = extractVideoId(url);
    if (videoId) {
      navigate(`/video/${videoId}`);
      return;
    }

    const playlistId = extractPlaylistId(url);
    if (playlistId) {
      navigate(`/playlist/${playlistId}`);
      return;
    }

    toast({
      title: "Invalid URL",
      description: "Please enter a valid YouTube video or playlist URL",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container py-6 flex-1">
        <div className="mx-auto max-w-2xl mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">YouGen</h1>
          <p className="text-muted-foreground text-center mb-6">
            Analyze YouTube videos with AI
          </p>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Paste YouTube video or playlist URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Analyze</Button>
          </form>
        </div>
        
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-4">
            <TabsTrigger value="videos">Recent Videos</TabsTrigger>
            <TabsTrigger value="playlists">Recent Playlists</TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos">
            {recentVideos.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {recentVideos.map((video) => (
                  <VideoCard key={video.id} video={{
                    id: video.id,
                    title: video.title,
                    description: video.description,
                    thumbnailUrl: video.thumbnailUrl,
                    channelTitle: video.author,
                    publishedAt: video.uploadDate,
                    duration: video.duration,
                    viewCount: video.viewCount,
                    channelId: video.channelId
                  }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No recent videos. Paste a YouTube URL above to get started.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="playlists">
            {recentPlaylists.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {recentPlaylists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={{
                    id: playlist.id,
                    title: playlist.title,
                    description: playlist.description,
                    thumbnailUrl: playlist.thumbnailUrl,
                    channelTitle: playlist.author,
                    publishedAt: playlist.publishedAt,
                    itemCount: playlist.videoCount,
                    channelId: playlist.channelId,
                    videos: playlist.videos
                  }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No recent playlists. Paste a YouTube URL above to get started.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
