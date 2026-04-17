
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

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
        // Track newly added docs
        const added = snap.docChanges()
          .filter(c => c.type === 'added')
          .map(c => c.doc.id);
          
        if (added.length) {
          setNewIds(prev => new Set([...prev, ...added]));
          
          // Desktop notifications for critical events
          snap.docChanges().forEach(c => {
            if (c.type === 'added') {
              const d = c.doc.data();
              if ((d.score || 0) < 30 || d.isVTMalicious) {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('🚨 Critical Scan Alert!', {
                    body: `${d.url} — Score: ${d.score}/100`,
                    icon: '/icon-192.png'
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
    <div className="admin-fade-in">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div>
          <h1 style={{
            color: 'var(--admin-text-primary)',
            fontSize: 22,
            fontFamily: 'Space Mono, monospace',
            margin: '0 0 6px'
          }}>
            Live Scan Feed
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span className="live-dot" />
            <span style={{
              color: 'var(--admin-green)',
              fontSize: 12,
              fontFamily: 'Space Mono, monospace'
            }}>
              REAL-TIME — {filtered.length} active sessions
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: 4, 
          background: 'var(--admin-bg-secondary)', 
          padding: 4, 
          borderRadius: 10,
          border: '1px solid var(--admin-border)'
        }}>
          {['all','critical','malicious','today'].map(f => (
            <button
              key={f}
              className={`admin-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: 7,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s',
                color: filter === f ? 'var(--admin-cyan)' : 'var(--admin-text-muted)',
                background: filter === f ? 'var(--admin-bg-card)' : 'transparent',
                border: 'none',
                fontFamily: 'DM Sans, sans-serif'
              }}
            >
              {f === 'all' ? 'All' : f === 'critical' ? '🚨 Critical'
                : f === 'malicious' ? '🦠 Malicious' : '📅 Today'}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((scan) => {
          const score = scan.score || 0;
          const isNew = newIds.has(scan.id);
          const isCritical = score < 30 || scan.isVTMalicious;
          const borderColor = isCritical ? 'var(--admin-red)'
            : score >= 80 ? 'var(--admin-green)' : score >= 50 ? 'var(--admin-yellow)' : 'var(--admin-red)';

          return (
            <div
              key={scan.id}
              className={`admin-card ${isCritical ? 'critical-card' : ''}`}
              style={{
                borderColor,
                borderLeft: `4px solid ${borderColor}`,
                padding: '16px 20px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: isNew ? 'slideInTop 0.4s ease forwards' : 'none',
                background: isCritical ? 'rgba(255, 51, 102, 0.03)' : 'var(--admin-bg-card)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 12
              }}>
                {/* Left info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: 'var(--admin-cyan)',
                    fontSize: 14,
                    fontFamily: 'Space Mono, monospace',
                    marginBottom: 6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {scan.url}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: borderColor,
                      fontWeight: 700,
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 15
                    }}>
                      {score}/100
                    </span>

                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'Space Mono, monospace',
                      background: scan.status === 'secure' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 51, 102, 0.1)',
                      color: scan.status === 'secure' ? 'var(--admin-green)' : 'var(--admin-red)',
                    }}>
                      {scan.status?.toUpperCase() || 'SCANNING'}
                    </span>

                    {scan.isVTMalicious && (
                      <span style={{
                        padding: '2px 8px',
                        background: 'rgba(220, 38, 38, 0.15)',
                        color: 'var(--admin-red)',
                        borderRadius: '4px',
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: 'Space Mono, monospace'
                      }}>🦠 MALICIOUS</span>
                    )}

                    <span style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>
                      User: {scan.userEmail || 'Anonymous'}
                    </span>

                    <span style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>
                      {scan.createdAt?.toDate
                        ? scan.createdAt.toDate().toLocaleTimeString()
                        : new Date(scan.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {scan.userEmail && (
                    <button
                      className="btn-ghost"
                      style={{ 
                        fontSize: 12, 
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--admin-text-muted)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        window.location.href = `/admin/messages?user=${scan.userEmail}&url=${scan.url}`;
                      }}
                    >
                      📧 Alert User
                    </button>
                  )}
                  <button
                    className="btn-ghost"
                    style={{ 
                        fontSize: 12, 
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--admin-text-muted)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                    onClick={() => window.open(`/admin/users?email=${scan.userEmail}`, '_blank')}
                  >
                    👁️ View User
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--admin-text-muted)',
            fontFamily: 'DM Sans, sans-serif',
            background: 'var(--admin-bg-secondary)',
            borderRadius: '12px',
            border: '1px dashed var(--admin-border)'
          }}>
            No live scan activity matching current filters.
          </div>
        )}
      </div>
    </div>
  );
}
