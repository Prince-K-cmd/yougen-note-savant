
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { IDownloadHistory } from "@/types/api";
import { youtubeApi } from "@/services/api";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, File, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function DownloadsView() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const { data: downloads, isLoading, error } = useQuery({
    queryKey: ['downloads'],
    queryFn: youtubeApi.getDownloadHistory,
    staleTime: 60000, // 1 minute
  });
  
  // Filter downloads based on active tab
  const filteredDownloads = downloads?.filter((download) => {
    if (activeTab === "all") return true;
    if (activeTab === "videos") return !!download.video_id && !download.playlist_id;
    if (activeTab === "playlists") return !!download.playlist_id;
    if (activeTab === "audio") return download.format === "mp3";
    if (activeTab === "video") return download.format === "mp4";
    return true;
  });
  
  // Handle download retry
  const handleRetryDownload = async (download: IDownloadHistory) => {
    try {
      toast({
        title: "Download retry initiated",
        description: `Attempting to re-download "${download.title}"`,
      });
      
      // Logic to retry download would go here
      // This would typically call the API to restart the download
      
    } catch (error) {
      console.error("Error retrying download:", error);
      toast({
        title: "Retry failed",
        description: "Could not restart the download",
        variant: "destructive"
      });
    }
  };

  // Get file icon based on format
  const getFileIcon = (format: string) => {
    if (format === "mp3") {
      return <Music className="h-6 w-6 text-purple-500" />;
    }
    return <File className="h-6 w-6 text-blue-500" />;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

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
        
        <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 sm:w-[500px] mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {/* Content is rendered outside the TabsContent */}
          </TabsContent>
          <TabsContent value="videos" className="mt-0">
            {/* Content is rendered outside the TabsContent */}
          </TabsContent>
          <TabsContent value="playlists" className="mt-0">
            {/* Content is rendered outside the TabsContent */}
          </TabsContent>
          <TabsContent value="audio" className="mt-0">
            {/* Content is rendered outside the TabsContent */}
          </TabsContent>
          <TabsContent value="video" className="mt-0">
            {/* Content is rendered outside the TabsContent */}
          </TabsContent>
        </Tabs>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !filteredDownloads?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Download className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No downloads yet</h2>
            <p className="text-muted-foreground">
              {activeTab !== "all" 
                ? `No ${activeTab} downloads found.` 
                : "Your downloads will appear here after you download videos or playlists."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDownloads.map((download) => (
              <Card key={download.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={download.thumbnail || `https://i.ytimg.com/vi/${download.video_id || 'default'}/hqdefault.jpg`} 
                    alt={download.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(download.status)}
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-clamp-1">{download.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      {getFileIcon(download.format)}
                      <span className="ml-2">
                        {download.format.toUpperCase()} 
                        {download.resolution && ` (${download.resolution})`}
                      </span>
                    </div>
                    <span>{formatFileSize(download.size)}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(download.download_date), "MMM dd, yyyy")}
                  </span>
                  
                  {download.status === "failed" && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRetryDownload(download)}
                    >
                      Retry
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
