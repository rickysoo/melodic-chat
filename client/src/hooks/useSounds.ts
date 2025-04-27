import { useRef, useCallback, useEffect, useState } from 'react';

type SoundType = 'send' | 'receive' | 'background';

// These short sound files are used for better browser compatibility
const AUDIO_SOURCES = {
  send: '/audio/send.mp3', // We'll create this from a simpler source
  receive: '/audio/receive.mp3', // We'll create this from a simpler source
  // Use a shorter, simpler audio file that's more likely to work in browsers
  background: 'https://assets.mixkit.co/sfx/preview/mixkit-tech-house-vibes-130.mp3' 
};

export function useSounds() {
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    send: null,
    receive: null,
    background: null
  });

  // Create simple beep sounds for notifications to ensure they work
  const createLocalAudioFiles = useCallback(() => {
    // We'll create simple beep sounds for the chat notifications
    // These are more likely to work than external URLs
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Function to create a simple beep
    const createBeep = (frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.1;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
      }, duration);
    };
    
    // Create simple beeps for send and receive notifications
    audioRefs.current.send = {
      play: () => { createBeep(800, 100); return Promise.resolve(); },
      pause: () => {},
      volume: 0.5,
      currentTime: 0,
      loop: false
    } as any;
    
    audioRefs.current.receive = {
      play: () => { createBeep(1000, 100); return Promise.resolve(); },
      pause: () => {},
      volume: 0.5,
      currentTime: 0,
      loop: false
    } as any;
    
    // Create background music element
    const bgAudio = new Audio(AUDIO_SOURCES.background);
    bgAudio.loop = true;
    bgAudio.volume = 0.2;
    bgAudio.oncanplaythrough = () => {
      setAudioLoaded(true);
    };
    
    audioRefs.current.background = bgAudio;
  }, []);

  // Initialize audio elements
  useEffect(() => {
    createLocalAudioFiles();
    
    // Clean up
    return () => {
      const audio = audioRefs.current.background;
      if (audio && 'pause' in audio) {
        audio.pause();
        if ('src' in audio) {
          (audio as HTMLAudioElement).src = '';
        }
      }
    };
  }, [createLocalAudioFiles]);

  // Play a sound
  const playSound = useCallback((type: 'send' | 'receive') => {
    const audio = audioRefs.current[type];
    if (audio && 'play' in audio) {
      if ('pause' in audio) audio.pause();
      if ('currentTime' in audio) audio.currentTime = 0;
      audio.play().catch(e => console.error(`Failed to play ${type} sound:`, e));
    }
  }, []);

  // Toggle background music
  const toggleBackgroundMusic = useCallback((play: boolean) => {
    const audio = audioRefs.current.background;
    if (!audio || !('play' in audio)) return;

    if (play) {
      // Use a user interaction to trigger audio (browser requirement)
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(e => {
          console.error("Failed to play background music:", e);
          // If we can't play music, we'll just continue without it
        });
      }
    } else if ('pause' in audio) {
      audio.pause();
    }
  }, []);

  return {
    playSound,
    toggleBackgroundMusic
  };
}
