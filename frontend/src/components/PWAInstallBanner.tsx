import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PWAInstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show on all devices if not installed
    if (window.matchMedia('(display-mode: standalone)').matches || localStorage.getItem('pwa-installed')) {
      return;
    }

    const timer = setTimeout(() => setShowBanner(true), 3000); // Wait 3s before showing
    
    const handler = () => setShowBanner(true);
    window.addEventListener('pwaInstallReady', handler);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pwaInstallReady', handler);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = window.deferredInstallPrompt;
    if (!prompt) return;
    
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
      localStorage.setItem('pwa-installed', 'true');
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-0 right-0 z-[10000] px-4 pointer-events-none"
        >
          <div className="mx-auto max-w-sm pointer-events-auto">
            <div className="glass-card-strong neon-border p-3 flex items-center gap-3 relative overflow-hidden group shadow-2xl">
              {/* Background accent */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
              
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-xs text-white leading-tight uppercase italic tracking-tighter">Install SecureWeb</h3>
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate">
                  Real-time protection
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  className="gradient-btn h-8 text-[9px] font-black uppercase tracking-widest px-3 rounded-lg"
                >
                  Install
                </Button>
                <button 
                  onClick={() => setShowBanner(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallBanner;
