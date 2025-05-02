
import { PlaylistMetadata } from "@/types/youtube";
import { ListVideo } from "lucide-react";

interface PlaylistCardProps {
  playlist: PlaylistMetadata;
  onClick?: () => void;
}

export function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  return (
    <div 
      className="bg-card rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-video relative">
        <img 
          src={playlist.thumbnailUrl || `https://i.ytimg.com/vi/${playlist.id}/hqdefault.jpg`} 
          alt={playlist.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white flex items-center">
          <ListVideo className="h-3 w-3 mr-1" />
          {playlist.itemCount} videos
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium line-clamp-1">{playlist.title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{playlist.channelTitle}</p>
      </div>
    </div>
  );
}
