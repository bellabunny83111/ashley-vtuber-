import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ActionType = 'idle' | 'wave' | 'heart' | 'kiss' | 'sing' | 'dance' | 'shy' | 'hug' | 'excited' | 'boop' | 'finale' | 'core_memory';

interface PlaygroundState {
  currentAction: ActionType;
  setAction: (action: ActionType, durationMs?: number) => void;
  magicEnabled: boolean;
  setMagicEnabled: (v: boolean) => void;
  particles: ParticleEvent[];
  emitParticles: (type: 'heart' | 'sparkle' | 'rain' | 'confetti', x?: number, y?: number) => void;
  clearParticles: () => void;
  isRedStringActive: boolean;
  setRedStringActive: (v: boolean) => void;
}

export interface ParticleEvent {
  id: string;
  type: 'heart' | 'sparkle' | 'rain' | 'confetti';
  x?: number;
  y?: number;
  timestamp: number;
}

const PlaygroundContext = createContext<PlaygroundState | null>(null);

export function PlaygroundProvider({ children }: { children: React.ReactNode }) {
  const [currentAction, setCurrentActionState] = useState<ActionType>('idle');
  const [magicEnabled, setMagicEnabled] = useState(false);
  const [particles, setParticles] = useState<ParticleEvent[]>([]);
  const [isRedStringActive, setRedStringActive] = useState(false);
  
  const actionTimeoutRef = useRef<number | null>(null);

  const setAction = useCallback((action: ActionType, durationMs: number = 3000) => {
    setCurrentActionState(action);
    if (actionTimeoutRef.current) {
      window.clearTimeout(actionTimeoutRef.current);
    }
    if (action !== 'idle' && action !== 'finale') {
      actionTimeoutRef.current = window.setTimeout(() => {
        setCurrentActionState('idle');
      }, durationMs);
    }
  }, []);

  const emitParticles = useCallback((type: 'heart' | 'sparkle' | 'rain' | 'confetti', x?: number, y?: number) => {
    setParticles(prev => [...prev, { id: Math.random().toString(36).substring(7), type, x, y, timestamp: Date.now() }]);
  }, []);

  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  return (
    <PlaygroundContext.Provider value={{
      currentAction,
      setAction,
      magicEnabled,
      setMagicEnabled,
      particles,
      emitParticles,
      clearParticles,
      isRedStringActive,
      setRedStringActive
    }}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export const usePlayground = () => {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) throw new Error('usePlayground must be used within PlaygroundProvider');
  return ctx;
};
