import { useCallback, useRef, useState, useEffect } from 'react';

// Sound themes definitions
export type SoundTheme = 'classical' | 'electronic' | 'percussion' | 'minimal';

export interface SoundSettings {
  theme: SoundTheme;
  volume: number; // 0 to 1
  enabled: boolean;
  intensity: 'low' | 'medium' | 'high';
}

const defaultSettings: SoundSettings = {
  theme: 'classical',
  volume: 0.15,
  enabled: true,
  intensity: 'medium'
};

// Theme definitions with specific waveforms and frequencies
const themes = {
  classical: {
    waveform: 'sine' as OscillatorType,
    send: {
      notes: [{ frequency: 523.25, duration: 200 }], // C5
    },
    receive: {
      notes: [
        { frequency: 261.63, duration: 180 }, // C4
        { frequency: 329.63, duration: 180 }, // E4
        { frequency: 392.00, duration: 250 }, // G4
      ],
    },
  },
  electronic: {
    waveform: 'sawtooth' as OscillatorType,
    send: {
      notes: [{ frequency: 440.00, duration: 150 }], // A4
    },
    receive: {
      notes: [
        { frequency: 349.23, duration: 120 }, // F4
        { frequency: 440.00, duration: 120 }, // A4
        { frequency: 523.25, duration: 180 }, // C5
      ],
    },
  },
  percussion: {
    waveform: 'square' as OscillatorType,
    send: {
      notes: [{ frequency: 200.00, duration: 100 }], // Low percussive sound
    },
    receive: {
      notes: [
        { frequency: 300.00, duration: 80 }, // Mid percussion
        { frequency: 400.00, duration: 80 }, // Higher percussion
        { frequency: 500.00, duration: 120 }, // Highest percussion
      ],
    },
  },
  minimal: {
    waveform: 'sine' as OscillatorType,
    send: {
      notes: [{ frequency: 440.00, duration: 100 }], // A4 (brief)
    },
    receive: {
      notes: [
        { frequency: 440.00, duration: 100 }, // A4 (brief)
        { frequency: 493.88, duration: 150 }, // B4 (slight longer)
      ],
    },
  },
};

// Intensity multipliers
const intensityFactors = {
  low: 0.7,
  medium: 1.0,
  high: 1.3,
};

