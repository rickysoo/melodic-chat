import { Button } from "@/components/ui/button";
import { HeaderProps } from "@/types";
import { Moon, Sun, Volume2, VolumeX, Settings } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";

export default function Header({ onToggleMusic, isMusicEnabled }: HeaderProps) {
  // Use the next-themes hook directly to avoid any potential issues
  const { resolvedTheme, setTheme } = useNextTheme();
  
  // Simple toggle function
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-500 p-2 rounded-lg">
          <span className="text-white font-bold">♪</span>
        </div>
        <h1 className="font-heading font-bold text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500">
          Melodic Chat
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleMusic}
          className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
        >
          {isMusicEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
        >
          <Settings className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleTheme}
          className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
