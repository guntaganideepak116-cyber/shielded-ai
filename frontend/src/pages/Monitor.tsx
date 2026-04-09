import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Shield, Activity, Clock, Trash2, 
  Settings, Power, ExternalLink, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LogoRenderer } from '@/components/LogoRenderer';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

const MonitorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [monitors, setMonitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');

  const fetchMonitors = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/monitor?userId=${user.uid}`);
      const data = await response.json();
      setMonitors(data || []);
    } catch (e) {
      toast.error("Failed to fetch monitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, [user]);

  const handleAddMonitor = async () => {
    if (!newUrl) return;
    if (!user) {
       toast.error("Login required");
       return;
    }
    
    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          url: newUrl,
          email: user.email,
          enabled: true
        })
      });
      
      if (response.ok) {
        toast.success("Security monitor activated!");
        setNewUrl('');
        fetchMonitors();
      }
    } catch (e) {
      toast.error("Addition failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body p-6 lg:p-12">
      <nav className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <LogoRenderer className="w-8 h-8" />
          <span className="font-display font-bold text-xl tracking-tighter uppercase gradient-text">SecureWeb AI</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="text-xs font-bold uppercase tracking-widest border-white/10 hover:bg-white/5">Analytics</Button>
      </nav>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-8 border-white/5 bg-slate-900/50 backdrop-blur-xl">
           <div>
              <h1 className="text-3xl font-display font-black tracking-tight mb-2">CONTINUOUS MONITORING</h1>
              <p className="text-sm text-slate-400 font-medium tracking-wide font-mono uppercase">Guard your digital perimeter 24/7</p>
           </div>
           <div className="flex gap-2">
              <Input 
                placeholder="https://example.com" 
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-slate-950 border-white/10 h-12 w-64 text-sm"
              />
              <Button onClick={handleAddMonitor} className="h-12 px-6 rounded-xl bg-primary text-black font-bold uppercase text-[10px] tracking-widest">
                <Plus className="w-4 h-4 mr-2" /> Add Site
              </Button>
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 <Search className="w-3 h-3" /> Monitored Assets ({monitors.length})
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 Status • Check Interval: Daily
              </div>
           </div>

           <AnimatePresence>
             {monitors.map((site, i) => (
               <motion.div 
                 key={site.id} 
                 initial={{ opacity: 0, x: -20 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 transition={{ delay: i * 0.1 }}
                 className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 glass-card border-white/5 hover:border-primary/20 transition-all gap-6 group"
               >
                 <div className="flex items-center gap-5 overflow-hidden">
                    <div className={`p-4 rounded-2xl ${site.enabled ? 'bg-success/10 text-success' : 'bg-slate-800 text-slate-500'}`}>
                       <Shield className="w-6 h-6" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-black tracking-tight truncate">{site.url}</h3>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-white cursor-pointer" />
                       </div>
                       <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Score: {site.lastScore || '---'}</div>
                          <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Checked: {site.lastChecked ? new Date(site.lastChecked).toLocaleTimeString() : 'Pending'}</div>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="hidden md:flex flex-col items-end mr-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${site.enabled ? 'bg-success/20 text-success' : 'bg-slate-800 text-slate-500'}`}>
                          {site.enabled ? 'ACTIVE_GUARD' : 'PAUSED'}
                       </span>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/scan', { state: { reScanUrl: site.url } })} className="flex-1 md:flex-none h-11 border-white/5 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest px-6 rounded-xl">
                       Scan Now
                    </Button>
                    <Button variant="ghost" className="h-11 w-11 rounded-xl text-slate-500 hover:text-destructive transition-colors">
                       <Trash2 className="w-5 h-5" />
                    </Button>
                 </div>
               </motion.div>
             ))}

             {monitors.length === 0 && !loading && (
                <div className="py-20 text-center glass-card border-dashed border-white/10 opacity-50">
                   <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                   <h4 className="text-lg font-bold">No active monitors detected.</h4>
                   <p className="text-sm">Start by adding a website URL above for 24/7 protection.</p>
                </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MonitorDashboard;
