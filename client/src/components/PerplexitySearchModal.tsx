import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, ExternalLink, Key } from "lucide-react";
import { usePerplexitySearch } from '@/hooks/usePerplexitySearch';

interface PerplexitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (result: string) => void;
}

export function PerplexitySearchModal({ isOpen, onClose, onSearch }: PerplexitySearchModalProps) {
  const [query, setQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const {
    search,
    isSearching,
    error,
    needsApiKey,
    result
  } = usePerplexitySearch({
    onSearchComplete: (searchResult) => {
      // Format the content and pass it back to the parent component
      const formattedResult = formatSearchResult(searchResult);
      onSearch(formattedResult);
      onClose();
      
      // Show success toast
      toast({
        title: "Search complete",
        description: "Web search results have been added to your conversation.",
      });
    },
    onError: (errorMessage) => {
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      if (errorMessage.includes("API key")) {
        setShowApiKeyInput(true);
      }
    }
  });

  // Format search result with citations
  const formatSearchResult = (searchResult: any) => {
    let formattedContent = searchResult.content;
    
    // Add citations if available
    if (searchResult.citations && searchResult.citations.length > 0) {
      formattedContent += "\n\n**Sources:**\n";
      searchResult.citations.forEach((citation: string, index: number) => {
        formattedContent += `${index + 1}. ${citation}\n`;
      });
    }
    
    return formattedContent;
  };

  // Save API key to local storage when it changes
  useEffect(() => {
    if (apiKey.trim()) {
      localStorage.setItem('perplexity_api_key', apiKey.trim());
    }
  }, [apiKey]);
  
  // Load API key from local storage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('perplexity_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);
  
  // Focus the input field when the modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }
    
    // If API key is needed, we need to set the environment variable
    if (showApiKeyInput && !apiKey.trim()) {
      toast({
        title: "Perplexity API Key Required",
        description: "Please enter your Perplexity API key to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Save API key if provided
    if (apiKey.trim()) {
      // We'll pass the API key through our backend route
      localStorage.setItem('perplexity_api_key', apiKey.trim());
      
      // Display toast to tell user we saved their API key
      toast({
        title: "API key saved",
        description: "Your Perplexity API key has been saved for future searches.",
      });
    }
    
    // Perform the search
    await search(query);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" /> Web Search
          </DialogTitle>
          <DialogDescription>
            Search the web for up-to-date information using Perplexity AI.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label htmlFor="search-query" className="text-sm font-medium">
              Search Query
            </label>
            <Input
              id="search-query"
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What would you like to search for?"
              className="w-full"
              disabled={isSearching}
            />
          </div>
          
          {/* API Key input section */}
          {(showApiKeyInput || needsApiKey) && (
            <div className="space-y-2 bg-muted/30 p-3 rounded-md">
              <label htmlFor="api-key" className="text-sm font-medium flex items-center">
                <Key className="w-4 h-4 mr-1" /> Perplexity API Key
              </label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-perplexity-..."
                type="password"
                className="w-full"
                disabled={isSearching}
              />
              <p className="text-xs text-muted-foreground">
                You need a Perplexity API key to use web search. {' '}
                <a 
                  href="https://docs.perplexity.ai/docs/getting-started"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  Get one here <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSearching}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSearching || !query.trim() || (needsApiKey && !apiKey.trim())}
              className="min-w-[100px]"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Search
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}