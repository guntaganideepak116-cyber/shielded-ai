import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScannerInputProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

const ScannerInput = ({ onScan, isScanning }: ScannerInputProps) => {
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
        <div className="glass-card-strong p-2 flex gap-2">
          <div className="flex-1 flex items-center gap-3 px-4">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., example.com)"
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-body"
              disabled={isScanning}
            />
          </div>
          <Button
            type="submit"
            disabled={!url.trim() || isScanning}
            className="gradient-btn px-6 py-3 rounded-lg font-display font-semibold text-sm shrink-0 pulse-neon"
          >
            <Search className="w-4 h-4 mr-2" />
            {isScanning ? 'SCANNING...' : 'SCAN NOW'}
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
          Try Live Demo
        </button>
      </motion.div>
    </div>
  );
};

export default ScannerInput;
