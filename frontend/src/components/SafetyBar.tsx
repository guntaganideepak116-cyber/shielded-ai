import { motion } from 'framer-motion';
import { Download, RotateCcw, Shield, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type HostingPlatform } from '@/lib/platform-detection';

interface SafetyBarProps {
  onRestore: () => void;
  onGuide?: () => void;
  showGuide?: boolean;
}

const SafetyBar = ({ onRestore, onGuide, showGuide }: SafetyBarProps) => {
  const handleBackup = () => {
    const backup = '# Original .htaccess backup\n# No custom rules';
    const blob = new Blob([backup], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.htaccess.backup';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 glass-card-strong border-t border-border"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-body hidden sm:inline">Safety Controls</span>
        </div>
        <div className="flex items-center gap-2">
          {showGuide && onGuide && (
            <Button
              size="sm"
              onClick={onGuide}
              className="text-xs font-display font-bold gradient-btn pulse-neon"
            >
              <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              🧙‍♂️ GUIDE ME
              <span className="hidden sm:inline ml-1">(3 min)</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackup}
            className="text-xs font-body border-border text-foreground hover:bg-muted"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Backup</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRestore}
            className="text-xs font-body border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Restore</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SafetyBar;
