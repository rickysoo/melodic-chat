import { useState } from 'react';
import { SoundTheme, SoundSettings as SoundSettingsType } from '@/hooks/useSounds';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { GiMusicalNotes, GiPianoKeys, GiDrumKit } from 'react-icons/gi';
import { PiWaveformBold } from 'react-icons/pi';
import { MdVolumeUp, MdVolumeDown, MdVolumeOff } from 'react-icons/md';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SoundSettingsType;
  onToggleSounds: (enabled: boolean) => void;
  onChangeTheme: (theme: SoundTheme) => void;
  onAdjustVolume: (volume: number) => void;
  onSetIntensity: (intensity: 'low' | 'medium' | 'high') => void;
}

export function SoundSettingsModal({
  isOpen,
  onClose,
  settings,
  onToggleSounds,
  onChangeTheme,
  onAdjustVolume,
  onSetIntensity
}: SoundSettingsModalProps) {
  const [volume, setVolume] = useState(settings.volume * 100);
  
  const handleVolumeChange = (newVolume: number[]) => {
    const value = newVolume[0];
    setVolume(value);
    onAdjustVolume(value / 100);
  };
  
  const themeIcons = {
    classical: <GiPianoKeys className="text-2xl text-purple-400" />,
    electronic: <PiWaveformBold className="text-2xl text-blue-400" />,
    percussion: <GiDrumKit className="text-2xl text-orange-400" />,
    minimal: <GiMusicalNotes className="text-2xl text-green-400" />
  };
  
  const getVolumeIcon = () => {
    if (volume === 0) return <MdVolumeOff className="text-xl" />;
    if (volume < 50) return <MdVolumeDown className="text-xl" />;
    return <MdVolumeUp className="text-xl" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <GiMusicalNotes className="mr-2 h-5 w-5" />
            Sound Settings
          </DialogTitle>
          <DialogDescription>
            Customize Melodic's sound experience to your preference.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Enable/Disable Sounds */}
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled" className="flex items-center">
              Enable Sound Effects
            </Label>
            <Switch
              id="sound-enabled"
              checked={settings.enabled}
              onCheckedChange={onToggleSounds}
            />
          </div>
          
          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                {getVolumeIcon()}
                <span className="ml-2">Volume</span>
              </Label>
              <span className="text-sm text-muted-foreground">{Math.round(volume)}%</span>
            </div>
            <Slider
              disabled={!settings.enabled}
              value={[volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className={!settings.enabled ? "opacity-50" : ""}
            />
          </div>
          
          {/* Sound Theme Selection */}
          <div className="space-y-2">
            <Label>Sound Theme</Label>
            <RadioGroup 
              value={settings.theme} 
              onValueChange={(value) => onChangeTheme(value as SoundTheme)}
              className="grid grid-cols-2 gap-2"
              disabled={!settings.enabled}
            >
              <div className={`flex items-center space-x-2 rounded-md border p-3 
                ${settings.theme === 'classical' ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : ''}
                ${!settings.enabled ? "opacity-50" : ""}`}
              >
                <RadioGroupItem value="classical" id="classical" disabled={!settings.enabled} />
                <Label htmlFor="classical" className="flex items-center cursor-pointer">
                  {themeIcons.classical}
                  <span className="ml-2">Classical</span>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 rounded-md border p-3
                ${settings.theme === 'electronic' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}
                ${!settings.enabled ? "opacity-50" : ""}`}
              >
                <RadioGroupItem value="electronic" id="electronic" disabled={!settings.enabled} />
                <Label htmlFor="electronic" className="flex items-center cursor-pointer">
                  {themeIcons.electronic}
                  <span className="ml-2">Electronic</span>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 rounded-md border p-3
                ${settings.theme === 'percussion' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''}
                ${!settings.enabled ? "opacity-50" : ""}`}
              >
                <RadioGroupItem value="percussion" id="percussion" disabled={!settings.enabled} />
                <Label htmlFor="percussion" className="flex items-center cursor-pointer">
                  {themeIcons.percussion}
                  <span className="ml-2">Percussion</span>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 rounded-md border p-3
                ${settings.theme === 'minimal' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''} 
                ${!settings.enabled ? "opacity-50" : ""}`}
              >
                <RadioGroupItem value="minimal" id="minimal" disabled={!settings.enabled} />
                <Label htmlFor="minimal" className="flex items-center cursor-pointer">
                  {themeIcons.minimal}
                  <span className="ml-2">Minimal</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Sound Intensity */}
          <div className="space-y-2">
            <Label>Sound Intensity</Label>
            <RadioGroup 
              value={settings.intensity} 
              onValueChange={(value) => onSetIntensity(value as 'low' | 'medium' | 'high')}
              className="flex space-x-2"
              disabled={!settings.enabled}
            >
              <div className={`flex-1 flex items-center justify-center rounded-md border p-2
                ${settings.intensity === 'low' ? 'border-primary bg-primary/10' : ''}
                ${!settings.enabled ? "opacity-50" : ""}`}
              >
                <RadioGroupItem value="low" id="low" className="sr-only" disabled={!settings.enabled} />
                <Label htmlFor="low" className="cursor-pointer text-sm">Low</Label>
              </div>
              
              <div className={`flex-1 flex items-center justify-center rounded-md border p-2
                ${settings.intensity === 'medium' ? 'border-primary bg-primary/10' : ''}
                ${!settings.enabled ? "opacity-50" : ""}`}
              >
                <RadioGroupItem value="medium" id="medium" className="sr-only" disabled={!settings.enabled} />
                <Label htmlFor="medium" className="cursor-pointer text-sm">Medium</Label>
              </div>
              
              <div className={`flex-1 flex items-center justify-center rounded-md border p-2
                ${settings.intensity === 'high' ? 'border-primary bg-primary/10' : ''}
                ${!settings.enabled ? "opacity-50" : ""}`}
              >
                <RadioGroupItem value="high" id="high" className="sr-only" disabled={!settings.enabled} />
                <Label htmlFor="high" className="cursor-pointer text-sm">High</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}