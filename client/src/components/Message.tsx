import { MessageProps } from "@/types";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MelodicLogo from "./MelodicLogo";
import { User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const displayContent = message.content;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Message copied to clipboard",
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
        toast({
          title: "Failed to copy",
          description: "Please try again",
          variant: "destructive",
        });
      });
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start ${isUser ? 'justify-end max-w-xl ml-auto' : 'max-w-xl'} fade-in`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 mr-2 flex items-center">
          <MelodicLogo size={40} />
        </div>
      )}
      
      <div className={`${isUser ? 'chat-gradient-user' : 'chat-gradient-bot'} text-white px-4 py-3 rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-sm relative`}>
        {/* Copy button - always visible */}
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30"
          title={`Copy ${isUser ? 'your message' : 'response'} to clipboard`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>

        <div className="markdown-content pr-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
