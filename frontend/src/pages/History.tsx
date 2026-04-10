import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Clock, Trash2, ArrowLeft, ExternalLink, Sparkles, Globe, 
  AlertTriangle, CheckCircle2, Activity, Search, Filter, 
  ChevronDown, ArrowUpRight, FileText, ChevronRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getHistory, clearHistory } from '@/lib/scan-history';
import { fetchUserHistory } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { getGrade, getGradeColor, type Vulnerability, type ScanResult } from '@/lib/scan-data';
import { toast } from 'react-hot-toast';
import { LogoRenderer } from '@/components/LogoRenderer';
import { useLanguage } from '@/context/LanguageContext';

interface ScanItem extends Partial<ScanResult> {
  id: string;
  url: string;
  score: number;
  grade: string;
  vulnerabilities: Vulnerability[];
}

const History = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'secure' | 'vulnerable' | 'moderate'>('all');
  const [sort, setSort] = useState<'latest' | 'oldest' | 'score-high' | 'score-low'>('latest');
  const [isPurging, setIsPurging] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  useEffect(() => {
    const loadScans = async () => {
      setLoading(true);
      try {
        const dbScans = await fetchUserHistory();
        const mapped = (dbScans || []).map((s: ScanResult) => ({
          ...s,
          id: s.id || Math.random().toString(),
          vulnerabilities: s.vulnerabilities || s.issues || [],
          score: s.score || 0,
          grade: getGrade(s.score || 0)
        }));
        setScans(mapped);
      } catch (err) {
        console.error("History Fetch Error:", err);
        // LocalStorage fallback
        const local = getHistory();
        setScans(local.map(s => ({
          ...s, id: s.id, url: s.url, score: s.score, grade: getGrade(s.score),
          vulnerabilities: s.vulnerabilities, timestamp: s.timestamp
        })));
      } finally {
        setLoading(false);
      }
    };
    loadScans();
  }, []);

  const filteredScans = useMemo(() => {
    let result = scans.filter(s => s.url.toLowerCase().includes(search.trim().toLowerCase()));
    
    if (filter === 'secure') result = result.filter(s => s.score >= 80);
    else if (filter === 'moderate') result = result.filter(s => s.score >= 50 && s.score < 80);
    else if (filter === 'vulnerable') result = result.filter(s => s.score < 50);

    result.sort((a, b) => {
      const timeA = new Date(a.created_at || a.timestamp || 0).getTime();
      const timeB = new Date(b.created_at || b.timestamp || 0).getTime();
      if (sort === 'latest') return timeB - timeA;
      if (sort === 'oldest') return timeA - timeB;
      if (sort === 'score-high') return b.score - a.score;
      if (sort === 'score-low') return a.score - b.score;
      return 0;
    });

    return result;
  }, [scans, search, filter, sort]);

  const handlePurge = async () => {
    setIsPurging(true);
    try {
      // In a real app, delete from Firestore
      const response = await fetch('/api/history', { method: 'DELETE' });
      if (response.ok) {
         setScans([]);
         clearHistory();
         toast.success("Audit records purged from secure storage ✓");
         setShowPurgeConfirm(false);
      }
    } catch (err) {
      toast.error("Decryption required for purge. Access denied.");
    } finally {
      setIsPurging(false);
    }
  };

  const formatDate = (ts: string | number | Date | null | undefined) => {
    if (!ts) return 'Unknown Date';
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-body pb-20">

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="space-y-12">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl">
                       <Clock className="w-8 h-8 text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                    </div>
                    <div className="space-y-1">
                       <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter leading-none">Security Archive</h1>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Operational Audit Logs: {scans.length} Tracked</p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               onClick={() => setShowPurgeConfirm(true)}
               className="h-12 bg-white/5 border-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-widest px-6 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
             >
                <Trash2 className="w-4 h-4 mr-2" /> {t('hist.purge')}
             </Button>
          </div>
           </div>

           {/* Toolbar */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-3xl border border-white/5">
              <div className="md:col-span-2 relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <Input 
                   placeholder="SEARCH AUDIT URL..." 
                   value={search} onChange={e => setSearch(e.target.value)}
                   className="pl-12 h-14 bg-slate-950 border-white/5 text-[10px] font-black uppercase tracking-widest rounded-2xl focus:border-primary/50 transition-all"
                 />
              </div>
              <div className="relative group">
                 <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary" />
                 <select 
                    value={filter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value as 'all' | 'secure' | 'vulnerable' | 'moderate')}
                    className="w-full h-14 bg-slate-950 border-white/5 pl-12 pr-6 rounded-2xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:border-primary/50 transition-all cursor-pointer"
                 >
                    <option value="all">Level: All</option>
                    <option value="secure">Level: Secure (80+)</option>
                    <option value="moderate">Level: Moderate (50-79)</option>
                    <option value="vulnerable">Level: Critical (0-49)</option>
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              <div className="relative group">
                 <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary" />
                 <select 
                    value={sort} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as 'latest' | 'oldest' | 'score-high' | 'score-low')}
                    className="w-full h-14 bg-slate-950 border-white/5 pl-12 pr-6 rounded-2xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:border-primary/50 transition-all cursor-pointer"
                 >
                    <option value="latest">Sort: Latest</option>
                    <option value="oldest">Sort: Oldest</option>
                    <option value="score-high">Sort: Score (Max)</option>
                    <option value="score-low">Sort: Score (Min)</option>
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
           </div>

           {/* List */}
           <div className="space-y-6">
              {loading ? (
                <div className="py-24 text-center space-y-6">
                   <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading Infrastructure Logs...</p>
                </div>
              ) : filteredScans.length === 0 ? (
                <div className="py-24 text-center glass-card border-white/5 space-y-8 bg-slate-900/30">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <Shield className="w-10 h-10 text-slate-800" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-display font-black uppercase italic">{t('hist.empty')}</h3>
                      <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">Either no scans match your criteria or the database is unpopulated.</p>
                   </div>
                   <Button onClick={() => navigate('/scan')} className="h-14 px-10 rounded-xl bg-primary text-black font-black uppercase text-[10px] tracking-widest pulse-neon">Initiate First Audit</Button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredScans.map((scan, i) => {
                    const color = getGradeColor(scan.score);
                    return (
                      <motion.div 
                        key={scan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className="group glass-card border-white/5 hover:border-primary/20 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group transition-all"
                      >
                         <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-4">
                               <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${color.replace('text-', 'bg-').replace('500', '500/20').replace('success', 'success/20')} transition-colors`}>
                                  <Globe className={`w-6 h-6 ${color}`} />
                               </div>
                               <div className="space-y-1">
                                  <Link to={`/report/${scan.id}`} className="text-xl font-display font-black uppercase italic tracking-tighter hover:text-primary transition-colors flex items-center gap-2 group/url">
                                     {scan.url} <ArrowUpRight className="w-4 h-4 opacity-0 group-hover/url:opacity-100 transition-all text-primary" />
                                  </Link>
                                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                     <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDate(scan.created_at || scan.timestamp)}</span>
                                     <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> ID: {scan.id.slice(0, 8)}</span>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="flex items-center gap-8 w-full md:w-auto">
                            <div className="flex items-center gap-6 bg-slate-950/50 px-6 py-4 rounded-2xl border border-white/5 group-hover:border-primary/10 transition-colors">
                               <div className="text-center space-y-1">
                                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Score</p>
                                  <p className={`text-2xl font-display font-black leading-none ${color}`}>{scan.score}</p>
                               </div>
                               <div className="w-px h-8 bg-white/5" />
                               <div className="text-center space-y-1">
                                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Grade</p>
                                  <p className={`text-xl font-display font-black leading-none ${color}`}>{scan.grade}</p>
                               </div>
                            </div>
                            
                            <div className="flex gap-2">
                               <Button 
                                 onClick={() => navigate(`/report/${scan.id}`)} 
                                 variant="ghost" size="icon" 
                                 className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:border-primary group-hover:text-primary transition-all"
                                 title="View Full Report"
                               >
                                  <FileText className="w-5 h-5" />
                               </Button>
                               <Button 
                                 onClick={() => navigate('/scan', { state: { reScanUrl: scan.url } })} 
                                 variant="ghost" size="icon" 
                                 className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:border-primary group-hover:text-success transition-all"
                                 title="Trigger Re-Scan"
                               >
                                  <RefreshCcw className="w-5 h-5" />
                               </Button>
                            </div>
                         </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
           </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
         {showPurgeConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPurgeConfirm(false)} />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="relative w-full max-w-md glass-card bg-slate-900 border-red-500/20 p-10 text-center space-y-8 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
               >
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                     <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                     <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter">Confirm purging?</h2>
                     <p className="text-sm text-slate-400 font-medium italic">This action will permanently IRRECOVERABLE delete all verified security logs from the primary datastore.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                     <Button onClick={() => setShowPurgeConfirm(false)} variant="ghost" className="h-14 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/5">ABORT_ACTION</Button>
                     <Button 
                        onClick={handlePurge} 
                        disabled={isPurging}
                        className="h-14 bg-red-600 text-white hover:bg-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl"
                     >
                        {isPurging ? <Loader2 className="w-4 h-4 animate-spin" /> : 'EXECUTE_PURGE'}
                     </Button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

const RefreshCcw = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
);

export default History;
