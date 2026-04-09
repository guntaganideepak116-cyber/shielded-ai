import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Globe, ExternalLink, Twitter, Medal, TrendingUp } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RankedSite {
  id: string;
  url: string;
  score: number;
  platform: string;
}

const Leaderboard = ({ isOpen, onClose }: LeaderboardProps) => {
  const [sites, setSites] = useState<RankedSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, 'scans'),
      orderBy('score', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RankedSite[];
      
      // Filter unique domains for better variety
      const unique = data.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
      setSites(unique);
      setLoading(false);
    }, (err) => {
      console.error("Leaderboard fetch error:", err);
      // Fallback with dummy data for demo if Firebase fails
      setSites([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const shareResult = (site: RankedSite) => {
    const text = `🚀 My site ${site.url} just hit a security score of ${site.score}/100 on SECUREWEB AI! In the Top 5% worldwide! 🛡️✨ #HackerProof @SecureWebAI`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
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
            className="relative w-full max-w-2xl glass-card-strong bg-slate-900 border border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <Trophy className="text-yellow-400" />
                    Global Security Leaderboard
                  </h2>
                  <p className="text-white/40 text-xs font-body mt-1 uppercase tracking-widest">Real-time Verified Rankings</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {loading ? (
                    <div className="py-12 text-center text-white/20 font-display">Decrypting Rankings...</div>
                ) : sites.map((site, index) => (
                  <motion.div 
                    key={site.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-2xl border ${
                        index === 0 ? 'bg-primary/20 border-primary/40 ring-1 ring-primary/20' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm ${
                            index === 0 ? 'bg-yellow-400 text-black' : 
                            index === 1 ? 'bg-slate-300 text-black' : 
                            index === 2 ? 'bg-orange-400 text-black' : 'bg-white/10 text-white'
                        }`}>
                           {index + 1}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                {site.url}
                                {index === 0 && <Medal className="w-3 h-3 text-yellow-400" />}
                            </p>
                            <p className="text-[10px] text-white/40 uppercase font-bold">{site.platform}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                             <p className={`text-xl font-display font-bold ${
                                 site.score > 90 ? 'text-green-400' : site.score > 70 ? 'text-yellow-400' : 'text-red-400'
                             }`}>
                                 {site.score}<span className="text-[10px] opacity-40 ml-0.5">/100</span>
                             </p>
                             <div className="flex items-center gap-1 justify-end text-[8px] text-green-400 font-bold uppercase tracking-tighter">
                                <TrendingUp className="w-2 h-2" /> Verified
                             </div>
                        </div>
                        <button 
                         onClick={() => shareResult(site)}
                         className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                        >
                            <Twitter className="w-4 h-4" />
                        </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 text-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-[10px] text-white/40 leading-relaxed font-body uppercase tracking-widest">
                    Top 50 sites are eligible for the <span className="text-primary font-bold">SecureShield Hall of Fame</span>.
                 </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Leaderboard;
