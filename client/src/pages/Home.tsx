import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import MessageThread from "@/components/MessageThread";
import ChatInput from "@/components/ChatInput";
import MusicVisualizer from "@/components/MusicVisualizer";
import { useChat } from "@/hooks/useChat";
import { useSounds } from "@/hooks/useSounds";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  // State hooks
  const [model, setModel] = useState<string>("gpt-4o-mini");
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isMusicActive, setIsMusicActive] = useState(false);
  
  // Other hooks
  const { toast } = useToast();
  const { playSound, toggleBackgroundMusic, unlockAudioContext } = useSounds();
  
  // Load saved model on mount
  useEffect(() => {
    const savedModel = localStorage.getItem("melodic_model") || "gpt-4o-mini";
    setModel(savedModel);
  }, []);
 
  // Message callbacks
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
  
  // Music toggle handler
  const handleToggleMusic = useCallback(() => {
    // When enabling music, try to unlock the audio context
    const newValue = !isMusicEnabled;
    if (newValue) {
      unlockAudioContext();
      // Play a test sound after toggling
      setTimeout(() => playSound('receive'), 100);
    }
    setIsMusicEnabled(newValue);
  }, [isMusicEnabled, unlockAudioContext, playSound]);
  
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
      if (isMusicEnabled) {
        unlockAudioContext();
      }
      
      await sendMessage(message);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [sendMessage, toast, isMusicEnabled, unlockAudioContext]);

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
