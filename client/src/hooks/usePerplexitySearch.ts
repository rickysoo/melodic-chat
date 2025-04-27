import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface PerplexitySearchResult {
  content: string;
  citations: string[];
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface PerplexityError {
  error: string;
  needsApiKey?: boolean;
}

interface UsePerplexitySearchProps {
  onSearchComplete?: (result: PerplexitySearchResult) => void;
  onError?: (error: string) => void;
}

export function usePerplexitySearch({ onSearchComplete, onError }: UsePerplexitySearchProps = {}) {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [result, setResult] = useState<PerplexitySearchResult | null>(null);

  const search = async (query: string, systemPrompt?: string) => {
    setIsSearching(true);
    setError(null);
    setNeedsApiKey(false);
    
    try {
      const response = await apiRequest({
        url: '/api/search',
        method: 'POST',
        body: {
          message: query,
          systemPrompt: systemPrompt || "Search the web and provide an accurate, up-to-date response. Include relevant facts and cite your sources."
        }
      });

      // Check if we got an error response
      if (response && typeof response === 'object' && 'error' in response) {
        const errorResponse = response as PerplexityError;
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
      const successResponse = response as unknown as PerplexitySearchResult;
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