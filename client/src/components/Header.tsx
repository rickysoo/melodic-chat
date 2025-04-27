import { useState, useEffect } from "react";
import MelodicLogo from "./MelodicLogo";
import { useIsPwa } from "@/hooks/use-mobile";
import { WifiOff, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WebSearchModal } from "./WebSearchModal";

interface HeaderProps {
  onClearChat?: () => void;
  onSearchResult?: (result: string) => void;
}

export default function Header({ onClearChat, onSearchResult }: HeaderProps) {
  const isPwa = useIsPwa();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleClearChat = () => {
    if (onClearChat) {
      onClearChat();
      toast({
        title: "Chat history cleared",
        description: "All chat messages have been deleted from this device.",
        duration: 3000,
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <MelodicLogo size={32} />
        <h1 className="font-heading font-bold text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500">
          Melodic
        </h1>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Web search button - only show if we have the onSearchResult prop */}
        {onSearchResult && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchModalOpen(true)}
            className="text-gray-500 hover:text-gray-700 flex items-center"
            title="Search the web"
            disabled={!isOnline}
          >
            <Search className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Web Search</span>
          </Button>
        )}
        
        {/* Clear chat button */}
        {onClearChat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-gray-500 hover:text-gray-700 flex items-center"
            title="Clear chat history"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        )}
        
        {/* Offline indicator for PWA mode */}
        {isPwa && !isOnline && (
          <div className="flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </div>
        )}
        
        {/* Web search modal */}
        {onSearchResult && (
          <WebSearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            onSearch={onSearchResult}
          />
        )}
      </div>
    </header>
  );
}
