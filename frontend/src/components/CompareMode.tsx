import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Shield, ShieldAlert, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { callSecurityScan } from '@/lib/api-client';
import ScoreDisplay from '@/components/ScoreDisplay';
import { toast } from 'react-hot-toast';
import { type ScanResult } from '@/lib/scan-data';

const CompareMode = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [results, setResults] = useState<{ res1: ScanResult; res2: ScanResult } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!url1 || !url2) {
      toast.error("Please enter both URLs");
      return;
    }
    
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        callSecurityScan(url1),
        callSecurityScan(url2)
      ]);
      
      if (!r1 || !r2) throw new Error("One or both scans failed");
      
      setResults({ res1: r1, res2: r2 });
    } catch (e) {
      toast.error("Comparison failed. Check URLs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-5xl glass-card border-white/5 bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-12">
                <div>
                   <h2 className="text-3xl font-display font-black tracking-tight uppercase mb-2">Security Battleground</h2>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Side-by-side site comparison</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!results ? (
                <div className="flex flex-col md:flex-row items-center gap-8 justify-center py-10">
                   <div className="space-y-4 w-full max-w-sm">
                      <p className="text-[10px] font-bold text-primary uppercase text-center">Primary Target</p>
                      <Input 
                        placeholder="google.com" 
                        value={url1} onChange={(e) => setUrl1(e.target.value)}
                        className="h-14 bg-slate-950 border-white/10 text-center text-lg font-bold"
                      />
                   </div>
                   
                   <div className="text-2xl font-black text-slate-700 italic">VS</div>

                   <div className="space-y-4 w-full max-w-sm">
                      <p className="text-[10px] font-bold text-purple-500 uppercase text-center">Competitor / Peer</p>
                      <Input 
                        placeholder="example.com" 
                        value={url2} onChange={(e) => setUrl2(e.target.value)}
                        className="h-14 bg-slate-950 border-white/10 text-center text-lg font-bold"
                      />
                   </div>
                   
                   <Button onClick={handleCompare} disabled={loading} size="lg" className="h-14 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-widest">
                      {loading ? 'Analyzing...' : 'START BATTLE'}
                   </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-12">
                   {[results.res1, results.res2].map((res, i) => (
                      <div key={i} className={`p-8 rounded-3xl border transition-all ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-purple-500/5 border-purple-500/20'}`}>
                         <div className="text-center space-y-6">
                            <h3 className="text-xl font-black truncate">{res.url}</h3>
                            <div className="flex justify-center">
                               <ScoreDisplay score={res.score} />
                            </div>
                            <div className="space-y-3 pt-6">
                               <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                  <span className="text-[10px] font-bold uppercase text-slate-500">SSL Status</span>
                                  <span className={res.ssl?.valid ? 'text-success' : 'text-destructive'}>
                                     {res.ssl?.valid ? 'SECURE ✓' : 'VULNERABLE ✗'}
                                  </span>
                               </div>
                               <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                  <span className="text-[10px] font-bold uppercase text-slate-500">Issues Found</span>
                                  <span className="font-bold">{res.vulnerabilities?.length || 0}</span>
                               </div>
                               <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                  <span className="text-[10px] font-bold uppercase text-slate-500">Reputation</span>
                                  <span className={res.virusTotal?.malicious === 0 ? 'text-success' : 'text-destructive'}>
                                     {res.virusTotal?.malicious === 0 ? 'CLEAN' : 'MALICIOUS'}
                                  </span>
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              )}
            </div>
            
            {results && (
               <div className="p-8 bg-slate-950/50 flex justify-center border-t border-white/5">
                  <Button onClick={() => setResults(null)} variant="ghost" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                     Reset Comparison
                  </Button>
               </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CompareMode;
