
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { historyApi } from "@/services/api";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Loader2 } from "lucide-react";

export default function HistoryView() {
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['history'],
    queryFn: historyApi.getHistory,
    staleTime: 60000, // 1 minute
  });
  
  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), "MMM dd, yyyy h:mm a");
  };

  const renderTimelineItem = (note: any) => (
    <div key={note.id} className="relative pl-6 pb-8 last:pb-0">
      <div className="absolute left-0 top-1 h-4 w-4 rounded-full border border-primary bg-background"></div>
      <div className="absolute left-2 top-5 h-full w-[1px] bg-muted"></div>
      <div className="mb-1 text-sm text-muted-foreground">
        {formatDate(note.updated_at)}
      </div>
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">{note.title}</CardTitle>
          <CardDescription>
            {note.updated_at !== note.created_at 
              ? "Updated note" 
              : "Created new note"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="line-clamp-2 text-sm">
            {note.content_text?.substring(0, 150) || note.content?.substring(0, 150)}
            {(note.content_text?.length > 150 || note.content?.length > 150) ? '...' : ''}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Group notes by time period
  const groupNotesByTimePeriod = (notes: any[]) => {
    if (!notes) return { today: [], thisWeek: [], older: [] };
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(todayStart - 6 * 24 * 60 * 60 * 1000).getTime();
    
    return {
      today: notes.filter(note => new Date(note.updated_at).getTime() >= todayStart),
      thisWeek: notes.filter(note => {
        const timestamp = new Date(note.updated_at).getTime();
        return timestamp >= weekStart && timestamp < todayStart;
      }),
      older: notes.filter(note => new Date(note.updated_at).getTime() < weekStart)
    };
  };
  
  const renderTimelineSection = (title: string, sectionNotes: any[]) => {
    if (!sectionNotes || sectionNotes.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">{title}</h2>
        <div>
          {sectionNotes.map(renderTimelineItem)}
        </div>
      </div>
    );
  };
  
  // Group notes
  const groupedNotes = groupNotesByTimePeriod(notes);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-12 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading history...</p>
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
            <h2 className="text-xl font-semibold mb-2">Error Loading History</h2>
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
          <History className="h-6 w-6" />
          <h1 className="text-2xl font-bold">History</h1>
        </div>
        
        {!notes || notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <History className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No history yet</h2>
            <p className="text-muted-foreground">
              Your note editing history will appear here as you create and edit notes.
            </p>
          </div>
        ) : (
          <div>
            {renderTimelineSection("Today", groupedNotes.today)}
            {renderTimelineSection("This Week", groupedNotes.thisWeek)}
            {renderTimelineSection("Older", groupedNotes.older)}
          </div>
        )}
      </div>
    </div>
  );
}
