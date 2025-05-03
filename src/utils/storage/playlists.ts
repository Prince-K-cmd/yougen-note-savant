
import { PlaylistMetadata } from "@/types/youtube";

// Playlist functions
export const savePlaylistMetadata = (
  playlist: PlaylistMetadata
): void => {
  try {
    const currentPlaylists = getAllPlaylists();
    const existingPlaylistIndex = currentPlaylists.findIndex(
      (p) => p.id === playlist.id
    );

    if (existingPlaylistIndex >= 0) {
      currentPlaylists[existingPlaylistIndex] = {
        ...currentPlaylists[existingPlaylistIndex],
        ...playlist,
        updatedAt: Date.now(),
      };
    } else {
      const playlistWithTimestamps: PlaylistMetadata = {
        ...playlist,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      currentPlaylists.push(playlistWithTimestamps);
    }

    localStorage.setItem("yougen_playlists", JSON.stringify(currentPlaylists));
  } catch (error) {
    console.error("Error saving playlist metadata:", error);
  }
};

export const getPlaylistMetadata = (
  playlistId: string
): PlaylistMetadata | null => {
  try {
    const playlists = getAllPlaylists();
    return playlists.find((playlist) => playlist.id === playlistId) || null;
  } catch (error) {
    console.error("Error getting playlist metadata:", error);
    return null;
  }
};

export const getAllPlaylists = (): PlaylistMetadata[] => {
  try {
    const playlists = localStorage.getItem("yougen_playlists");
    return playlists ? JSON.parse(playlists) : [];
  } catch (error) {
    console.error("Error getting all playlists:", error);
    return [];
  }
};
