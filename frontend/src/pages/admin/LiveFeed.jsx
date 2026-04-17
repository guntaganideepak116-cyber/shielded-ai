
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  Activity, 
  Search, 
  MapPin, 
  Clock, 
  User, 
  ShieldAlert, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  Filter
} from 'lucide-react';

export default function LiveFeed() {
  const [scans, setScans] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newIds, setNewIds] = useState(new Set());

  useEffect(() => {
    const q = query(
      collection(db, 'scans'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    let first = true;
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (!first) {
        const added = snap.docChanges()
          .filter(c => c.type === 'added')
          .map(c => c.doc.id);
          
        if (added.length) {
          setNewIds(prev => new Set([...prev, ...added]));
          
          snap.docChanges().forEach(c => {
            if (c.type === 'added') {
              const d = c.doc.data();
              if ((d.score || 0) < 30 || d.isVTMalicious) {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('🚨 Critical Threat Detected', {
                    body: `Source: ${d.url}\nIntegrity Score: ${d.score}/100`,
                    icon: '/favicon.ico'
                  });
                }
              }
            }
          });
        }
      }
      first = false;
      setScans(list);
    });

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => unsub();
  }, []);

  const filtered = scans.filter(s => {
    if (filter === 'critical') return (s.score || 0) < 30 || s.isVTMalicious;
    if (filter === 'malicious') return s.isVTMalicious;
    if (filter === 'today') {
      const t = s.createdAt?.toDate?.() || new Date(s.createdAt);
      const today = new Date(); today.setHours(0,0,0,0);
      return t >= today;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 📡 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-[#00f5ff]" />
            <h1 className="text-white text-2xl font-black tracking-tight uppercase">Live Global Uplink</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="admin-dot-live" />
            <span className="text-[#10b981] text-xs font-bold uppercase tracking-[0.2em]">Situational Awareness Active</span>
            <span className="text-slate-500 text-[10px] font-mono">— {filtered.length} NODES TRACKED</span>
          </div>
        </div>

        {/* 🎚️ FILTERS */}
        <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
          {[
            { id: 'all',       label: 'All Activity', icon: Activity },
            { id: 'critical',  label: 'Critical',     icon: ShieldAlert },
            { id: 'malicious', label: 'Malicious',    icon: ShieldAlert },
            { id: 'today',     label: 'Today',        icon: Clock },
          ].map(f => {
            const Icon = f.icon;
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  isActive ? 'bg-[#00f5ff] text-black shadow-[0_0_20px_rgba(0,245,255,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-500'}`} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🚀 ACTIVITY STREAM */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((scan) => {
          const score = scan.score || 0;
          const isNew = newIds.has(scan.id);
          const isCritical = score < 30 || scan.isVTMalicious;
          const statusColor = isCritical ? '#f43f5e' : score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e';

          return (
            <div
              key={scan.id}
              className={`admin-card-glass group relative p-6 transition-all duration-500 ${isNew ? 'ring-2 ring-[#00f5ff] ring-inset' : ''} ${isCritical ? 'bg-red-500/[0.03]' : ''}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* 🛡️ VECTOR INFO */}
                <div className="flex-1 min-w-0 flex items-start gap-5">
                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 transition-transform group-hover:scale-110" style={{ background: `${statusColor}15` }}>
                      {isCritical ? <ShieldAlert className="w-6 h-6" style={{ color: statusColor }} /> : <ShieldCheck className="w-6 h-6" style={{ color: statusColor }} />}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[#00f5ff] font-mono text-sm font-bold truncate max-w-md">{scan.url}</span>
                        <a href={scan.url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-[#00f5ff] transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                         <div className="flex items-center gap-2">
                            <span className="text-white font-black text-lg tracking-tighter" style={{ color: statusColor }}>{score}/100</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Integrity Index</span>
                         </div>

                         <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-lg border border-white/5">
                            <User className="w-3 h-3 text-slate-500" />
                            <span className="text-slate-400 text-[11px] font-medium italic">{scan.userEmail || 'GUEST_NODE'}</span>
                         </div>

                         <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                            <Clock className="w-3 h-3" />
                            {scan.createdAt?.toDate ? scan.createdAt.toDate().toLocaleTimeString() : 'UPLINKED'}
                         </div>

                         {scan.isVTMalicious && (
                            <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
                               <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.2em]">Positve VT Hit 🦠</span>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* ⚡ ACTIONS */}
                <div className="flex items-center gap-3 shrink-0">
                  {scan.userEmail && (
                    <button
                      onClick={() => window.location.href = `/admin/messages?user=${scan.userEmail}&url=${scan.url}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-[#00f5ff]/10 border border-white/10 hover:border-[#00f5ff]/30 text-slate-400 hover:text-[#00f5ff] rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Dispatch Alert
                    </button>
                  )}
                  <button
                    onClick={() => window.location.href = `/admin/users?email=${scan.userEmail}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
                  >
                    Investigate Node
                  </button>
                </div>
              </div>

              {/* ✨ GLOW EFFECT FOR NEW ITEMS */}
              {isNew && (
                <div className="absolute inset-0 bg-[#00f5ff]/5 pointer-events-none animate-pulse rounded-2xl" />
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="admin-card-glass p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No Vectors Intercepted</h3>
            <p className="text-slate-500 max-w-sm text-sm">Targeted nodes are currently secure or no activity matches your decryption filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
