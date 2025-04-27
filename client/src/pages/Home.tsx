import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MessageThread from "@/components/MessageThread";
import ChatInput from "@/components/ChatInput";
import MusicVisualizer from "@/components/MusicVisualizer";
import ApiKeyModal from "@/components/ApiKeyModal";
import { useChat } from "@/hooks/useChat";
import { useSounds } from "@/hooks/useSounds";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showApiKeyModal, setShowApiKeyModal] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<string>("gpt-4o");
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isMusicActive, setIsMusicActive] = useState(false);
  
  const { toast } = useToast();
  const { playSound, toggleBackgroundMusic } = useSounds();
  const { messages, isTyping, sendMessage, error } = useChat({
    apiKey,
    model,
    onMessageSent: () => {
      playSound('send');
      setIsMusicActive(true);
      setTimeout(() => setIsMusicActive(false), 500);
    },
    onMessageReceived: () => {
      playSound('receive');
      setIsMusicActive(true);
      setTimeout(() => setIsMusicActive(false), 500);
    }
  });

  // Check for saved API key on load
  useEffect(() => {
    const savedApiKey = localStorage.getItem("melodic_api_key");
    const savedModel = localStorage.getItem("melodic_model") || "gpt-4o";
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setModel(savedModel);
      setShowApiKeyModal(false);
    }

    // Start background music if enabled
    if (isMusicEnabled) {
      toggleBackgroundMusic(true);
    }

    return () => {
      toggleBackgroundMusic(false);
    };
  }, [toggleBackgroundMusic]);

  // Toggle music
  const handleToggleMusic = () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    toggleBackgroundMusic(newState);
  };

  // Handle API key modal
  const handleSaveApiKey = (newApiKey: string, newModel: string) => {
    localStorage.setItem("melodic_api_key", newApiKey);
    localStorage.setItem("melodic_model", newModel);
    setApiKey(newApiKey);
    setModel(newModel);
    setShowApiKeyModal(false);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved successfully!",
    });
  };

  // Handle sending message
  const handleSendMessage = async (message: string) => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }
    
    try {
      await sendMessage(message);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header onToggleMusic={handleToggleMusic} isMusicEnabled={isMusicEnabled} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <MusicVisualizer isEnabled={isMusicEnabled} isActive={isMusicActive} />
        
        <MessageThread messages={messages} isTyping={isTyping} />
        
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </main>
      
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKey}
      />
    </div>
  );
}
