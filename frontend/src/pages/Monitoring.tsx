import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Shield, Activity, Clock, Trash2, 
  Power, ExternalLink, ShieldCheck, AlertCircle,
  TrendingUp, History as HistoryIcon, Check, Loader2, BarChart3,
  ArrowUpRight, ArrowDownRight, LayoutGrid, FileText, RefreshCw, 
  ChevronRight, ArrowRight, Gauge
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LogoRenderer } from '@/components/LogoRenderer';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { 
  collection, query, orderBy, getDocs, doc, setDoc, 
  updateDoc, deleteDoc, addDoc, serverTimestamp, onSnapshot 
} from 'firebase/firestore';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { callSecurityScan } from '@/lib/api-client';
import { type ScanResult } from '@/lib/scan-data';

const Monitoring = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [monitors, setMonitors] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [expandedSite, setExpandedSite] = useState<string | null>(null);
  const [siteHistory, setSiteHistory] = useState<{ date: string; displayDate: string; score: number; timestamp: number }[]>([]);
  
  // New monitor form
  const [newUrl, setNewUrl] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'monitors', user.uid, 'sites'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ScanResult[];
        setMonitors(data);
        setLoading(false);
    }, (err) => {
        console.error("Monitor Fetch Error:", err);
        toast.error("Failed to sync monitors");
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddMonitor = async () => {
    if (!newUrl || !user) return;
    
    // Simple URL validation
    let finalUrl = newUrl.trim();
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;

    try {
      setLoading(true);
      const siteId = btoa(finalUrl).substring(0, 20).replace(/[^a-zA-Z0-9]/g, '');
      const siteRef = doc(db, 'monitors', user.uid, 'sites', siteId);
      
      const newMonitor = {
        url: finalUrl,
        email: newEmail,
        enabled: true,
        lastScore: 0,
        lastChecked: null,
        createdAt: serverTimestamp(),
        checkInterval: 'daily',
        uptime: 99.9, // Mock default
        previousScore: 0
      };

      await setDoc(siteRef, newMonitor);
      setShowAddModal(false);
      setNewUrl('');
      toast.success("Monitoring activated! Running first scan...");

      // Run initial scan
      await runImmediateScan(siteId, finalUrl);
    } catch (e) {
      toast.error("Failed to add monitor");
    } finally {
      setLoading(false);
    }
  };

  const runImmediateScan = async (siteId: string, url: string) => {
    if (!user) return;
    setScanningId(siteId);
    try {
      const result = await callSecurityScan(url);
      if (result) {
        // Update Firestore
        const siteRef = doc(db, 'monitors', user.uid, 'sites', siteId);
        const currentSite = monitors.find(m => m.id === siteId);
        
        await updateDoc(siteRef, {
          previousScore: currentSite?.lastScore || 0,
          lastScore: result.score,
          lastChecked: serverTimestamp()
        });

        // Add to history subcollection
        const historyRef = collection(db, 'monitors', user.uid, 'sites', siteId, 'history');
        await addDoc(historyRef, {
          score: result.score,
          timestamp: serverTimestamp()
        });

        toast.success(`Scan complete! Score: ${result.score}`);
      }
    } catch (e) {
      toast.error("Scan failed for monitored site");
    } finally {
      setScanningId(null);
    }
  };

  const toggleEnable = async (site: ScanResult) => {
    if (!user) return;
    try {
      const siteRef = doc(db, 'monitors', user.uid, 'sites', site.id);
      await updateDoc(siteRef, { enabled: !site.enabled });
      toast.success(site.enabled ? "Monitor Paused" : "Monitor Resumed");
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const loadHistory = async (siteId: string) => {
    if (!user) return;
    try {
      const hRef = collection(db, 'monitors', user.uid, 'sites', siteId, 'history');
      const q = query(hRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => {
         const d = doc.data();
         const date = d.timestamp?.toDate ? d.timestamp.toDate() : new Date();
         return {
            date: date.toLocaleDateString(),
            displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: d.score,
            timestamp: date.getTime()
         }
      });
      // Sort by timestamp just in case
      const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
      // Only keep last 7 days (or items)
      setSiteHistory(sortedHistory.slice(-7));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (siteId: string) => {
    if (!user || !window.confirm("Remove this site from monitoring?")) return;
    try {
      await deleteDoc(doc(db, 'monitors', user.uid, 'sites', siteId));
      toast.success("Monitor removed");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const getStatusBadge = (score: number) => {
    if (!score && score !== 0) return <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-bold">PENDING</span>;
    if (score >= 90) return <span className="bg-success/20 text-success px-2 py-0.5 rounded-full text-[9px] font-bold border border-success/30">SECURE</span>;
    if (score >= 70) return <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-[9px] font-bold border border-yellow-500/30">VULNERABLE</span>;
    return <span className="bg-destructive/20 text-destructive px-2 py-0.5 rounded-full text-[9px] font-bold border border-destructive/30">ALERT</span>;
  };

  // Stats calculations
  const totalSites = monitors.length;
  const allSecureCount = monitors.filter(m => m.lastScore >= 90).length;
  const averageScore = monitors.length > 0 
    ? Math.round(monitors.reduce((acc, m) => acc + (m.lastScore || 0), 0) / monitors.length) 
    : 0;
  const alertsToday = monitors.length > 0 ? 3 : 0; // Mocked for demonstration

  // Mock alerts data
  const recentAlerts = [
    { id: 1, site: 'secure-web.ai', type: 'improved', description: 'Security score improved by 12 points after header optimization', date: '2 hours ago' },
    { id: 2, site: 'banking-portal.com', type: 'dropped', description: 'SSL certificate expiring in less than 48 hours', date: '5 hours ago' },
    { id: 3, site: 'demo-store.io', type: 'dropped', description: 'New critical XSS vulnerability detected in login module', date: 'Yesterday' },
    { id: 4, site: 'api.nexus-cloud.net', type: 'improved', description: 'DDoS protection successfully mitigated a burst attempt', date: '2 days ago' },
    { id: 5, site: 'staging-env-04.dev', type: 'dropped', description: 'Average response time increased to > 1.2s (Threshold exceeded)', date: '3 days ago' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body pb-20">

      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-12 pt-12 md:pt-20">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">{t('mon.title')}</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{t('mon.status')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Monitored Sites', value: totalSites, icon: LayoutGrid, color: 'text-primary' },
            { label: 'All Secure Count', value: allSecureCount, icon: ShieldCheck, color: 'text-success' },
            { label: 'Alerts Today', value: alertsToday, icon: AlertCircle, color: 'text-destructive' },
            { label: 'Average Score', value: `${averageScore}%`, icon: Gauge, color: 'text-secondary' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase">
                  <span>Live</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-display font-black tracking-tight">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Monitors List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4" /> Asset Guard List
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success" /> Active</span>
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-700" /> Paused</span>
            </div>
          </div>

          <div className="grid gap-4">
            <AnimatePresence>
              {monitors.map((site, i) => {
                const scoreDiff = (site.lastScore || 0) - (site.previousScore || 0);
                const trend = scoreDiff >= 0 ? 'up' : 'down';
                
                return (
                  <motion.div 
                    key={site.id} 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`glass-card border-white/5 transition-all overflow-hidden ${expandedSite === site.id ? 'border-primary/30 ring-1 ring-primary/20' : 'hover:border-white/10'}`}
                  >
                    <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${site.enabled ? (site.lastScore >= 90 ? 'bg-success/10 text-success' : site.lastScore >= 70 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-destructive/10 text-destructive') : 'bg-slate-800 text-slate-500'}`}>
                           {site.enabled ? (scanningId === site.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />) : <Power className="w-6 h-6" />}
                        </div>
                        <div className="overflow-hidden flex-1">
                           <div className="flex items-center gap-3 mb-1.5">
                              <h3 className="text-xl font-display font-black tracking-tight truncate">{site.url}</h3>
                              <a href={site.url} target="_blank" rel="noopener" className="text-slate-500 hover:text-white transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
                           </div>
                           <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                              <div className="flex items-center gap-1.5 py-0.5 px-2 bg-white/5 rounded-full border border-white/5">
                                 {trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-success" /> : <ArrowDownRight className="w-3 h-3 text-destructive" />}
                                 <span className="text-[10px] font-black text-slate-400">Score: <span className="text-white">{site.lastScore || '---'}</span></span>
                                 {site.previousScore !== undefined && scoreDiff !== 0 && (
                                   <span className={`text-[9px] font-black ${scoreDiff > 0 ? 'text-success' : 'text-destructive'}`}>
                                      {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                                   </span>
                                 )}
                              </div>
                              <div className="flex items-center gap-1.5 py-0.5 px-2 bg-white/5 rounded-full border border-white/5">
                                 <Clock className="w-3 h-3 text-slate-500" />
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Next Scan: <span className="text-white">~14h</span></span>
                              </div>
                              <div className="flex items-center gap-1.5 py-0.5 px-2 bg-white/5 rounded-full border border-white/5">
                                 <Activity className="w-3 h-3 text-primary" />
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Uptime: <span className="text-white">{site.uptime || 99.9}%</span></span>
                              </div>
                              {getStatusBadge(site.lastScore)}
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                        <Button 
                          onClick={() => {
                            if (expandedSite === site.id) setExpandedSite(null);
                            else {
                                setExpandedSite(site.id);
                                loadHistory(site.id);
                            }
                          }}
                          className={`h-11 px-4 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest gap-2 transition-all ${expandedSite === site.id ? 'bg-primary/20 text-primary border-primary/30' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:border-white/10'}`}
                        >
                          <BarChart3 className="w-4 h-4" /> Report
                        </Button>
                        <Button 
                          disabled={scanningId === site.id || !site.enabled}
                          onClick={() => runImmediateScan(site.id, site.url)}
                          className="h-11 px-4 rounded-xl border border-white/5 bg-slate-900/50 text-slate-400 hover:text-success hover:border-success/30 text-[10px] font-black uppercase tracking-widest gap-2 transition-all disabled:opacity-50"
                        >
                          {scanningId === site.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Re-Scan
                        </Button>
                        <Button 
                          onClick={() => toggleEnable(site)}
                          className={`h-11 px-4 rounded-xl border border-white/5 bg-slate-900/50 text-[10px] font-black uppercase tracking-widest gap-2 transition-all ${site.enabled ? 'text-primary hover:border-primary/30' : 'text-slate-600 hover:text-slate-400'}`}
                        >
                          <Power className="w-4 h-4" /> {site.enabled ? 'Disable' : 'Enable'}
                        </Button>
                        <Button 
                          onClick={() => handleDelete(site.id)}
                          className="h-11 px-4 rounded-xl border border-white/5 bg-slate-900/50 text-slate-600 hover:text-destructive hover:border-destructive/30 text-[10px] font-black uppercase tracking-widest gap-2 transition-all"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                      </div>
                    </div>

                    {/* History Chart */}
                    <AnimatePresence>
                      {expandedSite === site.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5 bg-slate-950/50 overflow-hidden"
                        >
                           <div className="p-8 space-y-8">
                              <div className="flex items-center justify-between">
                                 <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                       <HistoryIcon className="w-3.5 h-3.5" /> Site Performance History
                                    </h4>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase">Showing last 7 security snapshots</p>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> <span className="text-[9px] font-bold text-slate-500 tracking-wider">HEALTH SCORE</span></div>
                                 </div>
                              </div>
                              
                              <div className="h-64 w-full">
                                 <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={siteHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                       <defs>
                                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                          </linearGradient>
                                       </defs>
                                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                       <XAxis 
                                          dataKey="displayDate" 
                                          axisLine={false} 
                                          tickLine={false} 
                                          tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                                          dy={10}
                                       />
                                       <YAxis 
                                          domain={[0, 100]} 
                                          ticks={[0, 25, 50, 75, 100]}
                                          axisLine={false} 
                                          tickLine={false}
                                          tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                                       />
                                       <Tooltip 
                                          contentStyle={{ background: '#0a0a0b', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                                          itemStyle={{ color: '#6366f1', fontWeight: 'black' }}
                                       />
                                       <Area 
                                          type="monotone" 
                                          dataKey="score" 
                                          stroke={siteHistory[siteHistory.length - 1]?.score > 80 ? '#22c55e' : siteHistory[siteHistory.length - 1]?.score < 50 ? '#ef4444' : '#6366f1'} 
                                          strokeWidth={3} 
                                          fillOpacity={1} 
                                          fill="url(#colorScore)" 
                                          animationDuration={1500}
                                       />
                                    </AreaChart>
                                 </ResponsiveContainer>
                              </div>
                              {siteHistory.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                   <BarChart3 className="w-8 h-8 mb-3 text-slate-700" />
                                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Insufficient historical data for visual analysis</p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 {[
                                   { label: 'Highest Score', value: Math.max(...siteHistory.map(h => h.score), 0), sub: 'L30D Peak' },
                                   { label: 'Lowest Score', value: Math.min(...siteHistory.map(h => h.score), 100), sub: 'L30D Valley' },
                                   { label: 'Avg Latency', value: '342ms', sub: 'Global Average' },
                                   { label: 'Last Threat', value: 'None', sub: 'Detected' },
                                 ].map((item, idx) => (
                                   <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                                      <div className="flex items-baseline gap-2">
                                         <p className="text-xl font-display font-black">{item.value}</p>
                                         <p className="text-[8px] font-bold text-slate-600 uppercase">{item.sub}</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {monitors.length === 0 && !loading && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
                 className="py-32 text-center glass-card border-dashed border-white/10 relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-none" />
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                       <ShieldCheck className="w-10 h-10 text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-display font-black uppercase italic mb-3 tracking-tight">Zero Shielded Assets</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium mb-10 leading-relaxed uppercase tracking-tighter">Your digital infrastructure is currently unmapped. Enable autonomous 24/7 monitoring to prevent data breaches.</p>
                    <Button 
                      onClick={() => setShowAddModal(true)} 
                      className="bg-primary text-black font-black uppercase text-xs tracking-widest h-14 px-10 rounded-2xl shadow-xl hover:scale-105 transition-all"
                    >
                      <Plus className="w-5 h-5 mr-3" /> Secure First Asset
                    </Button>
                  </div>
               </motion.div>
            )}
          </div>
        </div>

        {/* Recent Alerts Section */}
        {monitors.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-white/5">
            <div className="flex items-center justify-between">
               <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Strategic Security Alerts
               </h2>
               <Button variant="link" className="text-[9px] font-black text-primary uppercase tracking-widest p-0 h-auto">View Alert Engine</Button>
            </div>
            
            <div className="space-y-3">
               {recentAlerts.map((alert, i) => (
                 <motion.div 
                   key={alert.id}
                   initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                   className="glass-card p-5 border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors group"
                 >
                    <div className={`p-3 rounded-xl shrink-0 ${alert.type === 'improved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                       {alert.type === 'improved' ? <TrendingUp className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-black tracking-tight text-white group-hover:text-primary transition-colors uppercase">{alert.site}</p>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">{alert.date}</span>
                       </div>
                       <p className="text-xs text-slate-400 font-medium tracking-tight line-clamp-1">{alert.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-primary transition-colors" />
                 </motion.div>
               ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Monitor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
               onClick={() => setShowAddModal(false)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="relative w-full max-w-lg glass-card p-10 bg-slate-900 border-white/10 shadow-2xl overflow-hidden"
             >
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-[80px]" />

                <div className="relative z-10 space-y-8">
                   <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <ShieldCheck className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-display font-black tracking-tighter uppercase italic">Secure New Asset</h2>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Configuring Autonomous Perimeter Guard</p>
                   </div>

                   <div className="space-y-5">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <LayoutGrid className="w-3 h-3" /> Target Domain
                         </label>
                         <Input 
                            placeholder="example.com" 
                            value={newUrl} onChange={e => setNewUrl(e.target.value)}
                            className="h-12 bg-slate-950/50 border-white/10 font-bold text-sm tracking-tight focus:ring-primary/20 focus:border-primary/30"
                         />
                         <p className="text-[9px] text-slate-600 font-bold uppercase">SSL certificates will be auto-validated</p>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <FileText className="w-3 h-3" /> Alert Recipient Email
                         </label>
                         <Input 
                            placeholder="admin@company.com" 
                            value={newEmail} onChange={e => setNewEmail(e.target.value)}
                            className="h-12 bg-slate-950/50 border-white/10 font-bold text-sm tracking-tight focus:ring-primary/20 focus:border-primary/30"
                         />
                      </div>
                   </div>

                   <div className="pt-4 flex flex-col gap-3">
                      <Button 
                        onClick={handleAddMonitor} 
                        disabled={loading || !newUrl}
                        className="h-14 bg-primary text-black font-black uppercase text-xs tracking-widest group rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all"
                      >
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>START MONITORING <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>}
                      </Button>
                      <Button onClick={() => setShowAddModal(false)} variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 h-10 hover:text-white transition-colors">Abort Activation</Button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Monitoring;
