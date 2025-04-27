import { useCallback, useRef } from 'react';

// Create our own audio context for musical note sounds
export function useSounds() {
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
  const playNote = (frequency: number, duration: number) => {
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
      oscillator.type = 'sine'; // Sine wave - smooth musical tone
      oscillator.frequency.value = frequency; // Frequency in hertz
      
      // Create a gain node (volume control)
      const gainNode = context.createGain();
      gainNode.gain.value = 0.1; // Set to a lower volume
      
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
  
  // Play different musical notes for different message types
  const playSound = useCallback((type: 'send' | 'receive') => {
    // Higher note for send, lower note for receive
    if (type === 'send') {
      // Play C5 note (523.25 Hz)
      playNote(523.25, 120);
    } else {
      // Play G4 note (392.00 Hz)
      playNote(392.00, 120);
    }
  }, []);

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
  }, []);

  return {
    playSound,
    toggleBackgroundMusic,
    unlockAudioContext
  };
}
