import { useCallback } from 'react';

// Simplified sound module with no actual sounds to avoid playback issues
export function useSounds() {
  // Simple mock for playing sounds
  const playSound = useCallback((type: 'send' | 'receive') => {
    // Just log instead of playing sounds
    console.log(`Sound played: ${type}`);
    // In a real app, we would play the sound here
  }, []);

  // Simple mock for background music
  const toggleBackgroundMusic = useCallback((play: boolean) => {
    console.log(`Background music ${play ? 'started' : 'stopped'}`);
    // In a real app, we would toggle the music here
  }, []);

  return {
    playSound,
    toggleBackgroundMusic
  };
}
