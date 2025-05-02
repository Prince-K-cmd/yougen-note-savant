
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useYoutubeUrl } from '@/hooks/useYoutubeUrl';
import { Search, X } from 'lucide-react';

interface UrlInputProps {
  onSubmit: (parseResult: { type: string; id: string; url: string }) => void;
}

export function UrlInput({ onSubmit }: UrlInputProps) {
  const { url, setUrl, parseResult, isValid, error, clearUrl } = useYoutubeUrl();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isValid && parseResult) {
      setIsSubmitting(true);
      onSubmit(parseResult);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative w-full">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube video or playlist URL"
            className={`pr-8 ${isValid === false ? 'border-red-500' : ''}`}
          />
          {url && (
            <button
              type="button"
              onClick={clearUrl}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={!isValid || isSubmitting}>
          <Search className="mr-2 h-4 w-4" />
          Load
        </Button>
      </form>
      
      {error && (
        <p className="text-sm text-red-500 animate-slide-in">{error}</p>
      )}
    </div>
  );
}
