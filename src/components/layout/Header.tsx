
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Youtube, ArrowLeft, History, Settings } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllChats, getVideoMetadata } from "@/utils/storage";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const chats = getAllChats().sort((a, b) => b.updatedAt - a.updatedAt);
  const isVideoPage = location.pathname.includes('/video/');

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleHistoryItemClick = (resourceId: string) => {
    setIsHistoryOpen(false);
    navigate(`/video/${resourceId}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {isVideoPage && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleGoBack} 
              className="mr-2"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <Youtube className="h-6 w-6 text-brand-purple" />
            <h1 className="text-xl font-semibold tracking-tight">
              YouGen <span className="text-brand-teal">Note Savant</span>
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <History className="h-4 w-4" />
                History
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Viewing History</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[60vh] mt-4">
                {chats.length > 0 ? (
                  <div className="space-y-2">
                    {chats.map(chat => {
                      const video = getVideoMetadata(chat.resourceId);
                      return (
                        <div 
                          key={chat.id} 
                          onClick={() => handleHistoryItemClick(chat.resourceId)}
                          className="p-3 rounded-md border hover:bg-accent cursor-pointer"
                        >
                          <div className="font-medium truncate">
                            {video?.title || chat.title}
                          </div>
                          <div className="text-sm text-muted-foreground flex justify-between mt-1">
                            <span>
                              {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                            </span>
                            <span>
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No history yet. Start watching videos and chatting!
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <ThemeToggle />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/settings')}
            className="gap-1"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}
