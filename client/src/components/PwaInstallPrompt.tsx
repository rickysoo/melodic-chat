import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

// Interface to extend the Window object for PWA installation event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if user has previously dismissed prompt
    const hasUserDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
    
    if (isAppInstalled || hasUserDismissed) {
      return;
    }

    // Capture install prompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Store the event for later use
      setInstallPrompt(e);
      
      // Show prompt after a delay (to avoid overwhelming new users)
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // 30 seconds delay
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    // Reset the deferred prompt variable
    setInstallPrompt(null);
    setShowPrompt(false);
    
    // Log the result
    console.log('User installation choice:', choiceResult.outcome);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Remember the user's choice for 7 days
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    
    // Set a timeout to re-enable the prompt after 7 days
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    localStorage.setItem('pwa-prompt-expiry', expirationDate.toISOString());
  };

  // Check for prompt expiration on component mount
  useEffect(() => {
    const expiryDate = localStorage.getItem('pwa-prompt-expiry');
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (new Date() > expiry) {
        // Clear the dismissed flag if expired
        localStorage.removeItem('pwa-prompt-dismissed');
        localStorage.removeItem('pwa-prompt-expiry');
      }
    }
  }, []);

  if (!showPrompt || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-16 left-0 right-0 mx-auto px-4 z-40"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-sm mx-auto border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Install Melodic</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isMobile 
                  ? "Add Melodic to your home screen for a better experience!" 
                  : "Install Melodic on your device for quick access anytime!"}
              </p>
            </div>
            <button 
              onClick={handleDismiss} 
              className="text-gray-400 hover:text-gray-500 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
            >
              Not now
            </Button>
            <Button 
              variant="default"
              size="sm"
              onClick={handleInstall}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Download className="w-4 h-4 mr-1" />
              Install
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}