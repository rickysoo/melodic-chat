import { useState, useRef, useEffect } from "react";
import { ChatInputProps } from "@/types";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sm:px-6">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea 
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none transition-all"
            placeholder="Type your message here..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button 
            type="button" 
            className="absolute right-3 bottom-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <i className="ri-emotion-line text-xl"></i>
          </button>
        </div>
        
        <motion.button 
          type="submit" 
          whileTap={{ scale: 0.95 }}
          disabled={!message.trim() || disabled}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="ri-send-plane-fill text-xl"></i>
        </motion.button>
      </form>
    </div>
  );
}
