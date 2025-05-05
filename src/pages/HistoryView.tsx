
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { getAllNotes, getSortedNotes } from "@/utils/storage";
import { Note } from "@/types/note";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function HistoryView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesToday, setNotesToday] = useState<Note[]>([]);
  const [notesThisWeek, setNotesThisWeek] = useState<Note[]>([]);
  const [notesOlder, setNotesOlder] = useState<Note[]>([]);

  useEffect(() => {
    const allNotes = getSortedNotes();
    setNotes(allNotes);

    // Group notes by time periods
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(todayStart - 6 * 24 * 60 * 60 * 1000).getTime();

    setNotesToday(allNotes.filter(note => note.updatedAt >= todayStart));
    setNotesThisWeek(allNotes.filter(note => note.updatedAt >= weekStart && note.updatedAt < todayStart));
    setNotesOlder(allNotes.filter(note => note.updatedAt < weekStart));
  }, []);

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM dd, yyyy h:mm a");
  };

  const renderTimelineItem = (note: Note) => (
    <div key={note.id} className="relative pl-6 pb-8 last:pb-0">
      <div className="absolute left-0 top-1 h-4 w-4 rounded-full border border-primary bg-background"></div>
      <div className="absolute left-2 top-5 h-full w-[1px] bg-muted"></div>
      <div className="mb-1 text-sm text-muted-foreground">
        {formatDate(note.updatedAt)}
      </div>
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">{note.title}</CardTitle>
          <CardDescription>
            {note.updatedAt !== note.createdAt 
              ? "Updated note" 
              : "Created new note"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="line-clamp-2 text-sm">
            {note.content.substring(0, 150)}{note.content.length > 150 ? '...' : ''}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTimelineSection = (title: string, sectionNotes: Note[]) => {
    if (sectionNotes.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">{title}</h2>
        <div>
          {sectionNotes.map(renderTimelineItem)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container py-6 px-4 sm:px-6 flex-grow">
        <div className="flex items-center gap-2 mb-6">
          <History className="h-6 w-6" />
          <h1 className="text-2xl font-bold">History</h1>
        </div>
        
        {notes.length === 0 ? (
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
            {renderTimelineSection("Today", notesToday)}
            {renderTimelineSection("This Week", notesThisWeek)}
            {renderTimelineSection("Older", notesOlder)}
          </div>
        )}
      </div>
    </div>
  );
}
