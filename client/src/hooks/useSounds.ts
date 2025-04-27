import { useCallback, useRef } from 'react';

// Create our own audio context for musical note sounds
export function useSounds() {
  const audioContext = useRef<AudioContext | null>(null);
  
  // Initialize audio context on first use
  const initAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  };
  
  // Play a musical note with specified frequency
  const playNote = (frequency: number, duration: number) => {
    try {
      const context = initAudioContext();
      
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
        oscillator.stop();
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

  return {
    playSound,
    toggleBackgroundMusic
  };
}
