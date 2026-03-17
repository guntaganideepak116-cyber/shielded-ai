import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getGrade, getGradeColor } from '@/lib/scan-data';

interface ScoreDisplayProps {
  score: number;
  animate?: boolean;
}

const ScoreDisplay = ({ score, animate = true }: ScoreDisplayProps) => {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const grade = getGrade(score);
  const colorClass = getGradeColor(score);

  useEffect(() => {
    if (!animate) return;
    let current = 0;
    const step = score / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, 25);
    return () => clearInterval(interval);
  }, [score, animate]);

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="relative inline-block">
        {/* Circular background */}
        <svg className="w-40 h-40 md:w-52 md:h-52" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="85"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <motion.circle
            cx="100" cy="100" r="85"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={534}
            initial={{ strokeDashoffset: 534 }}
            animate={{ strokeDashoffset: 534 - (534 * score) / 100 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            transform="rotate(-90 100 100)"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'} />
              <stop offset="100%" stopColor={score >= 70 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-5xl md:text-6xl font-bold ${colorClass}`}>
            {Math.round(displayScore)}
          </span>
          <span className="text-muted-foreground text-sm font-body">/100</span>
          <span className={`font-display text-xl font-bold mt-1 ${colorClass}`}>
            {grade}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreDisplay;
