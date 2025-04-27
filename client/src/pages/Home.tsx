import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import MessageThread from "@/components/MessageThread";
import ChatInput from "@/components/ChatInput";
import MusicVisualizer from "@/components/MusicVisualizer";
import { useChat } from "@/hooks/useChat";
import { useSounds } from "@/hooks/useSounds";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  // State hooks first
  const [model, setModel] = useState<string>("gpt-4o-mini");
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isMusicActive, setIsMusicActive] = useState(false);
  
  // Other hooks
  const { toast } = useToast();
  const { playSound, toggleBackgroundMusic } = useSounds();
 
  // Callbacks
  const onMessageSent = useCallback(() => {
    playSound('send');
    setIsMusicActive(true);
    setTimeout(() => setIsMusicActive(false), 500);
  }, [playSound, setIsMusicActive]);
  
  const onMessageReceived = useCallback(() => {
    playSound('receive');
    setIsMusicActive(true);
    setTimeout(() => setIsMusicActive(false), 500);
  }, [playSound, setIsMusicActive]);
  
  // Chat hook after all callback definitions
  const { messages, isTyping, sendMessage, error } = useChat({
    apiKey: "env", // Use environment variable
    model,
    onMessageSent,
    onMessageReceived
  });

  // Toggle music handler
  const handleToggleMusic = useCallback(() => {
    setIsMusicEnabled(prev => {
      const newState = !prev;
      toggleBackgroundMusic(newState);
      return newState;
    });
  }, [toggleBackgroundMusic]);

  // Handle sending message
  const handleSendMessage = useCallback(async (message: string) => {
    try {
      await sendMessage(message);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [sendMessage, toast]);

  // Initialize on load
  useEffect(() => {
    const savedModel = localStorage.getItem("melodic_model") || "gpt-4o-mini";
    setModel(savedModel);

    // Start background music if enabled
    if (isMusicEnabled) {
      toggleBackgroundMusic(true);
    }

    return () => {
      toggleBackgroundMusic(false);
    };
  }, [isMusicEnabled, toggleBackgroundMusic]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header onToggleMusic={handleToggleMusic} isMusicEnabled={isMusicEnabled} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <MusicVisualizer isEnabled={isMusicEnabled} isActive={isMusicActive} />
        
        <MessageThread messages={messages} isTyping={isTyping} />
        
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </main>
    </div>
  );
}
