import { MessageProps } from "@/types";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MelodicLogo from "./MelodicLogo";
import { User, Copy, Check } from "lucide-react";
// Import additional components for better markdown rendering
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Just use the message content directly
  const displayContent = message.content;
  
  // Handle copy button click
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      
      // Show toast notification
      toast({
        title: "Copied to clipboard",
        description: `${isUser ? "Your message" : "Melodic's response"} has been copied to clipboard.`,
        duration: 2000,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start ${isUser ? 'justify-end max-w-xl ml-auto' : 'max-w-xl'} fade-in message-container`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 mr-2 flex items-center">
          <MelodicLogo size={40} />
        </div>
      )}
      
      <div className={`${isUser ? 'chat-gradient-user' : 'chat-gradient-bot'} text-white px-4 py-3 rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-sm relative group`}>
        {/* Copy button */}
        <button 
          onClick={handleCopy}
          className="message-copy-button group-hover:opacity-100 z-10"
          title={`Copy ${isUser ? 'your message' : 'response'} to clipboard`}
          aria-label={`Copy ${isUser ? 'your message' : 'response'} to clipboard`}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Customize table rendering
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4">
                  <table className="w-full border-collapse border border-gray-300 bg-white/10" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-white/20" {...props} />
              ),
              tbody: ({ node, ...props }) => (
                <tbody {...props} />
              ),
              tr: ({ node, ...props }) => (
                <tr className="border-b border-gray-300" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-4 py-2" {...props} />
              ),
              // Better list rendering
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
              ),
              li: ({ node, children, ...props }) => (
                <li className="mb-1" {...props}>{children}</li>
              ),
              // Better heading styles
              h1: ({node, ...props}) => (
                <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
              ),
              h2: ({node, ...props}) => (
                <h2 className="text-lg font-bold mt-3 mb-2" {...props} />
              ),
              h3: ({node, ...props}) => (
                <h3 className="text-md font-bold mt-2 mb-1" {...props} />
              ),
              // Standard paragraph with proper spacing
              p: ({node, ...props}) => (
                <p className="mb-4 last:mb-0" {...props} />
              ),
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white ml-2">
          <User className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}
