import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Download, X, Smartphone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

// Define the beforeinstallprompt event interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const MobilePWAOverlay = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showOpenApp, setShowOpenApp] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // If already closed or installed, don't show
    if (localStorage.getItem('installPopupClosed') === 'true' || window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setShowInstall(false);
      }, 10000);

      if (analytics) logEvent(analytics, 'pwa_prompt_shown');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const dismissPrompt = () => {
    localStorage.setItem('installPopupClosed', 'true');
    setShowInstall(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem('installPopupClosed', 'true');
      if (analytics) logEvent(analytics, 'pwa_installed', { platform: 'web' });
    } else {
      dismissPrompt();
    }
    
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-2 px-4 shadow-xl flex items-center justify-center gap-2 safe-padding-top"
          >
            <WifiOff className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Connection Lost - Offline Mode</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstall && !isOffline && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: 50, x: '-50%', scale: 0.95 }}
            className="fixed bottom-24 left-1/2 w-[calc(100%-2rem)] max-w-[400px] z-[20] glass-card-strong border border-white/10 rounded-[1.25rem] p-3.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] flex items-center justify-between gap-3 safe-padding-bottom"
          >
            {/* Left content sequence */}
            <div className="flex items-center gap-3 overflow-hidden ml-1">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/30 to-purple-500/30 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                  <Smartphone className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
               </div>
               <div className="flex flex-col">
                 <span className="text-sm font-display font-bold text-white tracking-wide leading-tight mt-0.5">SECUREWEB App</span>
                 <span className="text-[10px] text-white/50 truncate font-body">Install for offline security access</span>
               </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={handleInstallClick} 
                className="text-[11px] sm:text-xs font-display font-bold bg-white text-background px-4 sm:px-5 py-2 rounded-full hover:bg-white/90 transform active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none min-h-[40px]"
              >
                Install
              </button>
              <button 
                onClick={dismissPrompt} 
                className="p-2.5 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full focus:outline-none min-h-[40px] flex items-center justify-center"
                aria-label="Dismiss installation prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobilePWAOverlay;
