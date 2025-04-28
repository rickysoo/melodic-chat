import { useRef, useEffect, useState } from "react";
import Message from "@/components/Message";
import MessageWithCopy from "@/components/MessageWithCopy";
import { MessageThreadProps } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile, useIsPwa } from "@/hooks/use-mobile";
import MelodicLogo from "./MelodicLogo";

export default function MessageThread({ messages, isTyping }: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const isMobile = useIsMobile();
  const isPwa = useIsPwa();

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Monitor scroll position to show scroll indicator when not at bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!threadRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = threadRef.current;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setAtBottom(isAtBottom);
    };
    
    const thread = threadRef.current;
    if (thread) {
      thread.addEventListener('scroll', handleScroll);
      return () => thread.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (atBottom) {
      scrollToBottom();
    }
  }, [messages, isTyping, atBottom]);

  // Initial scroll to bottom (with instant behavior)
  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  // Welcome message to show when there are no messages
  const showWelcomeMessage = messages.length === 0;

  return (
    <div className="relative flex-1 flex flex-col h-full">
      {/* Scroll to bottom button - only shown when not at bottom */}
      <AnimatePresence>
        {!atBottom && messages.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-4 right-4 z-10 p-2 bg-primary-500 text-white rounded-full shadow-lg"
            onClick={() => scrollToBottom()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* PWA welcome indicator - to be displayed when first installed */}
      {isPwa && showWelcomeMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary-100 dark:bg-secondary-900 p-3 mb-4 rounded-lg text-center text-sm"
        >
          <span className="font-medium">Melodic is now installed</span>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">You can use Melodic even when offline!</p>
        </motion.div>
      )}

      {/* Main scrollable messages container */}
      <div 
        ref={threadRef}
        className={`flex-1 overflow-y-auto py-4 ${isMobile ? 'px-3' : 'px-4 sm:px-6'} space-y-4 ${isPwa ? 'pwa-mode' : ''}`} 
        id="messageThread"
      >
        <AnimatePresence>
          {showWelcomeMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start max-w-xl fade-in"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center text-white mr-2">
                <MelodicLogo size={16} />
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
                <MelodicLogo size={16} />
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
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
}