// Hook for sound functionality
export function useSounds() {
  // Load settings from localStorage or use defaults
  const loadSettings = (): SoundSettings => {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
      const saved = localStorage.getItem('melodic_sound_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load sound settings:', e);
    }
    return defaultSettings;
  };

  const [settings, setSettings] = useState<SoundSettings>(loadSettings);
  const audioContext = useRef<AudioContext | null>(null);
  
  // Initialize audio context on first use
  const initAudioContext = () => {
    try {
      if (!audioContext.current) {
        // Check if AudioContext is available in the browser
        if (typeof window === 'undefined' || (!window.AudioContext && !(window as any).webkitAudioContext)) {
          console.warn('AudioContext is not supported in this browser');
          return null;
        }
        
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('AudioContext initialized successfully');
      }
      return audioContext.current;
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      return null;
    }
  };
  
  // Play a musical note with specified frequency
  const playNote = (frequency: number, duration: number, waveType: OscillatorType = 'sine', volume: number = 0.1) => {
    try {
      const context = initAudioContext();
      
      // Check if context is available
      if (!context) {
        console.warn('Unable to play note: AudioContext not available');
        return;
      }
      
      // Handle suspended context state (browsers often require user interaction)
      if (context.state === 'suspended') {
        console.log('Resuming suspended AudioContext');
        context.resume().then(() => {
          console.log('AudioContext resumed successfully');
        }).catch((err: Error) => {
          console.error('Failed to resume AudioContext:', err);
        });
      }
      
      // Create an oscillator (sound source)
      const oscillator = context.createOscillator();
      oscillator.type = waveType; // Waveform type
      oscillator.frequency.value = frequency; // Frequency in hertz
      
      // Create a gain node (volume control)
      const gainNode = context.createGain();
      gainNode.gain.value = volume; // Set volume
      
      // Add fade in/out for smoother sound
      const now = context.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // 10ms fade in
      gainNode.gain.linearRampToValueAtTime(0, now + duration/1000); // Fade out at the end
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Start and stop the sound
      oscillator.start();
      setTimeout(() => {
        try {
          oscillator.stop();
        } catch (err: any) {
          // Ignore errors on stop
          console.debug('Oscillator stop error (safe to ignore):', err?.message);
        }
      }, duration);
    } catch (e) {
      console.error('Error playing note:', e);
    }
  };
  
  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: SoundSettings) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('melodic_sound_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save sound settings:', e);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<SoundSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, [saveSettings]);

  // Calculate effective volume based on settings
  const getEffectiveVolume = useCallback((baseVolume: number) => {
    // Get current settings from local storage for immediate access
    const currentSettings = (() => {
      try {
        const savedSettings = localStorage.getItem('melodic_sound_settings');
        if (savedSettings) {
          return JSON.parse(savedSettings) as SoundSettings;
        }
      } catch (e) {
        console.error('Failed to load sound settings from storage for volume calculation:', e);
      }
      return settings; // Fallback to state if localStorage fails
    })();
    
    if (!currentSettings.enabled) return 0;
    
    // Apply intensity factor to base volume
    const intensityFactor = intensityFactors[currentSettings.intensity] || 1.0;
    const effectiveVolume = Math.min(1.0, baseVolume * currentSettings.volume * intensityFactor);
    
    console.log('Calculated effective volume:', {
      baseVolume,
      userVolume: currentSettings.volume,
      intensity: currentSettings.intensity,
      intensityFactor,
      effectiveVolume
    });
    
    return effectiveVolume;
  }, [settings]);

  // Play themed notes based on the selected theme
  const playThemedNotes = useCallback((type: 'send' | 'receive', messageLength?: number) => {
    // Get current settings from local storage for immediate access
    const currentSettings = (() => {
      try {
        const savedSettings = localStorage.getItem('melodic_sound_settings');
        if (savedSettings) {
          return JSON.parse(savedSettings) as SoundSettings;
        }
      } catch (e) {
        console.error('Failed to load sound settings from storage:', e);
      }
      return settings; // Fallback to state if localStorage fails
    })();
    
    // Debug log
    console.log('Playing themed sound with realtime settings:', { 
      type, 
      theme: currentSettings.theme, 
      enabled: currentSettings.enabled,
      volume: currentSettings.volume,
      intensity: currentSettings.intensity,
      messageLength
    });
    
    // If sounds are disabled, don't play anything
    if (!currentSettings.enabled) {
      console.log('Sounds are disabled, not playing');
      return;
    }
    
    const theme = themes[currentSettings.theme];
    if (!theme) {
      console.error('Theme not found:', currentSettings.theme);
      return;
    }
    
    const notes = theme[type].notes;
    const waveform = theme.waveform;
    
    // Adjust intensity based on message length if provided
    let intensityFactor = intensityFactors[currentSettings.intensity] || 1.0;
    if (messageLength && type === 'receive') {
      // Slightly increase intensity for longer messages
      if (messageLength > 500) intensityFactor *= 1.1;
      if (messageLength > 1000) intensityFactor *= 1.1;
    }
    
    // Play each note in the sequence with appropriate delays
    let delay = 0;
    notes.forEach((note, index) => {
      setTimeout(() => {
        const volume = getEffectiveVolume(index === notes.length - 1 ? 0.15 : 0.12);
        console.log('Playing note:', { 
          frequency: note.frequency, 
          duration: note.duration, 
          waveform, 
          volume,
          theme: currentSettings.theme,
          noteIndex: index
        });
        playNote(note.frequency, note.duration, waveform, volume);
      }, delay);
      delay += note.duration;
    });
  }, [settings, getEffectiveVolume, playNote]);

  // Play different musical notes for different message types
  const playSound = useCallback((type: 'send' | 'receive', messageLength?: number) => {
    playThemedNotes(type, messageLength);
  }, [playThemedNotes]);
  
  // Function to toggle sounds on/off
  const toggleSounds = useCallback((enabled: boolean) => {
    updateSettings({ enabled });
  }, [updateSettings]);
  
  // Function to change the sound theme
  const changeTheme = useCallback((theme: SoundTheme) => {
    console.log('Changing theme to:', theme);
    updateSettings({ theme });
    
    // Play a test sound to preview the theme with a small delay to ensure settings are updated
    setTimeout(() => {
      console.log('Playing preview sound for theme:', theme);
      playThemedNotes('send');
    }, 100);
  }, [updateSettings, playThemedNotes]);
  
  // Function to adjust volume (0 to 1)
  const adjustVolume = useCallback((volume: number) => {
    // Ensure volume is between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    updateSettings({ volume: clampedVolume });
  }, [updateSettings]);
  
  // Function to change intensity
  const setIntensity = useCallback((intensity: 'low' | 'medium' | 'high') => {
    updateSettings({ intensity });
  }, [updateSettings]);

  // No background music, just a stub function for compatibility
  const toggleBackgroundMusic = useCallback((play: boolean) => {
    // Do nothing - background music has been removed
    return;
  }, []);

  // Function to unlock audio on user interaction
  const unlockAudioContext = useCallback(() => {
    const context = initAudioContext();
    if (context && context.state === 'suspended') {
      console.log('Attempting to unlock AudioContext via user interaction');
      
      // Create a short silent buffer and play it
      const buffer = context.createBuffer(1, 1, 22050);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      
      // Play the buffer (required by some browsers to unlock)
      try {
        source.start(0);
        console.log('Silent buffer played to unlock audio');
      } catch (e) {
        console.error('Failed to play silent buffer:', e);
      }
      
      // Also try explicit resume
      context.resume().then(() => {
        console.log('AudioContext resumed successfully via unlock function');
      }).catch((err: Error) => {
        console.error('Failed to resume AudioContext:', err);
      });
    }
  }, [initAudioContext]);

  // Effect to save settings when they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings, saveSettings]);

  return {
    playSound,
    toggleBackgroundMusic,
    unlockAudioContext,
    settings,
    toggleSounds,
    changeTheme,
    adjustVolume,
    setIntensity
  };
}
