import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScannerInputProps {
  onScan: (url: string) => void;
  isScanning: boolean;
  t?: Record<string, string>;
}

const ScannerInput = ({ onScan, isScanning, t }: ScannerInputProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onScan(url.trim());
    }
  };

  const handleDemo = () => {
    setUrl('example.com');
    onScan('example.com');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-card-strong p-2 flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex items-center gap-3 px-4 py-2 md:py-0">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t?.scanNow || "Enter website URL (e.g., example.com)"}
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-body min-h-[48px]"
              disabled={isScanning}
            />
          </div>
          <Button
            type="submit"
            disabled={!url.trim() || isScanning}
            className="gradient-btn px-6 py-3 rounded-lg font-display font-semibold text-sm w-full md:w-auto shrink-0 pulse-neon min-h-[48px]"
          >
            <Search className="w-4 h-4 mr-2" />
            {isScanning ? 'SCANNING...' : (t?.scanNow ? t?.scanNow.toUpperCase() : 'SCAN NOW')}
          </Button>
        </div>
      </form>

      <motion.div
        className="flex justify-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={handleDemo}
          disabled={isScanning}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Zap className="w-4 h-4" />
          {t?.title ? 'Try Live Demo' : 'Try Live Demo'}
        </button>
      </motion.div>
    </div>
  );
};

export default ScannerInput;
