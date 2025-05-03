
import { useEffect, useRef, useState } from 'react';
import { VideoMetadata } from '@/types/youtube';
import { getSettings } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Settings, Subtitles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [currentPlaybackRate, setCurrentPlaybackRate] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(false);
  
  // Load settings
  useEffect(() => {
    const settings = getSettings();
    if (settings.defaultPlaybackSpeed) {
      setCurrentPlaybackRate(settings.defaultPlaybackSpeed);
    }
  }, []);

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
        cc_load_policy: subtitlesEnabled ? 1 : 0,
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
    
    // Apply default playback speed
    if (ytPlayerRef.current && ytPlayerRef.current.setPlaybackRate) {
      ytPlayerRef.current.setPlaybackRate(currentPlaybackRate);
    }
    
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
  
  function changePlaybackRate(rate: number) {
    if (ytPlayerRef.current && ytPlayerRef.current.setPlaybackRate) {
      ytPlayerRef.current.setPlaybackRate(rate);
      setCurrentPlaybackRate(rate);
    }
  }
  
  function toggleSubtitles() {
    setSubtitlesEnabled(prev => !prev);
    if (ytPlayerRef.current) {
      // Unfortunately YouTube iframe API doesn't have a direct method to toggle captions
      // We'd need to recreate the player with different cc_load_policy
      initPlayer();
    }
  }

  return (
    <div 
      className="aspect-video w-full bg-black relative rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
        </div>
      )}
      <div ref={playerRef} className="w-full h-full" />
      
      {/* Custom controls overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white">
                <Subtitles className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleSubtitles}>
                {subtitlesEnabled ? 'Disable Subtitles' : 'Enable Subtitles'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => changePlaybackRate(0.5)}
                className={currentPlaybackRate === 0.5 ? "bg-accent" : ""}
              >
                0.5x
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changePlaybackRate(0.75)}
                className={currentPlaybackRate === 0.75 ? "bg-accent" : ""}
              >
                0.75x
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changePlaybackRate(1)}
                className={currentPlaybackRate === 1 ? "bg-accent" : ""}
              >
                Normal (1x)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changePlaybackRate(1.25)}
                className={currentPlaybackRate === 1.25 ? "bg-accent" : ""}
              >
                1.25x
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changePlaybackRate(1.5)}
                className={currentPlaybackRate === 1.5 ? "bg-accent" : ""}
              >
                1.5x
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changePlaybackRate(2)}
                className={currentPlaybackRate === 2 ? "bg-accent" : ""}
              >
                2x
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
