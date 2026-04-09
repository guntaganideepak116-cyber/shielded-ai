import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle2, AlertCircle, Share2, Download, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompareResultsProps {
  isOpen: boolean;
  onClose: () => void;
  baseline: { score: number; issues: any[] } | null;
  current: { score: number; issues: any[] } | null;
  domain: string;
}

const CompareResults = ({ isOpen, onClose, baseline, current, domain }: CompareResultsProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (isOpen && current) {
      const duration = 1500;
      const steps = 60;
      const stepValue = current.score / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setDisplayScore(Math.floor(stepValue * currentStep));
        if (currentStep >= steps) {
          setDisplayScore(current.score);
          clearInterval(timer);
          if (current.score >= 90) {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#6366f1', '#a855f7', '#ec4899']
            });
          }
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isOpen, current]);

  if (!baseline || !current) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-5xl glass-card-strong bg-slate-900 border border-white/20 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)]"
            initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-8 md:p-14">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-4xl font-display font-bold text-white mb-2">Impact Report</h2>
                  <p className="text-white/40 font-body">Security transformation for <span className="text-primary">{domain}</span></p>
                </div>
                <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 text-white/50">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* BEFORE */}
                <div className="space-y-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                   <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/20 text-center">
                      <p className="text-xs font-display font-bold text-red-400 uppercase tracking-widest mb-4">Baseline Score</p>
                      <div className="text-7xl font-display font-black text-white mb-2">{baseline.score}</div>
                      <p className="text-sm font-body text-red-500/70">Vulnerable State Detected</p>
                   </div>
                   <div className="space-y-2">
                       {baseline.issues.slice(0, 3).map((issue, i) => (
                           <div key={i} className="flex items-center gap-3 text-xs text-white/30">
                               <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                               <span>{issue.header || 'Insecure Header Configuration'}</span>
                           </div>
                       ))}
                   </div>
                </div>

                {/* AFTER */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative p-10 rounded-[2.5rem] glass-card-strong border-primary/50 text-center shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                      <p className="text-xs font-display font-bold text-primary uppercase tracking-widest mb-4">Optimized Score</p>
                      <div className="text-9xl font-display font-black text-white mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        {displayScore}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-green-400 font-display font-bold text-sm">
                          <ShieldCheck className="w-5 h-5" />
                          DEFENSE SYSTEM ACTIVE
                      </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Score Jump</p>
                          <p className="text-2xl font-display font-bold text-green-400">+{current.score - baseline.score}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Fixes Applied</p>
                          <p className="text-2xl font-display font-bold text-primary">{current.issues.length} Issues</p>
                      </div>
                  </div>
                </div>
              </div>

              <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button className="w-full sm:w-auto px-8 py-5 bg-primary rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20">
                      <Share2 className="w-5 h-5" />
                      Viral Share Badge
                  </button>
                  <button className="w-full sm:w-auto px-8 py-5 bg-white/10 rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:bg-white/20 transition-all border border-white/10">
                      <Download className="w-5 h-5" />
                      PDF Security Audit
                  </button>
                  <button className="w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all">
                      <Zap className="w-5 h-5" />
                      Auto-Deploy v2.0
                  </button>
              </div>
            </div>
          </motion.div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowRight className="w-24 h-24 text-white/10 rotate-[-10deg]" />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CompareResults;
