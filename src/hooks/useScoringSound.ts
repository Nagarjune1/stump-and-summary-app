import { useCallback, useRef } from 'react';

type SoundType = 'wicket' | 'four' | 'six' | 'run';

export const useScoringSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio playback not available');
    }
  }, [getAudioContext]);

  const playWicketSound = useCallback(() => {
    // Dramatic descending tones for wicket
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [800, 600, 400].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'square', 0.4), i * 150);
    });
  }, [getAudioContext, playTone]);

  const playFourSound = useCallback(() => {
    // Quick ascending chime for boundary four
    [523, 659, 784].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.3), i * 80);
    });
  }, [playTone]);

  const playSixSound = useCallback(() => {
    // Triumphant ascending fanfare for six
    const ctx = getAudioContext();
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'triangle', 0.35), i * 100);
    });
  }, [getAudioContext, playTone]);

  const playRunSound = useCallback(() => {
    // Subtle click for regular runs
    playTone(440, 0.05, 'sine', 0.15);
  }, [playTone]);

  const playSound = useCallback((type: SoundType) => {
    switch (type) {
      case 'wicket':
        playWicketSound();
        break;
      case 'four':
        playFourSound();
        break;
      case 'six':
        playSixSound();
        break;
      case 'run':
        playRunSound();
        break;
    }
  }, [playWicketSound, playFourSound, playSixSound, playRunSound]);

  return { playSound, playWicketSound, playFourSound, playSixSound, playRunSound };
};
