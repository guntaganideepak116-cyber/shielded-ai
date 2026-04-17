
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

export default function Analytics() {
  const [data, setData] = useState({
    growth: [],
    conversion: [
      { name: 'Free', value: 0 },
      { name: 'Pro', value: 0 }
    ],
    usage: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const free = usersSnap.docs.filter(d => d.data().plan !== 'pro').length;
      const pro = usersSnap.docs.filter(d => d.data().plan === 'pro').length;

      // Mock growth curve based on real user count
      const total = usersSnap.size;
      const growth = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        growth.push({
          date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          users: Math.round(total * (1 - (i * 0.05))) // Synthetic growth based on current total
        });
      }

      setData({
        growth,
        conversion: [
          { name: 'FREE NODES', value: free, color: 'var(--admin-text-muted)' },
          { name: 'PRO NODES', value: pro, color: 'var(--admin-green)' }
        ]
      });
    };
    fetchData();
  }, []);

  return (
    <div className="admin-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--admin-text-primary)', fontSize: 24, fontFamily: 'Space Mono, monospace', margin: '0 0 8px' }}>
          Platform Analytics
        </h1>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: 14, margin: 0 }}>
           Macro-level data on user acquisition and retention
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* User Growth */}
        <div className="admin-card">
           <div style={{ color: 'var(--admin-text-muted)', fontSize: 11, letterSpacing: 1, fontFamily: 'Space Mono, monospace', marginBottom: 24 }}>
             ACQUISITION TRAJECTORY (30D)
           </div>
           <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)', fontSize: 12 }} />
                <Area type="monotone" dataKey="users" stroke="var(--admin-cyan)" strokeWidth={2} fill="rgba(0, 212, 255, 0.1)" />
              </AreaChart>
           </ResponsiveContainer>
        </div>

        {/* Tier Distribution */}
        <div className="admin-card">
          <div style={{ color: 'var(--admin-text-muted)', fontSize: 11, letterSpacing: 1, fontFamily: 'Space Mono, monospace', marginBottom: 24 }}>
             TIER CONVERSION RATIO
          </div>
          <div style={{ display: 'flex', height: '300px', alignItems: 'center', justifyContent: 'center' }}>
             {data.conversion.map(tier => (
               <div key={tier.name} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: tier.color, fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>
                    {tier.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', letterSpacing: 1 }}>{tier.name}</div>
                  <div style={{ 
                    marginTop: 16, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, margin: '0 40px'
                  }}>
                    <div style={{ 
                      width: `${(tier.value / (data.conversion[0].value + data.conversion[1].value)) * 100}%`,
                      height: '100%', background: tier.color, borderRadius: 2
                    }} />
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
