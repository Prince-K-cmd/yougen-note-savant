
import { Settings } from "./types";

// Settings functions
export const getSettings = (): Settings => {
  const defaultSettings: Settings = {
    theme: 'system',
    fontScale: 1.0,
    autoplay: true,
    defaultPlaybackSpeed: 1.0,
    defaultVolume: 1.0,
    defaultDownloadQuality: 'medium',
    autosaveNotes: true,
    enableNotifications: true,
    notifyNewSummaries: true,
    notifyTranscriptReady: true,
    notifyNotesSaved: false,
  };

  try {
    const storedSettings = localStorage.getItem('yougen_settings');
    if (storedSettings) {
      return { ...defaultSettings, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  return defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem('yougen_settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};
