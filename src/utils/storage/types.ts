
import { ResourceType, VideoMetadata, PlaylistMetadata } from "@/types/youtube";
import { Chat, Message } from "@/types/chat";
import { Note } from "@/types/note";

// Define settings interface
export interface Settings {
  theme?: 'light' | 'dark' | 'system';
  fontScale?: number;
  autoplay?: boolean;
  defaultPlaybackSpeed?: number;
  defaultVolume?: number;
  defaultDownloadQuality?: 'low' | 'medium' | 'high';
  autosaveNotes?: boolean;
  enableNotifications?: boolean;
  notifyNewSummaries?: boolean;
  notifyTranscriptReady?: boolean;
  notifyNotesSaved?: boolean;
  [key: string]: any;
}
