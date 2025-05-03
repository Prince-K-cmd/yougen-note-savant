
import { VideoMetadata } from "@/types/youtube";

// Video functions
export const saveVideoMetadata = (video: VideoMetadata): void => {
  try {
    const currentVideos = getAllVideos();
    const existingVideoIndex = currentVideos.findIndex(
      (v) => v.id === video.id
    );

    if (existingVideoIndex >= 0) {
      currentVideos[existingVideoIndex] = {
        ...currentVideos[existingVideoIndex],
        ...video,
        updatedAt: Date.now(),
      };
    } else {
      const videoWithTimestamps: VideoMetadata = {
        ...video,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      currentVideos.push(videoWithTimestamps);
    }

    localStorage.setItem("yougen_videos", JSON.stringify(currentVideos));
  } catch (error) {
    console.error("Error saving video metadata:", error);
  }
};

export const getVideoMetadata = (videoId: string): VideoMetadata | null => {
  try {
    const videos = getAllVideos();
    return videos.find((video) => video.id === videoId) || null;
  } catch (error) {
    console.error("Error getting video metadata:", error);
    return null;
  }
};

export const getAllVideos = (): VideoMetadata[] => {
  try {
    const videos = localStorage.getItem("yougen_videos");
    return videos ? JSON.parse(videos) : [];
  } catch (error) {
    console.error("Error getting all videos:", error);
    return [];
  }
};
