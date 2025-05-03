
import { useState, useCallback } from 'react';
import { YoutubeParseResult } from '@/types/youtube';
import { parseYoutubeUrl } from '@/utils/youtube';

export function useYoutubeUrl() {
  const [url, setUrl] = useState<string>('');
  const [parseResult, setParseResult] = useState<YoutubeParseResult | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateUrl = useCallback((inputUrl: string) => {
    setUrl(inputUrl);
    setError(null);
    
    if (!inputUrl.trim()) {
      setIsValid(null);
      setParseResult(null);
      return;
    }
    
    const result = parseYoutubeUrl(inputUrl);
    
    if (result) {
      setIsValid(true);
      setParseResult(result);
    } else {
      setIsValid(false);
      setParseResult(null);
      setError('Invalid YouTube URL. Please enter a valid YouTube video or playlist URL.');
    }
  }, []);

  const clearUrl = useCallback(() => {
    setUrl('');
    setIsValid(null);
    setParseResult(null);
    setError(null);
  }, []);

  return {
    url,
    setUrl: validateUrl,
    parseResult,
    isValid,
    isLoading,
    setIsLoading,
    error,
    setError,
    clearUrl
  };
}

// Export the extraction functions for convenience
export { extractVideoId, extractPlaylistId } from '@/utils/youtube';
