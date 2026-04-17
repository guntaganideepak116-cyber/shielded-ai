import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Copy, Check, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface ThemeBadgeProps {
  score: number;
}

const ThemeBadgeGenerator = ({ isOpen, onClose, domain, score }: { isOpen: boolean; onClose: () => void; domain: string; score: number }) => {
  const [copied, setCopied] = useState(false);
  const badgeLevel = score >= 90 ? 'Gold' : score >= 70 ? 'Silver' : 'Bronze';
  const badgeColor = score >= 90 ? '#fbbf24' : score >= 70 ? '#94a3b8' : '#78350f';

  const embedCode = `<!-- SECUREWEB AI Verified Badge -->
<div id="secureweb-badge" data-domain="${domain}" data-score="${score}"></div>
<script src="https://secureweb.ai/badge.js?v=2.0" async></script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Badge Code Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-xl glass-card-strong bg-slate-900 border border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <Sparkles className="text-primary" />
                    AI Badge Generator
                  </h2>
                  <p className="text-white/40 text-xs font-body mt-1 uppercase tracking-widest">Global Security Trust Seal</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 items-center mb-8">
                   {/* Preview */}
                   <div className="space-y-4">
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Live Preview</p>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center h-32 relative group">
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                            <div className="relative flex items-center gap-3 px-4 py-2 bg-[#0a0a0a] border-2 rounded-xl" style={{ borderColor: badgeColor }}>
                                <ShieldCheck className="w-6 h-6" style={{ color: badgeColor }} />
                                <div className="text-left">
                                    <p className="text-[10px] text-white/40 font-bold uppercase leading-tight">SECURED BY</p>
                                    <p className="text-xs font-display font-black text-white leading-tight">SECUREWEB AI</p>
                                </div>
                                <div className="ml-2 pl-3 border-l border-white/10 text-right">
                                    <p className="text-xs font-black" style={{ color: badgeColor }}>{score}</p>
                                    <p className="text-[10px] text-white/40 uppercase font-bold">{badgeLevel}</p>
                                </div>
                            </div>
                        </div>
                   </div>

                   {/* Customization */}
                   <div className="space-y-4">
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Theme Mode</p>
                        <div className="flex gap-2">
                            {['Cyber', 'Classic', 'Neon', 'Dark'].map(m => (
                                <button key={m} className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-white font-bold transition-all ${m === 'Cyber' ? 'bg-primary border-primary/50' : 'bg-white/5 hover:bg-white/10'}`}>
                                    {m[0]}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-white/40 font-body leading-relaxed">Generated based on your <span className="text-primary font-bold">{badgeLevel} Rank</span>.</p>
                   </div>
              </div>

              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Embed Code</p>
                    <button onClick={copyCode} className="flex items-center gap-2 text-[10px] font-bold text-primary hover:text-primary/80 transition-all uppercase tracking-widest cursor-pointer">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy Snippet'}
                    </button>
                  </div>
                  <div className="p-4 bg-black rounded-xl border border-white/10 font-mono text-xs text-blue-300 leading-relaxed overflow-x-auto">
                      {embedCode}
                  </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                 <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                    <Wand2 className="w-5 h-5" />
                    Apply Custom CSS Override
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ThemeBadgeGenerator;
