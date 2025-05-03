import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { PlaylistMetadata, VideoMetadata } from "@/types/youtube";
import { getPlaylistMetadata, getVideoMetadata } from "@/utils/youtube";
import { savePlaylist, saveVideo } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Youtube } from "lucide-react";
import { VideoCard } from "@/components/youtube/VideoCard";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { getSettings } from "@/utils/storage";

interface Params {
  id: string;
}

function VideoPlayer({ videoId, autoplay, muted }: { videoId: string, autoplay: boolean, muted: boolean }) {
  return (
    <div className="relative aspect-video w-full">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
}

export default function PlaylistView() {
  const { id } = useParams<Params>();
  const [playlist, setPlaylist] = useState<PlaylistMetadata | null>(null);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const settings = getSettings();

  const { 
    data: playlistData, 
    isLoading: isPlaylistLoading, 
    isError: isPlaylistError 
  } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => getPlaylistMetadata(id!),
    enabled: !!id,
    retry: false,
  });

  useEffect(() => {
    if (playlistData) {
      setPlaylist(playlistData);
      setVideos(playlistData.videos);
      setCurrentVideo(playlistData.videos[0]);
      setIsLoading(false);
      savePlaylist(playlistData);
    }
  }, [playlistData]);

  useEffect(() => {
    if (isPlaylistError) {
      toast.error("Failed to load playlist. Please check the ID and try again.");
      setIsLoading(false);
    }
  }, [isPlaylistError]);

  const handleVideoClick = (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (video) {
      setCurrentVideo(video);
      saveVideo(video);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading playlist...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!playlist || !currentVideo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Playlist not found.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-6 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-start justify-between">
              <div className="w-full md:w-3/5">
                <h1 className="text-3xl font-bold tracking-tight mb-2">{playlist.title}</h1>
                <p className="text-muted-foreground mb-4 line-clamp-3">{playlist.description}</p>

                <VideoPlayer 
                  videoId={currentVideo.id} 
                  autoplay={settings.autoplay}
                  muted={settings.muteByDefault}
                />
              </div>

              <div className="w-full md:w-2/5 md:pl-8">
                <h2 className="text-xl font-bold mb-4">Playlist Videos</h2>
                <div className="h-[60vh]">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {videos.map((video) => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          onClick={() => handleVideoClick(video.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
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
