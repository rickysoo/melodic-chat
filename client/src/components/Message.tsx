import { MessageProps } from "@/types";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import MelodicLogo from "./MelodicLogo";
import { User } from "lucide-react";

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  
  // Just use the message content directly
  const displayContent = message.content;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start ${isUser ? 'justify-end max-w-xl ml-auto' : 'max-w-xl'} fade-in`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 mr-2">
          <MelodicLogo size={32} />
        </div>
      )}
      
      <div className={`${isUser ? 'chat-gradient-user' : 'chat-gradient-bot'} text-white px-4 py-3 rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-sm`}>
        <div className="markdown-content">
          <ReactMarkdown>
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
