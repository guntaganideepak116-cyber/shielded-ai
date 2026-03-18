import { motion } from 'framer-motion';

interface ScanProgressProps {
  progress: number;
  timeLeft: number;
}

const ScanProgress = ({ progress, timeLeft }: ScanProgressProps) => {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Scanning vulnerabilities...</span>
          <span className="text-primary font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--gradient-primary)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-body">
          <span>Checking headers, SSL, admin panels, config...</span>
          <span>~{timeLeft}s remaining</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ScanProgress;
