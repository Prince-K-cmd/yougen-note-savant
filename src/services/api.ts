
import axios from "axios";
import { 
  IChatRequest, 
  IChatResponse, 
  IDownloadRequest, 
  IDownloadResponse, 
  INoteRequest, 
  INoteResponse, 
  IVideoMetadata,
  IFormatListRequest,
  IFormatListResponse,
  IBatchDownloadRequest, 
  IBatchDownloadResponse 
} from "@/types/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:8000/api", // Change this to your actual backend URL in production
  headers: {
    "Content-Type": "application/json",
  },
});

// YouTube API services
export const youtubeApi = {
  getMetadata: async (url: string): Promise<IVideoMetadata> => {
    const response = await api.get("/youtube/metadata", { params: { url } });
    return response.data;
  },

  downloadVideo: async (request: IDownloadRequest): Promise<IDownloadResponse> => {
    const response = await api.post("/youtube/download", request);
    return response.data;
  },
  
  // Get playlist details
  getPlaylistMetadata: async (url: string): Promise<any> => {
    const response = await api.get("/youtube/playlist", { params: { url } });
    return response.data;
  },
  
  // Get available formats for a video
  getVideoFormats: async (videoUrl: string): Promise<IFormatListResponse> => {
    const response = await api.post("/youtube/formats", { video_url: videoUrl });
    return response.data;
  },
  
  // Download a playlist
  downloadPlaylist: async (request: IBatchDownloadRequest): Promise<IBatchDownloadResponse> => {
    const response = await api.post("/youtube/download/batch", request);
    return response.data;
  },
  
  // Get video transcript
  getTranscript: async (videoId: string, language: string = "en"): Promise<any> => {
    const response = await api.get("/youtube/transcript", { 
      params: { video_id: videoId, language } 
    });
    return response.data;
  }
};

// AI chat services
export const aiApi = {
  sendMessage: async (request: IChatRequest): Promise<IChatResponse> => {
    const response = await api.post("/ai/chat", request);
    return response.data;
  }
};

// Notes services
export const notesApi = {
  saveNote: async (request: INoteRequest): Promise<INoteResponse> => {
    const response = await api.post("/note/save", request);
    return response.data;
  },

  getNotesForVideo: async (videoUrl: string): Promise<INoteResponse[]> => {
    const response = await api.get("/note/list", { params: { video_url: videoUrl } });
    return response.data;
  },

  updateNote: async (noteId: number, request: INoteRequest): Promise<INoteResponse> => {
    const response = await api.put(`/note/${noteId}`, request);
    return response.data;
  }
};
