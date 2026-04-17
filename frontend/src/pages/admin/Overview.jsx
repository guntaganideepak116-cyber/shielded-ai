
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, orderBy, limit,
  onSnapshot, where, Timestamp
} from 'firebase/firestore';
import {
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from 'recharts';

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
    // Real-time listener for ALL scans
    // Note: If you have a 'globalScans' or 'scans' collection, we use that
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

      // Calculate stats
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
        totalScans: snapshot.size, // This is just the limit, real production would use a counter or separate kpi doc
        todayScans: todayScans.length,
        criticalAlerts: critical,
        avgScore
      }));

      // Vulnerability distribution
      const vulnCounts = { critical: 0, high: 0, medium: 0, low: 0 };
      scans.forEach(s => {
        (s.vulnerabilities || []).forEach(v => {
          vulnCount[v.severity] = (vulnCounts[v.severity] || 0) + 1;
        });
      });
      setVulnDistribution([
        { name: 'Critical', value: vulnCounts.critical || 0, color: '#ef4444' },
        { name: 'High',     value: vulnCounts.high     || 0, color: '#ff3366' },
        { name: 'Medium',   value: vulnCounts.medium   || 0, color: '#ffaa00' },
        { name: 'Low',      value: vulnCounts.low      || 0, color: '#8892a4' },
      ]);

      // Scan trend (last 7 days)
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

    // Users count
    const usersQuery = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(usersQuery, (snap) => {
      setStats(prev => ({ ...prev, totalUsers: snap.size }));
    });

    return () => { unsubscribe(); unsubUsers(); };
  }, []);

  const STAT_CARDS = [
    {
      label: 'TOTAL USERS',
      value: stats.totalUsers,
      icon: '👥',
      color: 'var(--admin-cyan)',
      sub: 'Registered accounts'
    },
    {
      label: 'TODAY\'S SCANS',
      value: stats.todayScans,
      icon: '🔍',
      color: 'var(--admin-green)',
      sub: 'Scans performed today'
    },
    {
      label: 'TOTAL SCANS',
      value: stats.totalScans,
      icon: '📊',
      color: 'var(--admin-violet)',
      sub: 'Recent data'
    },
    {
      label: 'CRITICAL ALERTS',
      value: stats.criticalAlerts,
      icon: '🚨',
      color: 'var(--admin-red)',
      sub: 'Score < 30 or malicious'
    },
    {
      label: 'AVG SCORE',
      value: `${stats.avgScore}/100`,
      icon: '📈',
      color: stats.avgScore >= 70 ? 'var(--admin-green)'
        : stats.avgScore >= 50 ? 'var(--admin-yellow)' : 'var(--admin-red)',
      sub: 'Platform average'
    },
    {
      label: 'EMAILS SENT',
      value: stats.emailsSent,
      icon: '📧',
      color: 'var(--admin-orange)',
      sub: 'All time'
    },
  ];

  return (
    <div className="admin-fade-in">
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          color: 'var(--admin-text-primary)',
          fontSize: 24,
          fontFamily: 'Space Mono, monospace',
          margin: 0,
          marginBottom: 6
        }}>
          Platform Overview
        </h1>
        <p style={{
          color: 'var(--admin-text-muted)',
          fontSize: 14,
          margin: 0,
          fontFamily: 'DM Sans, sans-serif'
        }}>
          Real-time intelligence across all users and scans
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        {STAT_CARDS.map((card, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ 
              background: 'var(--admin-bg-card)',
              border: '1px solid var(--admin-border)',
              borderRadius: '12px',
              padding: '20px 24px',
              position: 'relative',
              overflow: 'hidden',
              '--accent-color': card.color 
            }}
          >
             <div style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '3px', height: '100%',
              background: card.color
            }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16
            }}>
              <span style={{
                color: 'var(--admin-text-muted)',
                fontSize: 11,
                fontFamily: 'Space Mono, monospace',
                letterSpacing: 1
              }}>
                {card.label}
              </span>
              <span style={{ fontSize: 20 }}>{card.icon}</span>
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 700,
              color: card.color,
              fontFamily: 'Space Mono, monospace',
              marginBottom: 6
            }}>
              {loading ? '—' : card.value}
            </div>
            <div style={{
              color: 'var(--admin-text-muted)',
              fontSize: 12,
              fontFamily: 'DM Sans, sans-serif'
            }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: 20,
        marginBottom: 28
      }}>
        {/* Scan Trend */}
        <div className="admin-card">
          <div style={{
            color: 'var(--admin-text-muted)',
            fontSize: 11,
            letterSpacing: 1,
            fontFamily: 'Space Mono, monospace',
            marginBottom: 20
          }}>
            SCAN VOLUME — LAST 7 DAYS
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={scanTrend}>
              <defs>
                <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--admin-cyan)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--admin-cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--admin-bg-card)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 8,
                  color: 'var(--admin-text-primary)',
                  fontSize: 12
                }}
              />
              <Area
                type="monotone"
                dataKey="scans"
                stroke="var(--admin-cyan)"
                strokeWidth={2}
                fill="url(#scanGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vulnerability Distribution */}
        <div className="admin-card">
          <div style={{
            color: 'var(--admin-text-muted)',
            fontSize: 11,
            letterSpacing: 1,
            fontFamily: 'Space Mono, monospace',
            marginBottom: 20
          }}>
            VULNERABILITY DISTRIBUTION
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={vulnDistribution.length ? vulnDistribution : [{name: 'None', value: 1, color: '#1a2234'}]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                dataKey="value"
                strokeWidth={0}
              >
                {vulnDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--admin-bg-card)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 8,
                  fontSize: 12
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 16px',
            marginTop: 16,
            justifyContent: 'center'
          }}>
            {vulnDistribution.map((d, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: d.color
                }} />
                <span style={{
                  color: 'var(--admin-text-muted)',
                  fontSize: 11,
                  fontFamily: 'DM Sans, sans-serif'
                }}>
                  {d.name.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Scans Feed */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 28px 20px'
        }}>
          <div style={{
            color: 'var(--admin-text-muted)',
            fontSize: 11,
            letterSpacing: 1,
            fontFamily: 'Space Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span className="live-dot" />
            RECENT SCAN ACTIVITY
          </div>
          <a href="/admin/live" style={{
            color: 'var(--admin-cyan)',
            fontSize: 12,
            textDecoration: 'none',
            fontFamily: 'DM Sans, sans-serif'
          }}>
            View all →
          </a>
        </div>

        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>URL</th>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>SCORE</th>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>STATUS</th>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>USER</th>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>TIME</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.map((scan, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(26,34,52,0.5)' }}>
                <td style={{ padding: '16px 28px', maxWidth: 220 }}>
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--admin-cyan)',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: 12
                  }}>
                    {scan.url?.replace('https://','').replace('http://','')}
                  </div>
                </td>
                <td style={{ padding: '16px 28px' }}>
                  <span style={{
                    fontWeight: 700,
                    fontFamily: 'Space Mono, monospace',
                    color: (scan.score||0) >= 80 ? 'var(--admin-green)'
                      : (scan.score||0) >= 50 ? 'var(--admin-yellow)' : 'var(--admin-red)'
                  }}>
                    {scan.score || 0}
                  </span>
                </td>
                <td style={{ padding: '16px 28px' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontFamily: 'Space Mono, monospace',
                      background: scan.status === 'secure' ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,102,0.1)',
                      color: scan.status === 'secure' ? 'var(--admin-green)' : 'var(--admin-red)',
                      border: `1px solid ${scan.status === 'secure' ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,102,0.3)'}`
                    }}
                  >
                    {scan.status || 'scanned'}
                  </span>
                </td>
                <td style={{
                  padding: '16px 28px',
                  color: 'var(--admin-text-muted)',
                  fontSize: 12,
                  maxWidth: 180,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {scan.userEmail || 'Anonymous'}
                </td>
                <td style={{ padding: '16px 28px', color: 'var(--admin-text-muted)', fontSize: 12 }}>
                  {scan.createdAt?.toDate
                     ? scan.createdAt.toDate().toLocaleTimeString()
                     : new Date(scan.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
            {recentScans.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  No recent scans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
