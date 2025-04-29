import { useState } from 'react';
import { signInWithGoogle } from '@/lib/firebase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineExplore } from 'react-icons/md';
import { GiMusicalNotes } from 'react-icons/gi';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err) {
      console.error('Login failed:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-xl gap-2">
            <GiMusicalNotes className="h-6 w-6 text-primary" />
            <span>Unlock Melodic's Full Potential</span>
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Sign in to access intelligent web search capabilities
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="rounded-lg border p-6 bg-secondary/10">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <MdOutlineExplore className="h-5 w-5 text-primary" /> 
              Why Sign In?
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                <span>Get <span className="font-semibold">up-to-date information</span> from the web</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                <span>Receive <span className="font-semibold">real-time data</span> in responses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                <span>Access to <span className="font-semibold">advanced search features</span></span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full h-12 text-base rounded-lg" 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <FcGoogle className="h-5 w-5" />
                  Sign in with Google
                </span>
              )}
            </Button>
          </motion.div>
          
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}