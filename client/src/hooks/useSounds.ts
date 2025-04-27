import { useRef, useCallback, useEffect } from 'react';

type SoundType = 'send' | 'receive' | 'background';

export function useSounds() {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    send: null,
    receive: null,
    background: null
  });

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements
    audioRefs.current.send = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_345f9afda9.mp3?filename=message-sent-129807.mp3');
    audioRefs.current.receive = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_c8a34d97ea.mp3?filename=notification-sound-7062.mp3');
    audioRefs.current.background = new Audio('https://cdn.pixabay.com/download/audio/2022/10/20/audio_bc112168fe.mp3?filename=ambient-piano-amp-strings-10711.mp3');
    
    if (audioRefs.current.background) {
      audioRefs.current.background.loop = true;
      audioRefs.current.background.volume = 0.2;
    }

    if (audioRefs.current.send) {
      audioRefs.current.send.volume = 0.5;
    }

    if (audioRefs.current.receive) {
      audioRefs.current.receive.volume = 0.5;
    }

    // Clean up
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  // Play a sound
  const playSound = useCallback((type: 'send' | 'receive') => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(e => console.error("Failed to play sound:", e));
    }
  }, []);

  // Toggle background music
  const toggleBackgroundMusic = useCallback((play: boolean) => {
    const audio = audioRefs.current.background;
    if (!audio) return;

    if (play) {
      audio.play().catch(e => console.error("Failed to play background music:", e));
    } else {
      audio.pause();
    }
  }, []);

  return {
    playSound,
    toggleBackgroundMusic
  };
}
