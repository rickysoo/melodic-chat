import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface WebSearchResult {
  content: string;
  citations: string[];
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface WebSearchError {
  error: string;
  needsApiKey?: boolean;
}

interface UseWebSearchProps {
  onSearchComplete?: (result: WebSearchResult) => void;
  onError?: (error: string) => void;
}

export function useWebSearch({ onSearchComplete, onError }: UseWebSearchProps = {}) {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [result, setResult] = useState<WebSearchResult | null>(null);

  const search = async (query: string, systemPrompt?: string) => {
    setIsSearching(true);
    setError(null);
    setNeedsApiKey(false);
    
    try {
      const response = await apiRequest('POST', '/api/search', {
        message: query,
        systemPrompt: systemPrompt || "Search the web and provide an accurate, up-to-date response. Include relevant facts and cite your sources."
      });

      const data = await response.json();
      
      // Check if we got an error response
      if (data && typeof data === 'object' && 'error' in data) {
        const errorResponse = data as WebSearchError;
        setError(errorResponse.error);
        
        if (errorResponse.needsApiKey) {
          setNeedsApiKey(true);
        }
        
        if (onError) {
          onError(errorResponse.error);
        }
        
        return null;
      }
      
      // We got a successful response, cast it to our expected type
      const successResponse = data as WebSearchResult;
      setResult(successResponse);
      
      if (onSearchComplete) {
        onSearchComplete(successResponse);
      }
      
      return successResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    search,
    isSearching,
    error,
    needsApiKey,
    result
  };
}