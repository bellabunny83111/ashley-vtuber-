import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePlayground, ActionType } from "@/lib/PlaygroundContext";

interface AshleyProps {
  micVolume: number;
}

export function Ashley({ micVolume }: AshleyProps) {
  const { currentAction, setAction } = usePlayground();

  // Animation variants mapped from currentAction
  const headVariants = {
    idle: {
      rotate: [0, 2, -2, 0],
      y: [0, -2, 0],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
    },
    wave: { rotate: 5, y: -2, transition: { type: "spring" } },
    heart: { rotate: -5, y: 2 },
    kiss: { rotate: 10, y: -5, transition: { type: "spring" } },
    sing: {
      rotate: [-5, 5, -5],
      y: [-2, 2, -2],
      transition: { repeat: Infinity, duration: 2 },
    },
    dance: {
      rotate: [0, -15, 15, 0],
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 0.8 },
    },
    shy: { rotate: -15, y: 10, transition: { type: "spring" } },
    hug: { rotate: 0, y: 5 },
    excited: {
      rotate: [0, -5, 5, 0],
      y: [0, -15, 0],
      transition: { repeat: Infinity, duration: 0.4 },
    },
    boop: {
      scaleY: 0.9,
      scaleX: 1.1,
      y: 10,
      transition: { type: "spring", bounce: 0.8 },
    },
    finale: {
      rotate: [0, -20, 20, 0],
      y: -20,
      transition: { repeat: Infinity, duration: 1 },
    },
    core_memory: { rotate: 0, scale: 1.1 },
  };

  const bodyVariants = {
    idle: {
      y: [0, -3, 0],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut",
        delay: 0.2,
      },
    },
    wave: { y: 0 },
    heart: { y: 2 },
    kiss: { y: -2 },
    sing: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 1 } },
    dance: {
      y: [0, -15, 0],
      x: [-10, 10, -10],
      transition: { repeat: Infinity, duration: 0.8 },
    },
    shy: { rotate: 5, y: 5 },
    hug: { scale: 1.05, y: 5 },
    excited: {
      y: [0, -20, 0],
      transition: { repeat: Infinity, duration: 0.4 },
    },
    boop: { scaleY: 0.95, y: 5 },
    finale: { y: [0, -30, 0], transition: { repeat: Infinity, duration: 0.5 } },
    core_memory: { y: 0 },
  };

  const leftArmVariants = {
    idle: { rotate: [0, 5, 0], transition: { repeat: Infinity, duration: 4 } },
    wave: { rotate: 0 },
    heart: { rotate: -40, x: 10, y: -10 }, // Bring up to chest
    kiss: { rotate: -20 },
    sing: {
      rotate: -30,
      transition: { repeat: Infinity, duration: 2, repeatType: "reverse" },
    },
    dance: {
      rotate: [0, -60, 0],
      transition: { repeat: Infinity, duration: 0.8 },
    },
    shy: { rotate: 20 },
    hug: { rotate: -60, x: 20 },
    excited: {
      rotate: [-20, -80, -20],
      transition: { repeat: Infinity, duration: 0.4 },
    },
    boop: { rotate: 10 },
    finale: {
      rotate: -90,
      transition: { repeat: Infinity, duration: 0.5, repeatType: "reverse" },
    },
    core_memory: { rotate: 0 },
  };

  const rightArmVariants = {
    idle: {
      rotate: [0, -5, 0],
      transition: { repeat: Infinity, duration: 4, delay: 0.5 },
    },
    wave: {
      rotate: [0, 120, 90, 120, 90, 120, 0],
      transition: { duration: 2 },
    },
    heart: { rotate: 40, x: -10, y: -10 }, // Bring up to chest
    kiss: { rotate: [0, 90, 0], transition: { duration: 1.5 } }, // Blow kiss
    sing: {
      rotate: 30,
      transition: {
        repeat: Infinity,
        duration: 2,
        repeatType: "reverse",
        delay: 0.5,
      },
    },
    dance: {
      rotate: [0, 60, 0],
      transition: { repeat: Infinity, duration: 0.8, delay: 0.4 },
    },
    shy: { rotate: -20 },
    hug: { rotate: 60, x: -20 },
    excited: {
      rotate: [20, 80, 20],
      transition: { repeat: Infinity, duration: 0.4 },
    },
    boop: { rotate: -10 },
    finale: {
      rotate: 90,
      transition: {
        repeat: Infinity,
        duration: 0.5,
        repeatType: "reverse",
        delay: 0.25,
      },
    },
    core_memory: { rotate: 0 },
  };

  const mouthVariants = {
    idle: { scaleY: 1 },
    wave: { scaleY: 1.5 },
    heart: { scaleY: 1.2 },
    kiss: { scaleX: 0.5, scaleY: 0.5 }, // puckered
    sing: { scaleY: 2 + micVolume * 3 }, // reactive to mic
    dance: { scaleY: 2 },
    shy: { scaleY: 0.5 },
    hug: { scaleY: 1 },
    excited: { scaleY: 2.5, scaleX: 1.2 },
    boop: { scaleY: 0.2 },
    finale: { scaleY: 2.5 },
    core_memory: { scaleY: 1 },
  };

  const eyeVariants = {
    idle: {
      scaleY: [1, 1, 1, 1, 0.1, 1, 1],
      transition: { repeat: Infinity, duration: 4 },
    }, // blink
    wave: { scaleY: 1 },
    heart: { scaleY: 0.1 }, // closed/happy eyes
    kiss: { scaleY: 0.1 },
    sing: { scaleY: 0.1 },
    dance: {
      scaleY: [1, 0.1, 1],
      transition: { repeat: Infinity, duration: 1 },
    },
    shy: { scaleY: 1.2, x: 2 }, // looking away slightly
    hug: { scaleY: 0.1 },
    excited: { scaleY: 1.5 }, // wide eyes
    boop: { scaleY: 1.5, scaleX: 1.2 }, // surprised
    finale: { scaleY: 0.1 },
    core_memory: { scaleY: 1 },
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="relative pointer-events-auto cursor-grab active:cursor-grabbing w-[300px] h-[500px]"
        drag
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
        dragElastic={0.2}
      >
        <svg viewBox="0 0 300 500" className="w-full h-full drop-shadow-2xl">
          <defs>
            <radialGradient id="blush" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffb3c6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffb3c6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Master Body Group */}
          <motion.g
            animate={bodyVariants[currentAction]}
            style={{ transformOrigin: "150px 400px" }}
          >
            {/* Left Arm (Behind body) */}
            <motion.g
              animate={leftArmVariants[currentAction]}
              style={{ transformOrigin: "100px 220px" }}
            >
              <rect
                x="70"
                y="210"
                width="30"
                height="120"
                rx="15"
                fill="#fbc3bc"
              />
              <rect
                x="70"
                y="210"
                width="30"
                height="60"
                rx="15"
                fill="#FF4D6D"
              />{" "}
              {/* Sleeve */}
            </motion.g>
            {/* Legs */}
            <g>
              <rect
                x="110"
                y="380"
                width="24"
                height="100"
                rx="12"
                fill="#fff"
              />
              <rect
                x="166"
                y="380"
                width="24"
                height="100"
                rx="12"
                fill="#fff"
              />
              {/* Shoes */}
              <path
                d="M 110 460 Q 110 480 134 480 L 134 460 Z"
                fill="#FF8FA3"
              />
              <path
                d="M 166 460 Q 166 480 190 480 L 190 460 Z"
                fill="#FF8FA3"
              />
            </g>
            {/* Dress/Body */}
            <path
              d="M 100 220 Q 150 200 200 220 L 230 380 Q 150 400 70 380 Z"
              fill="#FF4D6D"
            />
            <path
              d="M 90 350 Q 150 380 210 350 L 230 380 Q 150 400 70 380 Z"
              fill="#FFB3C6"
            />{" "}
            {/* Frill */}
            {/* Belt */}
            <rect
              x="110"
              y="280"
              width="80"
              height="15"
              fill="#590D22"
              opacity="0.2"
            />
            {/* Head Group */}
            <motion.g
              animate={headVariants[currentAction]}
              style={{ transformOrigin: "150px 200px" }}
              onClick={() => setAction("boop", 1000)}
            >
              {/* Back Hair */}
              <path
                d="M 70 150 C 50 250 80 350 90 350 C 120 200 180 200 210 350 C 220 350 250 250 230 150 Z"
                fill="#FFB3C6"
              />

              {/* Face */}
              <circle cx="150" cy="140" r="60" fill="#fbc3bc" />

              {/* Blush */}
              <circle cx="110" cy="160" r="15" fill="url(#blush)" />
              <circle cx="190" cy="160" r="15" fill="url(#blush)" />

              {/* Eyes */}
              <motion.g
                animate={eyeVariants[currentAction]}
                style={{ transformOrigin: "150px 140px" }}
              >
                <ellipse cx="120" cy="140" rx="6" ry="10" fill="#590D22" />
                <ellipse cx="180" cy="140" rx="6" ry="10" fill="#590D22" />
                {/* Highlights */}
                <circle cx="118" cy="136" r="3" fill="#fff" />
                <circle cx="178" cy="136" r="3" fill="#fff" />
              </motion.g>

              {/* Mouth */}
              <motion.g
                animate={mouthVariants[currentAction]}
                style={{ transformOrigin: "150px 170px" }}
              >
                <path
                  d="M 140 170 Q 150 180 160 170"
                  fill="none"
                  stroke="#590D22"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </motion.g>

              {/* Front Bangs */}
              <path
                d="M 90 140 Q 150 50 210 140 Q 180 90 150 100 Q 120 90 90 140 Z"
                fill="#FFB3C6"
              />
            </motion.g>
            {/* Right Arm (In front) */}
            <motion.g
              animate={rightArmVariants[currentAction]}
              style={{ transformOrigin: "200px 220px" }}
            >
              <rect
                x="200"
                y="210"
                width="30"
                height="120"
                rx="15"
                fill="#fbc3bc"
              />
              <rect
                x="200"
                y="210"
                width="30"
                height="60"
                rx="15"
                fill="#FF4D6D"
              />{" "}
              {/* Sleeve */}
            </motion.g>
          </motion.g>
        </svg>

        {/* Emotion overlays */}
        {currentAction === "shy" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-4 right-10 text-3xl"
          >
            💧
          </motion.div>
        )}
        {currentAction === "sing" && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, y: -20, x: 20 }}
            className="absolute top-10 right-0 text-4xl"
          >
            🎵
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
