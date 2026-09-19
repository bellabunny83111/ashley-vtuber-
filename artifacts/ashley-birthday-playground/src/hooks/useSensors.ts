import { useState, useEffect, useRef } from 'react';

export function useSensors(enabled: boolean) {
  const [gyro, setGyro] = useState({ x: 0, y: 0 });
  const [micVolume, setMicVolume] = useState(0);
  const [hasGyro, setHasGyro] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const reqRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        setHasGyro(true);
        // Normalize roughly between -1 and 1
        let x = e.gamma / 45; // left/right
        let y = (e.beta - 45) / 45; // up/down
        x = Math.max(-1, Math.min(1, x));
        y = Math.max(-1, Math.min(1, y));
        setGyro({ x, y });
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
      // Some iOS devices need permission request, handled separately if needed
    }

    const startMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMic(true);
        micStreamRef.current = stream;
        
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        
        const source = audioCtx.createMediaStreamSource(stream);
        const analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);
        analyzerRef.current = analyzer;

        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        
        const checkVolume = () => {
          if (!analyzerRef.current) return;
          analyzerRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setMicVolume(avg / 128); // normalize 0-1 roughly
          reqRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch (err) {
        console.warn('Mic access denied or unavailable', err);
        setHasMic(false);
      }
    };

    startMic();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [enabled]);

  return { gyro, micVolume, hasGyro, hasMic };
}
