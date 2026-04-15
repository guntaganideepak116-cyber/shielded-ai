import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Shield, AlertTriangle, Activity, Globe, ArrowUp, ArrowDown, Search,
  TrendingUp, ShieldCheck, Clock
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { type ScanResult, getGrade, getGradeColor } from '@/lib/scan-data';
import ScoreDisplay from '@/components/ScoreDisplay';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogoRenderer } from '@/components/LogoRenderer';
import { useLanguage } from '@/context/LanguageContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    avgScore: 0,
    secureCount: 0,
    vulnerableCount: 0,
    scoreTrend: [] as { date: string; score: number }[],
    vulnBreakdown: [] as { name: string; value: number; color: string }[],
    commonVulns: [] as { name: string; count: number }[],
    recentActivity: [] as ScanResult[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scansRef = collection(db, 'scans');
        const q = query(scansRef, orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ScanResult[];

        if (data.length === 0) {
           setLoading(false);
           return;
        }

        // Calculate Stats
        const total = data.length;
        const totalScore = data.reduce((acc, curr: ScanResult) => acc + (curr.score || 0), 0);
        const avg = Math.round(totalScore / total);
        const secure = data.filter((s: ScanResult) => s.score >= 90).length;
        const vulnerable = total - secure;

        // Breakdown
        const breakdown = [
          { name: 'Secure', value: secure, color: '#22c55e' },
          { name: 'Vulnerable', value: vulnerable, color: '#ef4444' }
        ];

        // Trend (Simulated trend based on fetched data chunks)
        const trend = data.slice(0, 7).reverse().map((s) => {
          let dateStr = 'N/A';
          if (s.createdAt && typeof s.createdAt === 'object' && 'toDate' in s.createdAt) {
             dateStr = (s.createdAt as any).toDate().toLocaleDateString();
          } else if (s.createdAt && typeof s.createdAt === 'string') {
             dateStr = new Date(s.createdAt).toLocaleDateString();
          }
          return { date: dateStr, score: s.score };
        });

        // Common Vulns count
        const vulnCounts: Record<string, number> = {};
        data.forEach((s: ScanResult) => {
           (s.vulnerabilities || []).forEach((v) => {
              const name = v.title || v.issue;
              vulnCounts[name] = (vulnCounts[name] || 0) + 1;
           });
        });

        const common = Object.entries(vulnCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalScans: total,
          avgScore: avg,
          secureCount: secure,
          vulnerableCount: vulnerable,
          scoreTrend: trend,
          vulnBreakdown: breakdown,
          commonVulns: common,
          recentActivity: data.slice(0, 10)
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
     <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-primary animate-pulse font-display font-bold tracking-widest uppercase">
           Syncing Security Data...
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body page-wrapper pt-12 md:pt-20">

      {/* Row 1: Metrics */}
      <div className="dashboard-stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: t('dash.total_scans'), value: stats.totalScans, icon: Search, color: 'text-primary' },
          { label: t('dash.avg_score'), value: `${stats.avgScore}/100`, icon: Shield, color: 'text-success' },
          { label: t('common.secure'), value: stats.secureCount, icon: ShieldCheck, color: 'text-green-400' },
          { label: t('common.vulnerable'), value: stats.vulnerableCount, icon: AlertTriangle, color: 'text-destructive' }
        ].map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={card.label} className="glass-card p-6 border-white/5 space-y-2 relative group overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-3xl font-display font-black tracking-tight">{card.value}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
               <ArrowUp className="w-3 h-3 text-success" />
               <span>+12% vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card p-6 border-white/5 h-[400px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-primary" /> Security Health Trend
          </h3>
          <ResponsiveContainer width="100%" height="80%">
             <LineChart data={stats.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 8 }} />
             </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 border-white/5 h-[400px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
             <Globe className="w-4 h-4 text-primary" /> Site Breakdown
          </h3>
          <div className="h-64 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.vulnBreakdown} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {stats.vulnBreakdown.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black">{stats.secureCount}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Secure</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
             <div className="text-center">
                <p className="text-xs font-bold text-success capitalize">Secure</p>
                <p className="text-lg font-black">{Math.round((stats.secureCount / stats.totalScans) * 100)}%</p>
             </div>
             <div className="text-center">
                <p className="text-xs font-bold text-destructive capitalize">At Risk</p>
                <p className="text-lg font-black">{Math.round((stats.vulnerableCount / stats.totalScans) * 100)}%</p>
             </div>
          </div>
        </div>
      </div>

      {/* Row 3: Common Vulns & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-white/5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Top Recurring Vulnerabilities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.commonVulns} layout="vertical" margin={{ left: 40 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
               <XAxis type="number" hide />
               <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={120} />
               <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
               <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 border-white/5 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Security Activity</h3>
             <Button variant="link" onClick={() => navigate('/history')} className="text-[10px] uppercase font-black tracking-widest">View History</Button>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((scan: ScanResult) => (
              <div key={scan.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4 overflow-hidden">
                   <div className={`p-2 rounded-lg ${scan.score >= 90 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      <Globe className="w-5 h-5" />
                   </div>
                    <div className="flex flex-col min-w-0">
                       <span className="text-xs font-bold text-slate-200 truncate">{scan.url}</span>
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                         {scan.createdAt && typeof scan.createdAt === 'object' && 'toDate' in scan.createdAt 
                           ? (scan.createdAt as any).toDate().toLocaleDateString() 
                           : typeof scan.createdAt === 'string' 
                           ? new Date(scan.createdAt).toLocaleDateString() 
                           : 'Just now'}
                       </span>
                    </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black tracking-tighter">{scan.score}/100</p>
                   <p className={`text-[10px] font-bold uppercase tracking-widest ${scan.score >= 90 ? 'text-success' : 'text-destructive'}`}>
                      {scan.status}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
