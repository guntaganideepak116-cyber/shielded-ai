import React from 'react';
import { motion } from 'framer-motion';

interface LogoRendererProps {
  className?: string;
  animate?: boolean;
}

export const LogoRenderer: React.FC<LogoRendererProps> = ({ className = "w-10 h-10", animate = false }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Deep background gradient */}
        <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="50%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Ultra-bright neon primary core gradient */}
        <linearGradient id="logoCore" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        {/* Glow filter for 3D effect */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Intense white-hot highlight gradient */}
        <linearGradient id="highlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* 1. Backdrop Shield (Dark & Solid) for contrast */}
      <path 
        d="M 50 5 L 90 20 L 90 55 C 90 85 50 97 50 97 C 50 97 10 85 10 55 L 10 20 Z" 
        fill="url(#logoBg)" 
        stroke="#6366f1" 
        strokeWidth="3"
        filter="drop-shadow(0px 0px 12px rgba(99,102,241,0.8))"
      />

      {/* 2. Right Half Shadow for 3D depth */}
      <path 
        d="M 50 5 L 90 20 L 90 55 C 90 85 50 97 50 97 L 50 5" 
        fill="#000000" 
        opacity="0.3"
      />

      {/* 3. Inner Glowing Core Shield */}
      <motion.path 
        d="M 50 15 L 80 26 L 80 53 C 80 77 50 88 50 88 C 50 88 20 77 20 53 L 20 26 Z" 
        fill="url(#logoCore)" 
        filter="url(#logoGlow)"
        animate={animate ? { 
          opacity: [0.8, 1, 0.8],
          scale: [0.98, 1.02, 0.98]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 4. Top Highlight Edge to give metallic feel */}
      <path 
        d="M 50 15 L 80 26 C 75 30 60 20 50 20 C 40 20 25 30 20 26 Z" 
        fill="url(#highlight)"
      />

      {/* 5. Center Artificial Intelligence Node (Solid neon orb) */}
      <motion.circle 
        cx="50" 
        cy="45" 
        r="12" 
        fill="#ffffff" 
        filter="url(#logoGlow)"
        animate={animate ? { scale: [1, 1.15, 1], filter: ['drop-shadow(0 0 10px #fff)', 'drop-shadow(0 0 25px #fff)', 'drop-shadow(0 0 10px #fff)'] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* 6. Orbital rings around the AI node */}
      <motion.path
        d="M 32 45 A 18 18 0 0 1 68 45 A 18 18 0 0 1 32 45 M 50 27 A 18 18 0 0 1 50 63"
        fill="none"
        stroke="#e7e5e4"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={animate ? { rotate: [0, 90, 180, 270, 360] } : {}}
        style={{ originX: '50px', originY: '45px' }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
};
