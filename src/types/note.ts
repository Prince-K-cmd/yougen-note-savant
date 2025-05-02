
import { YoutubeTimestamp } from "./youtube";

export interface NoteTag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  resourceId: string; // YouTube video or playlist ID
  title: string;
  content: string;
  tags: NoteTag[];
  createdAt: number;
  updatedAt: number;
  videoTimestamp?: YoutubeTimestamp;
  fromChatId?: string; // If note was created from a chat
}
