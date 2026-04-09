import { motion } from 'framer-motion';
import { 
  Download, RotateCcw, Shield, Wand2, MessageCircle, BarChart3, Trophy, 
  Sparkles, TrendingDown, Languages, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SafetyBarProps {
  onRestore: () => void;
  onOpenChat?: () => void;
  onGuide?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenPredict?: () => void;
  onOpenCompare?: () => void;
  onOpenTheme?: () => void;
  currentLang: string;
  onLangChange: (lang: string) => void;
  showGuide?: boolean;
}

const SafetyBar = ({ 
  onRestore, 
  onOpenChat, 
  onOpenLeaderboard, 
  onOpenPredict, 
  onOpenCompare, 
  onOpenTheme,
  currentLang,
  onLangChange
}: SafetyBarProps) => {

  const handleBackup = () => {
    const backup = '# SECUREWEB AI - Original .htaccess backup\n# Generated: ' + new Date().toLocaleString() + '\n\n# Original rules start here\n# No custom rules detected';
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
      <div className="container mx-auto px-4 py-3 flex flex-col min-[400px]:flex-row items-center justify-between gap-4 overflow-x-auto no-scrollbar safe-padding-bottom">
        <div className="flex items-center gap-3 shrink-0 self-start min-[400px]:self-center">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div className="block sm:hidden lg:block">
            <p className="text-[10px] font-display font-bold text-white uppercase tracking-widest opacity-50">Safety System</p>
            <p className="text-[10px] md:text-xs font-body text-white/90 truncate max-w-[120px] md:max-w-none">Fortress Node Active</p>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2 overflow-x-auto w-full min-[400px]:w-auto no-scrollbar pb-1 min-[400px]:pb-0">
           {/* HACKATHON POWER BAR */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 mr-2">
             <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full hover:bg-white/10" onClick={onOpenCompare} title="Compare Before/After">
                <BarChart3 className="w-4 h-4 text-orange-400" />
             </Button>
             <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full hover:bg-white/10" onClick={onOpenLeaderboard} title="Global Leaderboard">
                <Trophy className="w-4 h-4 text-yellow-400" />
             </Button>
             <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full hover:bg-white/10" onClick={onOpenTheme} title="Badge Generator">
                <Sparkles className="w-4 h-4 text-primary" />
             </Button>
             <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full hover:bg-white/10" onClick={onOpenPredict} title="Future Risk Scan">
                <TrendingDown className="w-4 h-4 text-red-500" />
             </Button>
             <div className="w-px h-4 bg-white/10 mx-1" />
             <div className="flex items-center gap-1">
                {['EN', 'TE', 'HI'].map(l => (
                  <button 
                  key={l}
                  onClick={() => onLangChange(l)}
                  className={`text-[9px] font-bold w-6 h-6 rounded-md transition-all ${currentLang === l ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/10'}`}
                  >
                    {l}
                  </button>
                ))}
             </div>
           </div>

          {onOpenChat && (
            <Button
              size="sm"
              onClick={onOpenChat}
              className="text-xs font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">AI CHATBOT</span>
              <span className="sm:hidden">AI</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleBackup}
            className="text-xs font-body border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            <span className="hidden sm:inline">BACKUP</span>
            <span className="sm:hidden text-[10px]">FIXUP</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRestore}
            className="text-xs font-body border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden md:inline">EMERGENCY RESTORE</span>
            <span className="md:hidden">RESTORE</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SafetyBar;
