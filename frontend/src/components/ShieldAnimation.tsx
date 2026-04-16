import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface ShieldAnimationProps {
  scanning?: boolean;
  score?: number;
}

const ShieldAnimation = ({ scanning = false, score }: ShieldAnimationProps) => {
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsla(231, 84%, 66%, 0.15) 0%, transparent 70%)',
        }}
        animate={scanning ? { scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] } : { scale: 1, opacity: 0.3 }}
        transition={{ duration: 2, repeat: scanning ? Infinity : 0 }}
      />
      <motion.div
        className="absolute inset-4 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsla(270, 50%, 50%, 0.15) 0%, transparent 70%)',
        }}
        animate={scanning ? { scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] } : { scale: 1, opacity: 0.2 }}
        transition={{ duration: 2, repeat: scanning ? Infinity : 0, delay: 0.3 }}
      />

      {/* Shield icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={scanning ? {} : { y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative">
          <Shield
            className="w-24 h-24 md:w-32 md:h-32"
            style={{
              stroke: 'url(#shieldGradient)',
              strokeWidth: 1.5,
              fill: 'hsla(231, 84%, 66%, 0.08)',
            }}
          />
          <svg width="0" height="0">
            <defs>
              <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Score overlay */}
          {score !== undefined && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <span className="font-display text-2xl md:text-3xl font-bold gradient-text">
                {score}
              </span>
            </motion.div>
          )}

          {/* Scan line */}
          {scanning && (
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="scan-line" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ShieldAnimation;
