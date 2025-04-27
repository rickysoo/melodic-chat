import { useState, useRef, useEffect } from "react";
import { ChatInputProps } from "@/types";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useIsMobile, useIsPwa } from "@/hooks/use-mobile";
import { Send } from "lucide-react";

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const isPwa = useIsPwa();

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Add blur effect on mobile when input is focused to give more space
  useEffect(() => {
    const handleFocus = () => {
      if (isMobile) {
        setIsFocused(true);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('focus', handleFocus);
      textarea.addEventListener('blur', handleBlur);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('focus', handleFocus);
        textarea.removeEventListener('blur', handleBlur);
      }
    };
  }, [isMobile]);

  return (
    <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 ${isMobile && isPwa ? 'pb-safe' : ''}`}>
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea 
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none transition-all ${isPwa ? 'text-base' : ''}`}
            placeholder={isMobile ? "Message Melodic..." : "Type your message here..."}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
          />
          {/* Removed the emoji button for simplicity */}
        </div>
        
        <motion.button 
          type="submit" 
          whileTap={{ scale: 0.95 }}
          disabled={!message.trim() || disabled}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </motion.button>
      </form>
      
      {/* Mobile keyboard spacer - helps prevent content jumping when keyboard shows/hides */}
      {isMobile && isFocused && <div className="h-36 sm:h-0" />}
    </div>
  );
}
