import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { MdOutlineExplore } from 'react-icons/md';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface WebSearchBannerProps {
  onLogin: () => void;
}

export default function WebSearchBanner({ onLogin }: WebSearchBannerProps) {
  const { isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [showDelay, setShowDelay] = useState(true);

  // Only show the banner after a delay to avoid showing it immediately on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDelay(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Don't show the banner if the user is authenticated or if it has been dismissed
  if (isAuthenticated || dismissed || showDelay) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="fixed bottom-20 inset-x-0 mx-auto z-30 w-full max-w-sm px-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border p-4 flex flex-col items-center gap-3">
          <Button 
            variant="ghost" 
            className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
            onClick={() => setDismissed(true)}
          >
            <FiX className="h-4 w-4" />
          </Button>
          
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MdOutlineExplore className="h-5 w-5 text-primary" />
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-sm sm:text-base">
              Want up-to-date answers from the web?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Sign in to unlock Melodic's intelligent web search capabilities.
            </p>
          </div>
          
          <Button 
            className="w-full gap-2"
            size="sm"
            onClick={onLogin}
          >
            <MdOutlineExplore className="h-4 w-4" />
            <span>Enable Web Search</span>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}