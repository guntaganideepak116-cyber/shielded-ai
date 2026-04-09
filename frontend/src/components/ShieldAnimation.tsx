import { motion } from 'framer-motion';
import { LogoRenderer } from '@/components/LogoRenderer';

interface ShieldAnimationProps {
  scanning?: boolean;
  score?: number;
  progress?: number;
}

const ShieldAnimation = ({ scanning = false, score, progress }: ShieldAnimationProps) => {
  const isScanning = scanning || (progress !== undefined && progress > 0 && progress < 100);
  const isHigh = score && score >= 90;
  const isMed = score && score >= 70 && score < 90;
  const color = isHigh ? '#22c55e' : isMed ? '#3b82f6' : '#6366f1';

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto flex items-center justify-center">
      {/* Progress Ring */}
      {progress !== undefined && progress > 0 && (
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none overflow-visible">
          {/* Base Track */}
          <circle
            cx="50%" cy="50%" r="40%"
            fill="none"
            stroke="white"
            strokeWidth="1"
            className="opacity-10"
          />
          {/* Progress Path */}
          <motion.circle
            cx="50%" cy="50%" r="40%"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            style={{ 
              pathLength: progress / 100,
              filter: `drop-shadow(0 0 12px ${color})`,
              strokeOpacity: 0.8
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Glow dot at the tip of progress */}
          <motion.circle
            cx="50%" cy="50%" r="2"
            fill={color}
            style={{
              offsetPath: `circle(40% at 50% 50%)`,
              offsetDistance: `${progress}%`,
              filter: `drop-shadow(0 0 8px ${color})`
            }}
          />
        </svg>
      )}

      {/* Dynamic Background Pulse */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ 
          scale: isScanning ? [1, 1.2, 1] : 1,
          opacity: isScanning ? [0.2, 0.4, 0.2] : 0.1
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ background: `radial-gradient(circle, ${color}33 0%, transparent 70%)` }}
      />

      {/* Rotating Orbital Rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
           key={i}
           className="absolute border border-white/5 rounded-full"
           style={{ 
             width: `${80 + i * 20}%`, 
             height: `${80 + i * 20}%`,
             borderStyle: i === 1 ? 'dashed' : 'solid'
           }}
           animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
           transition={{ duration: 15 + i * 5, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Particles around the shield */}
      {isScanning && [0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary"
          initial={{ opacity: 0 }}
          animate={{ 
            x: [0, Math.cos(i * 60) * 120],
            y: [0, Math.sin(i * 60) * 120],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* THE MASTER SHIELD SVG */}
      <motion.div
        className="relative z-10 w-40 h-40 md:w-48 md:h-48 flex items-center justify-center"
        animate={isScanning ? { scale: [1, 1.05, 1], y: [0, -5, 0] } : { y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <LogoRenderer animate={isScanning} className="w-full h-full drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]" />

        {/* Score Text Overlay */}
        {score !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-4">
            <span 
              className="text-4xl md:text-5xl font-black font-display text-white z-20"
              style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.7))' }}
            >
              {score}
            </span>
          </div>
        )}

        {/* Scan Line Overlay */}
        {isScanning && (
          <motion.div
            className="absolute left-4 right-4 h-0.5 bg-white/50 blur-[2px] shadow-[0_0_15px_#fff]"
            animate={{ top: ['20%', '80%', '20%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default ShieldAnimation;
