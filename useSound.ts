
import { useCallback } from 'react';

type SoundType = 'correct' | 'incorrect' | 'click' | 'chestOpen';

const createTone = (type: SoundType): (() => void) => {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return () => console.log(`Sound played: ${type}`);
  }

  let audioContext: AudioContext;
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch (e) {
    console.error("Web Audio API is not supported in this browser.");
    return () => {};
  }

  return () => {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);

    switch (type) {
      case 'correct':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.linearRampToValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
        break;
      case 'incorrect':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
        oscillator.frequency.linearRampToValueAtTime(110, audioContext.currentTime + 0.2); // A2
        break;
      case 'chestOpen':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
        break;
      case 'click':
      default:
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + (type === 'chestOpen' ? 1 : 0.2));
  };
};

const sounds = {
    correct: createTone('correct'),
    incorrect: createTone('incorrect'),
    click: createTone('click'),
    chestOpen: createTone('chestOpen')
};

export const useSound = () => {
  return {
    playCorrect: useCallback(() => sounds.correct(), []),
    playIncorrect: useCallback(() => sounds.incorrect(), []),
    playClick: useCallback(() => sounds.click(), []),
    playChestOpen: useCallback(() => sounds.chestOpen(), []),
  };
};
