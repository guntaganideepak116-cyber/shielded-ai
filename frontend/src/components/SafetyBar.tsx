import { motion } from 'framer-motion';
import { Download, RotateCcw, Shield, Wand2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafetyBarProps {
  onRestore: () => void;
  onOpenChat?: () => void;
  onGuide?: () => void;
  showGuide?: boolean;
}

const SafetyBar = ({ onRestore, onOpenChat, onGuide, showGuide }: SafetyBarProps) => {
  const handleBackup = () => {
    const backup = '# SECURESHIELD AI - Original .htaccess backup\n# Generated: ' + new Date().toLocaleString() + '\n\n# Original rules start here\n# No custom rules detected';
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
      className="fixed bottom-0 left-0 right-0 z-40 glass-card-strong border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-display font-bold text-white uppercase tracking-widest opacity-50">Safety System</p>
            <p className="text-xs font-body text-white/90">Fortress Node Active</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenChat && (
            <Button
              size="sm"
              onClick={onOpenChat}
              className="text-xs font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              AI CHATBOT
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleBackup}
            className="text-xs font-body border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            <span className="hidden sm:inline">BACKUP ORIGINAL</span>
            <span className="sm:hidden">BACKUP</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRestore}
            className="text-xs font-body border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">EMERGENCY RESTORE</span>
            <span className="sm:hidden">RESTORE</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SafetyBar;
