
import { YoutubeTimestamp } from "./youtube";

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  videoTimestamp?: YoutubeTimestamp;
}

export interface Chat {
  id: string;
  resourceId: string; // YouTube video or playlist ID
  messages: Message[];
  title: string;
  createdAt: number;
  updatedAt: number;
}
