import { useState, useEffect } from "react";
import MelodicLogo from "./MelodicLogo";
import { useIsPwa } from "@/hooks/use-mobile";
import { WifiOff, Trash2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SoundSettingsModal } from "./SoundSettingsModal";
import { useSounds, SoundTheme } from "@/hooks/useSounds";

interface HeaderProps {
  onClearChat?: () => void;
}

export default function Header({ onClearChat }: HeaderProps) {
  const isPwa = useIsPwa();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Sound settings
  const { 
    settings, 
    toggleSounds, 
    changeTheme, 
    adjustVolume, 
    setIntensity 
  } = useSounds();
  
  // Monitor online/offline status and custom events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleOpenSoundSettingsEvent = () => setIsSoundSettingsOpen(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('open-sound-settings', handleOpenSoundSettingsEvent);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('open-sound-settings', handleOpenSoundSettingsEvent);
    };
  }, []);
  
  const handleClearChat = () => {
    if (onClearChat) {
      onClearChat();
      toast({
        title: "Chat history cleared",
        description: "All chat messages have been deleted from this device.",
        duration: 3000,
      });
    }
  };
  
  const handleOpenSoundSettings = () => {
    setIsSoundSettingsOpen(true);
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center shadow-sm w-full">
      <div className="flex items-center space-x-3">
        <MelodicLogo size={32} />
        <span style={{ 
            fontWeight: "bold", 
            fontSize: "1.5rem", 
            color: "rgb(109, 40, 217)",
            fontFamily: "var(--font-poppins)",
            background: "none",
            backgroundClip: "initial",
            WebkitBackgroundClip: "initial",
            WebkitTextFillColor: "initial",
            textShadow: "none"
          }}>
          Melodic
        </span>
      </div>
      
      {/* Offline indicator for PWA mode */}
      {isPwa && !isOnline && (
        <div className="flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium ml-4">
          <WifiOff className="w-3 h-3 mr-1" />
          Offline
        </div>
      )}
      
      {/* Sound Settings Modal - moved outside of flex to avoid UI issues */}
      <SoundSettingsModal
        isOpen={isSoundSettingsOpen}
        onClose={() => setIsSoundSettingsOpen(false)}
        settings={settings}
        onToggleSounds={toggleSounds}
        onChangeTheme={changeTheme}
        onAdjustVolume={adjustVolume}
        onSetIntensity={setIntensity}
      />
    </header>
  );
}
