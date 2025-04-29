import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { logOut } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import { MdOutlineExplore } from 'react-icons/md';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface UserAvatarProps {
  onLogin: () => void;
}

export default function UserAvatar({ onLogin }: UserAvatarProps) {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await logOut();
      toast({
        title: "Signed out successfully",
        description: "You've been signed out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <Avatar className="h-9 w-9 border-2 border-muted">
        <AvatarFallback className="bg-secondary">
          <span className="animate-pulse">...</span>
        </AvatarFallback>
      </Avatar>
    );
  }

  if (!isAuthenticated) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          onClick={onLogin}
          className="rounded-full px-4 gap-2"
          size="sm"
          variant="outline"
        >
          <FiLogIn className="h-4 w-4" />
          <span>Sign In</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">
            <MdOutlineExplore className="h-3 w-3" />
            <span>Get Web Search</span>
          </span>
        </Button>
      </motion.div>
    );
  }

  // User is authenticated
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9 border-2 border-primary">
            <AvatarImage 
              src={currentUser?.photoURL || undefined} 
              alt={currentUser?.displayName || "User"} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {currentUser?.displayName?.charAt(0).toUpperCase() || <FiUser />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium">{currentUser?.displayName}</p>
          <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis">
            {currentUser?.email}
          </p>
          <div className="flex items-center text-xs text-primary bg-primary/10 rounded-full px-2 py-1 mt-1 w-fit">
            <MdOutlineExplore className="h-3 w-3 mr-1" />
            Web Search Enabled
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <span className="animate-spin h-4 w-4">○</span>
          ) : (
            <FiLogOut className="h-4 w-4" />
          )}
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}