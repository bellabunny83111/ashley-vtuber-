import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayground } from '@/lib/PlaygroundContext';

export function Particles() {
  const { particles, isRedStringActive } = usePlayground();
  const [activeParticles, setActiveParticles] = useState<any[]>([]);

  useEffect(() => {
    if (particles.length > 0) {
      const newParticles = particles.map(p => {
        const items = [];
        if (p.type === 'rain' || p.type === 'confetti') {
          for (let i = 0; i < 30; i++) {
            items.push({
              id: `${p.id}-${i}`,
              type: p.type,
              x: Math.random() * window.innerWidth,
              y: -50 - Math.random() * 200,
              delay: Math.random() * 0.5
            });
          }
        } else {
          for (let i = 0; i < 8; i++) {
            items.push({
              id: `${p.id}-${i}`,
              type: p.type,
              x: p.x !== undefined ? p.x : window.innerWidth / 2,
              y: p.y !== undefined ? p.y : window.innerHeight / 2,
              angle: (Math.PI * 2 * i) / 8 + Math.random() * 0.5,
              delay: 0
            });
          }
        }
        return items;
      }).flat();
      
      setActiveParticles(prev => [...prev, ...newParticles].slice(-100));
    }
  }, [particles]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {activeParticles.map(p => (
          <Particle key={p.id} {...p} />
        ))}
      </AnimatePresence>
      {isRedStringActive && <RedStringOverlay />}
    </div>
  );
}

function Particle({ type, x, y, angle, delay }: any) {
  if (type === 'rain' || type === 'confetti') {
    const isStrawberry = type === 'rain';
    return (
      <motion.div
        initial={{ x, y, opacity: 1, rotate: 0 }}
        animate={{ 
          y: window.innerHeight + 50, 
          x: x + (Math.random() * 100 - 50),
          rotate: Math.random() * 360 
        }}
        transition={{ duration: 2 + Math.random() * 2, delay, ease: "linear" }}
        className="absolute w-6 h-6"
        onAnimationComplete={() => {}}
      >
        {isStrawberry ? '🍓' : <div className="w-3 h-3 bg-primary rounded-sm shadow-sm" style={{ backgroundColor: ['#FF4D6D', '#FFB3C6', '#FFD700', '#4CAF50'][Math.floor(Math.random() * 4)] }} />}
      </motion.div>
    );
  }

  // Burst for heart/sparkle
  const dist = 60 + Math.random() * 60;
  const targetX = x + Math.cos(angle) * dist;
  const targetY = y + Math.sin(angle) * dist;

  return (
    <motion.div
      initial={{ x, y, opacity: 1, scale: 0.5 }}
      animate={{ x: targetX, y: targetY, opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute"
    >
      {type === 'heart' ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF4D6D" stroke="#FF4D6D" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
        </svg>
      )}
    </motion.div>
  );
}

function RedStringOverlay() {
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight - 100 });
  
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  const ashleyHandX = window.innerWidth / 2 + 50;
  const ashleyHandY = window.innerHeight / 2;

  const dx = mousePos.x - ashleyHandX;
  const dy = mousePos.y - ashleyHandY;
  const dist = Math.sqrt(dx*dx + dy*dy);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
        d={`M ${ashleyHandX} ${ashleyHandY} Q ${ashleyHandX + dx/2} ${ashleyHandY + dy/2 + dist*0.2} ${mousePos.x} ${mousePos.y}`}
        fill="none"
        stroke="#FF4D6D"
        strokeWidth="4"
        filter="url(#glow)"
        strokeLinecap="round"
      />
    </svg>
  );
}
