import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MessageThread from "@/components/MessageThread";
import ChatInput from "@/components/ChatInput";
import MusicVisualizer from "@/components/MusicVisualizer";
import { useChat } from "@/hooks/useChat";
import { useSounds } from "@/hooks/useSounds";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  // We're using the environment API key now, no need for a modal
  const [model, setModel] = useState<string>("gpt-4o");
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isMusicActive, setIsMusicActive] = useState(false);
  
  const { toast } = useToast();
  const { playSound, toggleBackgroundMusic } = useSounds();
  const { messages, isTyping, sendMessage, error } = useChat({
    apiKey: "env", // Use environment variable
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

  // Initialize on load
  useEffect(() => {
    const savedModel = localStorage.getItem("melodic_model") || "gpt-4o";
    setModel(savedModel);

    // Start background music if enabled
    if (isMusicEnabled) {
      toggleBackgroundMusic(true);
    }

    return () => {
      toggleBackgroundMusic(false);
    };
  }, [toggleBackgroundMusic, isMusicEnabled]);

  // Toggle music
  const handleToggleMusic = () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    toggleBackgroundMusic(newState);
  };

  // Handle sending message
  const handleSendMessage = async (message: string) => {
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
    </div>
  );
}
