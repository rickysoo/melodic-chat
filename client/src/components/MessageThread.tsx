import { useRef, useEffect } from "react";
import Message from "@/components/Message";
import { MessageThreadProps } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export default function MessageThread({ messages, isTyping }: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Welcome message to show when there are no messages
  const showWelcomeMessage = messages.length === 0;

  return (
    <div className="flex-1 overflow-y-auto py-4 px-4 sm:px-6 space-y-4 mt-12" id="messageThread">
      <AnimatePresence>
        {showWelcomeMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start max-w-xl fade-in"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center text-white mr-2">
              <i className="ri-robot-line"></i>
            </div>
            <div className="chat-gradient-bot text-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
              <p>Hello there! 👋 I'm Melodic, your musical AI companion. Ask me anything, and I might even play a tune for you! How are you feeling today?</p>
            </div>
          </motion.div>
        )}

        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start max-w-xl fade-in typing-container"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center text-white mr-2">
              <i className="ri-robot-line"></i>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
              <div className="typing-indicator flex space-x-1">
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}
