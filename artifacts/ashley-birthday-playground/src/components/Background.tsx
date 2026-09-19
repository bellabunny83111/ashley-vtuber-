import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Background({ gyroX = 0, gyroY = 0 }: { gyroX?: number, gyroY?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background -z-10 flex items-center justify-center">
      <motion.div 
        className="absolute inset-[-10%] w-[120%] h-[120%] bg-gradient-to-b from-[#FFF0F3] to-[#ffe5eb]"
        animate={{
          x: gyroX * -20,
          y: gyroY * -20
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 100 }}
      >
        {/* Stylized Window */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-3/4 max-w-md h-[40%] bg-white rounded-t-full shadow-[inset_0_0_20px_rgba(255,179,198,0.3)] border-8 border-white overflow-hidden flex items-end justify-center">
          {/* Sky inside window */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#b3e5fc] to-[#e1f5fe]"></div>
          {/* Clouds */}
          <motion.div 
            animate={{ x: [0, 100, 0] }} 
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute top-10 left-10 w-20 h-6 bg-white rounded-full opacity-80 blur-[2px]"
          />
          <motion.div 
            animate={{ x: [0, -80, 0] }} 
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="absolute top-24 right-5 w-16 h-5 bg-white rounded-full opacity-80 blur-[2px]"
          />
          {/* Hills */}
          <div className="absolute -bottom-10 -left-10 w-48 h-32 bg-[#c8e6c9] rounded-full"></div>
          <div className="absolute -bottom-15 -right-10 w-56 h-40 bg-[#a5d6a7] rounded-full"></div>
        </div>

        {/* Room details */}
        {/* Wainscoting */}
        <div className="absolute bottom-0 w-full h-[40%] bg-white shadow-[0_-5px_15px_rgba(0,0,0,0.02)] border-t border-secondary flex flex-row">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 h-full border-r border-secondary/20" />
          ))}
        </div>

        {/* Balloons */}
        <FloatingBalloon color="#FF4D6D" left="15%" delay={0} />
        <FloatingBalloon color="#FFB3C6" left="80%" delay={1} />
        <FloatingBalloon color="#FF8FA3" left="70%" delay={2} scale={0.8} />
      </motion.div>
    </div>
  );
}

function FloatingBalloon({ color, left, delay, scale = 1 }: { color: string, left: string, delay: number, scale?: number }) {
  return (
    <motion.div
      className="absolute bottom-[-100px]"
      style={{ left, transform: `scale(${scale})` }}
      animate={{
        y: ['0vh', '-110vh'],
        x: [0, 20, -20, 0]
      }}
      transition={{
        y: { repeat: Infinity, duration: 15, ease: "linear", delay },
        x: { repeat: Infinity, duration: 5, ease: "easeInOut", delay }
      }}
    >
      <svg width="60" height="80" viewBox="0 0 60 80">
        <path d="M30 0 C10 0 0 15 0 30 C0 45 15 65 30 75 C45 65 60 45 60 30 C60 15 50 0 30 0 Z" fill={color} opacity="0.9" />
        <path d="M25 74 L30 80 L35 74 Z" fill={color} />
        {/* Highlight */}
        <path d="M15 15 Q25 10 35 15" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
      </svg>
      {/* String */}
      <svg width="2" height="100" className="absolute top-[80px] left-[29px]">
        <line x1="1" y1="0" x2="1" y2="100" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}
