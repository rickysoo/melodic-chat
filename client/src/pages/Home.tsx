import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import MessageThread from "@/components/MessageThread";
import ChatInput from "@/components/ChatInput";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import WebSearchBanner from "@/components/WebSearchBanner";
import LoginModal from "@/components/LoginModal";
import UserAvatar from "@/components/UserAvatar";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import { useSounds } from "@/hooks/useSounds";
import { useIsMobile, useIsPwa } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Trash2, Music } from "lucide-react";

export default function Home() {
  // State hooks
  const [model, setModel] = useState<string>("openai/gpt-4o-mini-search-preview");
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Other hooks
  const { toast } = useToast();
  const { playSound, unlockAudioContext, settings } = useSounds();
  const isMobile = useIsMobile();
  const isPwa = useIsPwa();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Load saved model on mount and check if PWA is installable
  useEffect(() => {
    const savedModel = localStorage.getItem("melodic_model") || "openai/gpt-4o-mini-search-preview";
    setModel(savedModel);
    
    // Add event listener for PWA installation
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPromptEvent(e);
      // Update UI to notify the user they can install the PWA
      setIsInstallable(true);
    });
    
    // Add event listener to detect when PWA is installed
    window.addEventListener('appinstalled', () => {
      // Log install to analytics
      console.log('PWA was installed');
      // Clear the prompt
      setInstallPromptEvent(null);
      setIsInstallable(false);
    });
    
    // Check if the app is already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode (installed as PWA)');
      setIsInstallable(false);
    }
  }, []);
  
  // Message callbacks for sound effects
  const onMessageSent = useCallback((message?: string) => {
    playSound('send', message?.length);
  }, [playSound]);
  
  const onMessageReceived = useCallback((message?: string) => {
    playSound('receive', message?.length);
  }, [playSound]);
  
  // Effect to handle audio unlock on first user interaction
  useEffect(() => {
    function handleUserInteraction() {
      console.log('User interaction detected, unlocking audio');
      unlockAudioContext();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    }
    
    // Add event listeners to detect user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [unlockAudioContext]);
  
  // Chat hook with authentication status
  const { messages, isTyping, sendMessage, clearChatHistory, error } = useChat({
    apiKey: "env", // Use environment variable
    model,
    isAuthenticated, // Pass authentication status for model selection
    onMessageSent,
    onMessageReceived
  });

  // Message sending handler
  const handleSendMessage = useCallback(async (message: string) => {
    try {
      // Try to unlock audio context when user sends message
      unlockAudioContext();
      await sendMessage(message);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [sendMessage, toast, unlockAudioContext]);
  
  // Handle PWA installation
  const handleInstallClick = useCallback(async () => {
    if (!installPromptEvent) {
      console.log('No installation prompt available');
      return;
    }
    
    // Show the install prompt
    const result = await installPromptEvent.prompt();
    console.log('Install prompt result:', result);
    
    // Reset the installPromptEvent - it can only be used once
    setInstallPromptEvent(null);
    setIsInstallable(false);
  }, [installPromptEvent]);

  // Authentication handlers
  const handleOpenLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoginModalOpen(false);
    toast({
      title: "Login successful",
      description: "You now have access to web search capabilities!",
    });
  }, [toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div className={`h-screen flex flex-col bg-background text-foreground overflow-hidden ${isPwa ? 'pwa-mode' : ''}`}>
      {/* Don't show header in PWA mode on mobile - header will be visible on larger screens */}
      {!(isPwa && isMobile) && (
        <div className="flex justify-between items-center">
          <Header />
          <div className="flex items-center space-x-2 px-6">
            {/* Sound Settings button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.dispatchEvent(new Event('open-sound-settings'))}
              className={`text-gray-500 hover:text-gray-700 flex items-center ${settings?.enabled ? 'text-purple-500' : ''}`}
              title="Sound Settings"
            >
              <Music className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sounds</span>
            </Button>
            
            {/* Clear chat button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChatHistory}
              className="text-gray-500 hover:text-gray-700 flex items-center"
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Clear Chat</span>
            </Button>
            
            <UserAvatar onLogin={handleOpenLoginModal} />
          </div>
        </div>
      )}
      
      {/* Main chat container */}
      <main className={`flex-1 flex flex-col overflow-hidden relative ${isPwa && isMobile ? 'pt-2' : ''}`}>
        {/* Show web search banner for non-authenticated users */}
        {!authLoading && !isAuthenticated && <WebSearchBanner onLogin={handleOpenLoginModal} />}
        
        <MessageThread messages={messages} isTyping={isTyping} />
        <div ref={messageEndRef} />
        
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </main>
      
      {/* PWA install prompt component - handles all installation UI */}
      {!isPwa && <PwaInstallPrompt />}
      
      {/* Authentication modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseLoginModal} 
        onSuccess={handleLoginSuccess} 
      />
    </div>
  );
}
