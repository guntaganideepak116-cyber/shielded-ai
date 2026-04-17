
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, orderBy,
  onSnapshot, getDocs, where
} from 'firebase/firestore';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedUser, setExpandedUser] = useState(null);
  const [userScans, setUserScans] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      async (snap) => {
        const userList = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        // Fetch aggregate scan data to enrich user list
        const scansSnap = await getDocs(collection(db, 'scans'));
        const scansByUser = {};
        const scoresByUser = {};

        scansSnap.docs.forEach(d => {
          const data = d.data();
          const userId = data.userId;
          if (!userId) return;
          scansByUser[userId] = (scansByUser[userId] || 0) + 1;
          if (!scoresByUser[userId]) scoresByUser[userId] = [];
          scoresByUser[userId].push(data.score || 0);
        });

        const enriched = userList.map(u => ({
          ...u,
          scanCount: scansByUser[u.id] || 0,
          avgScore: scoresByUser[u.id]?.length
            ? Math.round(
                scoresByUser[u.id].reduce((a,b) => a+b,0) /
                scoresByUser[u.id].length
              )
            : 0,
          riskLevel: (() => {
            const avg = scoresByUser[u.id]?.length
              ? scoresByUser[u.id].reduce((a,b) => a+b,0) / scoresByUser[u.id].length
              : 100;
            return avg < 40 ? 'high' : avg < 70 ? 'medium' : 'low';
          })()
        }));

        setUsers(enriched);
        setLoading(false);
      }
    );

    return () => unsubUsers();
  }, []);

  const displayUsers = users.filter(u => {
    const matchSearch = !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ||
      u.riskLevel === filter ||
      u.plan === filter;
    return matchSearch && matchFilter;
  });

  const loadUserScans = async (userId) => {
    if (userScans[userId]) return;
    const q = query(
      collection(db, 'scans'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    setUserScans(prev => ({
      ...prev,
      [userId]: snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }));
  };

  return (
    <div className="admin-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          color: 'var(--admin-text-primary)',
          fontSize: 22,
          fontFamily: 'Space Mono, monospace',
          margin: '0 0 6px'
        }}>
          User Intelligence Hub
        </h1>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: 14, margin: 0 }}>
          Manage {users.length} active platform users
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap'
      }}>
        <input
          className="admin-input"
          style={{
             background: 'var(--admin-bg-card)',
             border: '1px solid var(--admin-border)',
             borderRadius: '8px',
             padding: '10px 14px',
             color: 'white',
             fontSize: '14px',
             width: '300px'
          }}
          placeholder="Search by email or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <div style={{
          display: 'flex',
          gap: 4,
          background: 'var(--admin-bg-secondary)',
          padding: 4,
          borderRadius: 10,
          border: '1px solid var(--admin-border)'
        }}>
          {['all','high','medium','low','free','pro'].map(f => (
            <button
              key={f}
              className={`admin-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: 7,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
                color: filter === f ? 'var(--admin-cyan)' : 'var(--admin-text-muted)',
                background: filter === f ? 'var(--admin-bg-card)' : 'transparent',
                border: 'none',
                fontFamily: 'DM Sans, sans-serif'
              }}
            >
              {f === 'high' ? '🔴 Risk: High'
                : f === 'medium' ? '🟡 Medium'
                : f === 'low' ? '🟢 Low'
                : f === 'free' ? 'Free'
                : f === 'pro' ? 'Pro'
                : 'All Users'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>USER ENTITY</th>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>SCANS</th>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>AVG SCORE</th>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>PLAN</th>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>RISK PROFILE</th>
              <th style={{ padding: '12px 28px', textAlign: 'left', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>JOINED</th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.map((user) => (
              <React.Fragment key={user.id}>
                <tr
                  style={{ 
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(26, 34, 52, 0.4)',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => {
                    setExpandedUser(expandedUser === user.id ? null : user.id);
                    if (expandedUser !== user.id) loadUserScans(user.id);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--admin-cyan), var(--admin-violet))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: 14
                      }}>
                        {(user.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: 'var(--admin-text-primary)', fontSize: 13, fontWeight: 600 }}>
                          {user.name || 'Anonymous User'}
                        </div>
                        <div style={{ color: 'var(--admin-text-muted)', fontSize: 11 }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 28px', fontFamily: 'Space Mono, monospace', color: 'var(--admin-cyan)' }}>
                    {user.scanCount}
                  </td>
                  <td style={{ padding: '16px 28px' }}>
                    <span style={{
                      fontFamily: 'Space Mono, monospace',
                      color: user.avgScore >= 70 ? 'var(--admin-green)'
                        : user.avgScore >= 50 ? 'var(--admin-yellow)' : 'var(--admin-red)',
                      fontWeight: 700
                    }}>
                      {user.avgScore}/100
                    </span>
                  </td>
                  <td style={{ padding: '16px 28px' }}>
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: 'Space Mono, monospace',
                        background: user.plan === 'pro' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: user.plan === 'pro' ? 'var(--admin-green)' : 'var(--admin-text-muted)',
                        border: `1px solid ${user.plan === 'pro' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                    }}>
                      {user.plan?.toUpperCase() || 'FREE'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 28px' }}>
                    <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontFamily: 'Space Mono, monospace',
                        background: user.riskLevel === 'high' ? 'rgba(255, 51, 102, 0.1)' : 
                                    user.riskLevel === 'medium' ? 'rgba(255, 170, 0, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                        color: user.riskLevel === 'high' ? 'var(--admin-red)' : 
                               user.riskLevel === 'medium' ? 'var(--admin-yellow)' : 'var(--admin-green)',
                        border: `1px solid ${user.riskLevel === 'high' ? 'rgba(255, 51, 102, 0.3)' : 
                                               user.riskLevel === 'medium' ? 'rgba(255, 170, 0, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`
                    }}>
                      {user.riskLevel === 'high' ? '🚨 CRITICAL'
                        : user.riskLevel === 'medium' ? '⚠️ WARNING'
                        : '✅ SECURE'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 28px', color: 'var(--admin-text-muted)', fontSize: 12 }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>

                {/* Expanded user details */}
                {expandedUser === user.id && (
                  <tr>
                    <td colSpan={6} style={{ 
                        padding: '24px 28px', 
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderBottom: '1px solid var(--admin-border)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ color: 'var(--admin-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace', letterSpacing: 1 }}>
                          RECENT AUDITS FOR {user.email}
                        </div>
                        <button
                          className="btn-ghost"
                          style={{ fontSize: 11, color: 'var(--admin-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}
                          onClick={() => window.location.href = `/admin/messages?email=${user.email}`}
                        >
                          Send Direct Transmission 📧
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(userScans[user.id] || []).length > 0 ? (userScans[user.id] || []).map((scan, i) => (
                            <div key={i} style={{
                            display: 'flex',
                            gap: 16,
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            fontSize: 12
                            }}>
                            <span style={{
                                color: 'var(--admin-cyan)',
                                fontFamily: 'Space Mono, monospace',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {scan.url}
                            </span>
                            <span style={{
                                color: (scan.score||0) >= 80 ? 'var(--admin-green)'
                                : (scan.score||0) >= 50 ? 'var(--admin-yellow)' : 'var(--admin-red)',
                                fontWeight: 700,
                                fontFamily: 'Space Mono, monospace'
                            }}>
                                {scan.score}/100
                            </span>
                            <span style={{ color: 'var(--admin-text-muted)', fontSize: 11 }}>
                                {scan.createdAt?.toDate
                                ? scan.createdAt.toDate().toLocaleDateString()
                                : new Date(scan.createdAt).toLocaleDateString()}
                            </span>
                            </div>
                        )) : (
                            <div style={{ color: 'var(--admin-text-muted)', fontSize: 12, padding: '20px', textAlign: 'center' }}>
                                No audit history found for this user entity.
                            </div>
                        )}
                        {!userScans[user.id] && (
                            <div style={{ color: 'var(--admin-cyan)', fontSize: 11, textAlign: 'center', padding: '10px' }}>
                                FETCHING DECRYPTED DATA...
                            </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
