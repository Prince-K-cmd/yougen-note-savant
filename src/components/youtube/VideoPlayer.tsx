
import { useEffect, useRef, useState } from 'react';
import { VideoMetadata } from '@/types/youtube';

interface VideoPlayerProps {
  videoId: string;
  metadata?: VideoMetadata;
  onTimeUpdate?: (currentTime: number) => void;
  onReady?: () => void;
  startTime?: number;
  autoplay?: boolean;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

let apiLoaded = false;

export function VideoPlayer({
  videoId,
  onTimeUpdate,
  onReady,
  startTime = 0,
  autoplay = false
}: VideoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!apiLoaded) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initPlayer;
      apiLoaded = true;
    } else {
      initPlayer();
    }

    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
      }
    };
  }, [videoId]);

  function initPlayer() {
    if (!playerRef.current) return;

    if (ytPlayerRef.current) {
      ytPlayerRef.current.destroy();
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      // Wait for API to be ready
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT);
          createPlayer();
        }
      }, 100);
    }
  }

  function createPlayer() {
    if (!playerRef.current) return;

    setIsLoading(true);
    ytPlayerRef.current = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        start: startTime,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: handleReady,
        onStateChange: handleStateChange,
      },
    });
  }

  function handleReady() {
    setIsLoading(false);
    if (onReady) onReady();
    
    // Start time tracking interval
    if (onTimeUpdate) {
      const interval = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          onTimeUpdate(ytPlayerRef.current.getCurrentTime());
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }

  function handleStateChange(event: any) {
    // Handle player state changes if needed
  }

  return (
    <div className="aspect-video w-full bg-black relative rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
        </div>
      )}
      <div ref={playerRef} className="w-full h-full" />
    </div>
  );
}
