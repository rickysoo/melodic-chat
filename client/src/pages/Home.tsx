import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import MessageThread from "@/components/MessageThread";
import ChatInput from "@/components/ChatInput";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  // State hooks
  const [model, setModel] = useState<string>("gpt-4o-mini");
  
  // Other hooks
  const { toast } = useToast();
  
  // Load saved model on mount
  useEffect(() => {
    const savedModel = localStorage.getItem("melodic_model") || "gpt-4o-mini";
    setModel(savedModel);
  }, []);
  
  // Chat hook
  const { messages, isTyping, sendMessage, error } = useChat({
    apiKey: "env", // Use environment variable
    model,
    onMessageSent: () => {}, // No sound effects
    onMessageReceived: () => {} // No sound effects
  });

  // Message sending handler
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
