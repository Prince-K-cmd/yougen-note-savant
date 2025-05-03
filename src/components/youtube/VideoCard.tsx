
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoMetadata } from '@/types/youtube';
import { getPlaceholderThumbnail } from '@/utils/youtube';
import { Play } from 'lucide-react';

interface VideoCardProps {
  video: Partial<VideoMetadata>;
  onClick?: () => void;
  isActive?: boolean;
}

export function VideoCard({ video, onClick, isActive }: VideoCardProps) {
  const thumbnailUrl = video.thumbnailUrl || (video.id ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` : getPlaceholderThumbnail());
  
  return (
    <Card 
      className={`overflow-hidden transition-all hover:shadow-md ${
        isActive ? 'border-primary ring-1 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={video.title || 'Video thumbnail'} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
          <Button size="icon" variant="secondary" className="rounded-full">
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <CardHeader className="py-3 px-3">
        <CardTitle className="text-base line-clamp-1">
          {video.title || 'Video title'}
        </CardTitle>
        <CardDescription className="text-xs line-clamp-1">
          {video.channelTitle || 'Channel name'}
        </CardDescription>
      </CardHeader>
      <CardFooter className="py-2 px-3 text-xs text-muted-foreground flex justify-between">
        <span>{video.duration || ''}</span>
        <span>{video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : ''}</span>
      </CardFooter>
    </Card>
  );
}
