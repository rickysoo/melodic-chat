import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import MessageThread from "@/components/MessageThread";
import ChatInput from "@/components/ChatInput";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import { useSounds } from "@/hooks/useSounds";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  // State hooks
  const [model, setModel] = useState<string>("gpt-4o-mini");
  
  // Other hooks
  const { toast } = useToast();
  const { playSound, unlockAudioContext } = useSounds();
  
  // Load saved model on mount
  useEffect(() => {
    const savedModel = localStorage.getItem("melodic_model") || "gpt-4o-mini";
    setModel(savedModel);
  }, []);
  
  // Message callbacks for sound effects
  const onMessageSent = useCallback(() => {
    playSound('send');
  }, [playSound]);
  
  const onMessageReceived = useCallback(() => {
    playSound('receive');
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
  
  // Chat hook
  const { messages, isTyping, sendMessage, error } = useChat({
    apiKey: "env", // Use environment variable
    model,
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

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <MessageThread messages={messages} isTyping={isTyping} />
        
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </main>
    </div>
  );
}
