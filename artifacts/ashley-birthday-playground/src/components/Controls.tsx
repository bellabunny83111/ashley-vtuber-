import React from 'react';
import { motion } from 'framer-motion';
import { usePlayground } from '@/lib/PlaygroundContext';
import { Heart, Music, Star, Smile, Sparkles, PartyPopper, Hand, Camera } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

export function Controls() {
  const { setAction, emitParticles } = usePlayground();
  const { playSound } = useAudio();

  const handleAction = (action: any, sound: any, particle?: any) => {
    setAction(action);
    playSound(sound);
    if (particle) emitParticles(particle);
  };

  const buttons = [
    { id: 'wave', label: 'Wave', icon: Hand, sound: 'pop', action: 'wave' },
    { id: 'heart', label: 'Heart', icon: Heart, sound: 'sparkle', action: 'heart', particle: 'heart' },
    { id: 'kiss', label: 'Kiss', icon: Smile, sound: 'kiss', action: 'kiss', particle: 'heart' },
    { id: 'sing', label: 'Sing', icon: Music, sound: 'chime', action: 'sing' },
    { id: 'dance', label: 'Dance', icon: Star, sound: 'magic', action: 'dance', particle: 'sparkle' },
    { id: 'shy', label: 'Shy', icon: Smile, sound: 'boop', action: 'shy' },
    { id: 'hug', label: 'Hug', icon: Heart, sound: 'pop', action: 'hug' },
    { id: 'excited', label: 'Yay!', icon: Sparkles, sound: 'chime', action: 'excited', particle: 'sparkle' },
    { id: 'finale', label: 'Show!', icon: PartyPopper, sound: 'fanfare', action: 'finale', particle: 'confetti' }
  ];

  return (
    <div className="absolute bottom-6 left-0 right-0 z-40 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar px-2 snap-x">
          {buttons.map((btn) => (
            <motion.button
              key={btn.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction(btn.action, btn.sound, btn.particle)}
              className="snap-center shrink-0 flex flex-col items-center justify-center bg-white border-2 border-primary/20 rounded-3xl p-4 min-w-[90px] shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform" />
              <btn.icon className="h-8 w-8 text-primary mb-2 relative z-10" />
              <span className="text-sm font-bold text-foreground relative z-10">{btn.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
