
import { TranscriptSegment } from "@/components/transcripts/TranscriptViewer";
import { v4 as uuidv4 } from "uuid";

interface StoredTranscript {
  videoId: string;
  segments: TranscriptSegment[];
  updatedAt: number;
}

const STORAGE_KEY = 'yougen_transcripts';

// Helper functions for local storage
const getStoredTranscripts = (): Record<string, StoredTranscript> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error retrieving transcripts:', error);
    return {};
  }
};

const saveTranscript = (videoId: string, segments: TranscriptSegment[]): void => {
  try {
    const transcripts = getStoredTranscripts();
    transcripts[videoId] = {
      videoId,
      segments,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transcripts));
  } catch (error) {
    console.error('Error saving transcript:', error);
  }
};

// Mock function to generate a transcript - in a real app, this would call an API
export const generateTranscript = async (videoId: string): Promise<TranscriptSegment[]> => {
  const existingTranscript = getTranscriptByVideoId(videoId);
  if (existingTranscript) {
    return existingTranscript;
  }

  // For demo purposes, creating a fake transcript
  const mockTranscript = createMockTranscript();
  saveTranscript(videoId, mockTranscript);
  return mockTranscript;
};

export const getTranscriptByVideoId = (videoId: string): TranscriptSegment[] | null => {
  const transcripts = getStoredTranscripts();
  return transcripts[videoId]?.segments || null;
};

// Helper to create mock transcript data
const createMockTranscript = (): TranscriptSegment[] => {
  const paragraphs = [
    "Welcome to this tutorial video where we'll explore key concepts and techniques.",
    "First, let's understand the fundamental principles behind this topic.",
    "As you can see in this example, there are several important factors to consider.",
    "One common mistake is to overlook the details in the implementation phase.",
    "Let's take a closer look at how this works in practice with a real-world example.",
    "When implementing this solution, remember to account for edge cases.",
    "The results demonstrate the effectiveness of our approach compared to traditional methods.",
    "In conclusion, we've covered the essential aspects of this subject.",
    "If you found this helpful, please subscribe for more educational content.",
    "Thank you for watching, and I'll see you in the next video!"
  ];
  
  const segments: TranscriptSegment[] = [];
  let currentTime = 0;
  
  paragraphs.forEach(text => {
    const duration = 5 + Math.random() * 25; // Random duration between 5-30 seconds
    segments.push({
      id: uuidv4(),
      startTime: currentTime,
      endTime: currentTime + duration,
      text
    });
    currentTime += duration;
  });
  
  return segments;
};
