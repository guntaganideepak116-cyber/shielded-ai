import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, ShieldAlert, Calendar, AlertTriangle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { fortifySecurity } from '@/lib/api-client';

interface FutureRiskScanProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  currentScore: number;
}

const FutureRiskScan = ({ isOpen, onClose, domain, currentScore }: FutureRiskScanProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Generate dynamic decay data based on the current score
  const decayRate = currentScore > 90 ? 3 : currentScore > 70 ? 5 : 8;
  const data = [
    { name: 'Now', score: currentScore },
    { name: '1 mo', score: Math.max(0, currentScore - decayRate) },
    { name: '3 mo', score: Math.max(0, currentScore - (decayRate * 2.5)) },
    { name: '6 mo', score: Math.max(0, currentScore - (decayRate * 4.5)) },
    { name: '12 mo', score: Math.max(0, currentScore - (decayRate * 8)) },
  ];

  const predictedScore = data[4].score;
  const scoreDrop = currentScore - predictedScore;

  const cves = currentScore < 90 ? [
    { id: 'CVE-2026-1234', severity: 'High', title: 'WordPress Plugin RCE' },
    { id: 'CVE-2025-9988', severity: 'Medium', title: 'OpenSSL Information Leak' },
  ] : [
    { id: 'SEC-2027-001', severity: 'Low', title: 'Potential Script Injection' },
  ];

  const handleFortify = async () => {
    if (!user) {
      toast.error("Please login to activate permanent protection.");
      return;
    }

    setLoading(true);
    const success = await fortifySecurity(user.uid, domain);
    
    if (success) {
      toast.success("Safezone Activated!", {
        description: `Permanent fortress parameters pushed for ${domain}.`
      });
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1500);
    } else {
      toast.error("Fortification Failed", {
        description: "Could not establish connection to edge nodes."
      });
      setLoading(false);
    }
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
            className="relative w-full max-w-4xl glass-card-strong bg-slate-900 border border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
                    <TrendingDown className={scoreDrop > 30 ? "text-red-400" : "text-orange-400"} />
                    Future Risk Analysis Pro
                  </h2>
                  <p className="text-white/60 font-body">Predictive security entropy for <span className="text-primary font-mono">{domain}</span></p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Graph Section */}
                <div className="lg:col-span-3">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-display font-bold uppercase tracking-widest text-white/40">Score Decay Timeline</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-mono ${scoreDrop > 30 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          -{scoreDrop} pts predicted
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorScore)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk Insights */}
                <div className="lg:col-span-2 space-y-4">
                   <div className={`glass-card-strong border-white/10 p-5 rounded-2xl ${predictedScore < 50 ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                      <div className={`flex items-center gap-3 mb-2 ${predictedScore < 50 ? 'text-red-400' : 'text-orange-400'}`}>
                        <ShieldAlert className="w-5 h-5" />
                        <span className="font-bold text-sm">Predictive Insight</span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">
                        Expected score <span className={`font-bold ${predictedScore < 50 ? 'text-red-400' : 'text-orange-400'}`}>{predictedScore}/100</span> in 12 months due to security entropy and threat landscape shifts.
                      </p>
                   </div>

                   <div className="space-y-3">
                      <p className="text-xs font-display font-bold text-white/40 uppercase tracking-widest">Upcoming Vulnerabilities</p>
                      {cves.map(cve => (
                        <div key={cve.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <AlertTriangle className={`w-4 h-4 ${cve.severity === 'High' ? 'text-red-400' : 'text-orange-400'}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">{cve.id}</p>
                                    <p className="text-[10px] text-white/40">{cve.title}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${cve.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                {cve.severity}
                            </span>
                        </div>
                      ))}
                   </div>

                   <button 
                     onClick={handleFortify}
                     disabled={loading}
                     className="w-full py-4 bg-primary rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          Fortify Permanent Safezone
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                   </button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-8">
                  <div className="text-center">
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">SSL Health</p>
                      <p className="text-xl font-display font-bold text-green-400">92 Days Left</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">CMS Status</p>
                      <p className={`text-xl font-display font-bold ${currentScore > 80 ? 'text-green-400' : 'text-orange-400'}`}>
                        {currentScore > 80 ? 'v6.6 (Latest)' : 'v6.4 LTS'}
                      </p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Auto-Fix Engine</p>
                      <p className="text-xl font-display font-bold text-primary">{loading ? 'Running...' : 'Standby'}</p>
                  </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FutureRiskScan;
