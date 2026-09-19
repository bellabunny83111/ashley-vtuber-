import { useCallback, useRef } from 'react';

type SoundType = 'pop' | 'sparkle' | 'kiss' | 'chime' | 'boop' | 'magic' | 'fanfare';

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const initCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  };

  const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    const ctx = initCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playSound = useCallback((type: SoundType) => {
    const ctx = initCtx();
    const now = ctx.currentTime;
    
    switch (type) {
      case 'pop':
        playTone(400, 'sine', 0.1, 0.2);
        setTimeout(() => playTone(600, 'sine', 0.1, 0.2), 50);
        break;
      case 'boop':
        playTone(800, 'sine', 0.15, 0.1);
        break;
      case 'sparkle':
        [1200, 1600, 2400].forEach((f, i) => {
          setTimeout(() => playTone(f, 'triangle', 0.2, 0.05), i * 50);
        });
        break;
      case 'kiss':
        playTone(800, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(1200, 'sine', 0.2, 0.1), 100);
        break;
      case 'chime':
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => { // C E G C
          setTimeout(() => playTone(f, 'sine', 1.5, 0.1), i * 150);
        });
        break;
      case 'magic':
        [880, 987, 1046, 1174, 1318].forEach((f, i) => {
          setTimeout(() => playTone(f, 'triangle', 0.3, 0.05), i * 80);
        });
        break;
      case 'fanfare':
        [440, 440, 440, 554, 659].forEach((f, i) => {
          setTimeout(() => playTone(f, 'square', i === 4 ? 1.0 : 0.2, 0.05), i * 150);
        });
        break;
    }
    
    // Haptics if available
    if (navigator.vibrate) {
      if (type === 'boop') navigator.vibrate(50);
      if (type === 'pop') navigator.vibrate([30, 30, 30]);
      if (type === 'fanfare') navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }, []);

  return { playSound, initCtx };
}
