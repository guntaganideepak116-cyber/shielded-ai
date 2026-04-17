
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, orderBy, limit,
  onSnapshot, getDocs
} from 'firebase/firestore';
import {
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { 
  Users, 
  Search, 
  Database, 
  AlertTriangle, 
  ShieldCheck, 
  Mail,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';

export default function Overview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayScans: 0,
    criticalAlerts: 0,
    emailsSent: 0,
    avgScore: 0,
    totalScans: 0
  });
  const [recentScans, setRecentScans] = useState([]);
  const [vulnDistribution, setVulnDistribution] = useState([]);
  const [scanTrend, setScanTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scansQuery = query(
      collection(db, 'scans'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(scansQuery, (snapshot) => {
      const scans = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setRecentScans(scans.slice(0, 10));

      const today = new Date();
      today.setHours(0,0,0,0);
      
      const todayScans = scans.filter(s => {
        const t = s.createdAt?.toDate?.() || new Date(s.createdAt);
        return t >= today;
      });

      const avgScore = scans.length > 0
        ? Math.round(scans.reduce((a,s) => a + (s.score||0), 0) / scans.length)
        : 0;

      const critical = scans.filter(s =>
        (s.score||0) < 30 || s.isVTMalicious
      ).length;

      setStats(prev => ({
        ...prev,
        totalScans: snapshot.size,
        todayScans: todayScans.length,
        criticalAlerts: critical,
        avgScore
      }));

      const vulnCounts = { critical: 0, high: 0, medium: 0, low: 0 };
      scans.forEach(s => {
        (s.vulnerabilities || []).forEach(v => {
          vulnCounts[v.severity] = (vulnCounts[v.severity] || 0) + 1;
        });
      });
      setVulnDistribution([
        { name: 'Critical', value: vulnCounts.critical || 0, color: '#f43f5e' },
        { name: 'High',     value: vulnCounts.high     || 0, color: '#f59e0b' },
        { name: 'Medium',   value: vulnCounts.medium   || 0, color: '#3b82f6' },
        { name: 'Low',      value: vulnCounts.low      || 0, color: '#10b981' },
      ].filter(d => d.value > 0));

      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0,0,0,0);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        const count = scans.filter(s => {
          const t = s.createdAt?.toDate?.() || new Date(s.createdAt);
          return t >= d && t < next;
        }).length;
        days.push({
          day: d.toLocaleDateString('en', { weekday: 'short' }),
          scans: count
        });
      }
      setScanTrend(days);
      setLoading(false);
    });

    const usersQuery = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(usersQuery, (snap) => {
      setStats(prev => ({ ...prev, totalUsers: snap.size }));
    });

    return () => { unsubscribe(); unsubUsers(); };
  }, []);

  const STAT_CARDS = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#3b82f6', sub: 'Nodes Active' },
    { label: 'Today\'s Scans', value: stats.todayScans, icon: Search, color: '#10b981', sub: 'Inbound Requests' },
    { label: 'All-Time Logs', value: stats.totalScans, icon: Database, color: '#8b5cf6', sub: 'Processed Data' },
    { label: 'Critical Threats', value: stats.criticalAlerts, icon: AlertTriangle, color: '#f43f5e', sub: 'Breach Attempts' },
    { label: 'Platform Score', value: `${stats.avgScore}/100`, icon: ShieldCheck, color: '#00f5ff', sub: 'Overall Integrity' },
    { label: 'Alerts Sent', value: stats.emailsSent, icon: Mail, color: '#f59e0b', sub: 'Notification Uplink' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* 📊 KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="admin-card-glass p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12">
                <Icon className="w-16 h-16" style={{ color: card.color }} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5" style={{ background: `${card.color}15` }}>
                   <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{card.label}</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-white text-3xl font-black admin-stat-value">
                  {loading ? '...' : card.value}
                </span>
                <span className="text-[10px] text-slate-500 font-medium mb-1.5 uppercase tracking-tighter">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 📈 ANALYTICS CHART */}
        <div className="xl:col-span-2 admin-card-glass p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[#00f5ff]" />
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">Inbound Traffic Vectors</h3>
            </div>
            <div className="px-3 py-1 bg-[#00f5ff]/10 border border-[#00f5ff]/20 rounded-full text-[#00f5ff] text-[10px] font-bold">
              REAL-TIME SYNC
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scanTrend}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}
                  cursor={{ stroke: '#00f5ff', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="scans" 
                  stroke="#00f5ff" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScans)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🥯 PIE CHART */}
        <div className="admin-card-glass p-10">
          <div className="flex items-center gap-3 mb-10">
            <PieChartIcon className="w-5 h-5 text-[#8b5cf6]" />
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Threat Distribution</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vulnDistribution.length ? vulnDistribution : [{ name: 'Empty', value: 1, color: '#1e293b' }]}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {vulnDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-3">
             {vulnDistribution.map((d, i) => (
               <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ background: d.color }} />
                    <span className="text-slate-400 text-xs font-semibold group-hover:text-white transition-colors uppercase tracking-tight">{d.name}</span>
                  </div>
                  <span className="text-white font-mono text-xs font-bold">{d.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* 🛡️ RECENT ACTIVITY FEED */}
      <div className="admin-card-glass overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Activity className="w-5 h-5 text-[#10b981]" />
             <h3 className="text-white font-bold text-sm uppercase tracking-widest">Recent Activity Log</h3>
           </div>
           <button onClick={() => window.location.href = '/admin/live'} className="text-[#00f5ff] text-[10px] font-black uppercase tracking-widest hover:underline px-4">DECRYPT FULL FEED →</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Vector URL</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Integrity</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Protocol</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Operator</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentScans.map((scan, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="text-[#00f5ff] font-mono text-xs font-semibold truncate max-w-xs group-hover:underline cursor-pointer">
                      {scan.url?.replace('https://','').replace('http://','')}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <span className="text-white font-black text-sm tracking-tighter" style={{ color: (scan.score||0) >= 70 ? '#10b981' : (scan.score||0) >= 40 ? '#f59e0b' : '#f43f5e' }}>{scan.score || 0}</span>
                       <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                          <div className="h-full transition-all duration-1000" style={{ width: `${scan.score}%`, background: (scan.score||0) >= 70 ? '#10b981' : (scan.score||0) >= 40 ? '#f59e0b' : '#f43f5e' }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest" 
                      style={{ background: scan.status === 'secure' ? '#10b98115' : '#f43f5e15', color: scan.status === 'secure' ? '#10b981' : '#f43f5e', border: `1px solid ${scan.status === 'secure' ? '#10b98130' : '#f43f5e30'}` }}>
                      {scan.status || 'SCANNED'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-xs font-medium italic">{scan.userEmail || 'GUEST_NODE'}</td>
                  <td className="px-8 py-5 text-slate-400 font-mono text-[11px] font-bold">
                    {scan.createdAt?.toDate ? scan.createdAt.toDate().toLocaleTimeString() : 'RECENT'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
