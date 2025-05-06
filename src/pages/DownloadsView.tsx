
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Loader2, FileVideo, Music } from "lucide-react";
import { IDownloadHistory } from "@/types/api";
import { youtubeApi } from "@/services/api";

export default function DownloadsView() {
  const { data: downloads, isLoading, error } = useQuery({
    queryKey: ['downloads'],
    queryFn: youtubeApi.getDownloadHistory,
    staleTime: 60000, // 1 minute
  });
  
  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), "MMM dd, yyyy h:mm a");
  };
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-6 px-4 sm:px-6 flex-grow">
          <div className="flex items-center gap-2 mb-6">
            <Download className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Downloads</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video w-full bg-muted">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-12 flex-grow flex flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Downloads</h2>
            <p className="text-muted-foreground mb-4">
              Could not connect to the backend server. Please make sure the server is running.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container py-6 px-4 sm:px-6 flex-grow">
        <div className="flex items-center gap-2 mb-6">
          <Download className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Downloads</h1>
        </div>
        
        {!downloads || downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Download className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No downloads yet</h2>
            <p className="text-muted-foreground">
              Your downloaded videos and audio will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((download) => (
              <Card key={download.id} className="overflow-hidden">
                <div className="aspect-video w-full bg-muted">
                  {download.thumbnail ? (
                    <img 
                      src={download.thumbnail} 
                      alt={download.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {download.format === "mp3" ? (
                        <Music className="h-12 w-12 text-muted-foreground" />
                      ) : (
                        <FileVideo className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base line-clamp-2">{download.title}</CardTitle>
                  <CardDescription>
                    {formatDate(download.download_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <Badge variant={download.format === "mp3" ? "secondary" : "default"}>
                      {download.format === "mp3" ? "Audio" : "Video"} 
                      {download.resolution ? ` (${download.resolution}p)` : ""}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(download.size)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
