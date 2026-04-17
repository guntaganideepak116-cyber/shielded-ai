
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { path: '/admin',              icon: '📊', label: 'Overview'          },
  { path: '/admin/live',         icon: '📡', label: 'Live Feed'         },
  { path: '/admin/users',        icon: '👥', label: 'Users'             },
  { path: '/admin/messages',     icon: '📢', label: 'Messages'          },
  { path: '/admin/vulnerabilities',icon:'🦠',label: 'Vulnerability Intel'},
  { path: '/admin/analytics',    icon: '📈', label: 'Analytics'         },
  { path: '/admin/settings',     icon: '⚙️', label: 'Settings'          },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-bg admin-layout" style={{ display: 'flex' }}>
      {/* SIDEBAR */}
      <aside className="admin-sidebar" style={{
        width: '240px',
        minHeight: '100vh',
        background: 'var(--admin-bg-secondary)',
        borderRight: '1px solid var(--admin-border)',
        position: 'fixed',
        top: 0, left: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}>

        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--admin-border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8
          }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <span style={{
              color: '#f0f4ff',
              fontWeight: 700,
              fontSize: 15,
              fontFamily: 'Space Mono, monospace',
              letterSpacing: 0.5
            }}>
              SECUREWEB AI
            </span>
          </div>
          <span style={{
            background: 'var(--admin-danger)',
            color: 'white',
            padding: '3px 10px',
            borderRadius: '4px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '1px',
            fontFamily: 'Space Mono, monospace'
          }}>ADMIN PANEL</span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Admin user info at bottom */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--admin-border)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{
            color: 'var(--admin-text-muted)',
            fontSize: 11,
            letterSpacing: 1,
            marginBottom: 6,
            fontFamily: 'Space Mono, monospace'
          }}>
            LOGGED IN AS
          </div>
          <div style={{
            color: 'var(--admin-text-primary)',
            fontSize: 12,
            fontFamily: 'DM Sans, sans-serif',
            marginBottom: 10,
            wordBreak: 'break-all'
          }}>
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="btn-ghost"
            style={{ 
              width: '100%', 
              fontSize: 12,
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--admin-text-muted)',
              border: '1px solid var(--admin-border)',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-main" style={{ 
        flex: 1, 
        marginLeft: '240px',
        minHeight: '100vh',
        background: 'var(--admin-bg-primary)'
      }}>

        {/* TOP BAR */}
        <header className="admin-topbar" style={{
          height: '60px',
          background: 'var(--admin-bg-secondary)',
          borderBottom: '1px solid var(--admin-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{
            color: 'var(--admin-text-muted)',
            fontSize: 13,
            fontFamily: 'Space Mono, monospace',
            letterSpacing: 0.5
          }}>
            {NAV_ITEMS.find(n => n.path === (location.pathname === '/admin' ? '/admin' : location.pathname))?.label || 'Admin'}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            {/* Live clock */}
            <div style={{
              color: 'var(--admin-cyan)',
              fontSize: 12,
              fontFamily: 'Space Mono, monospace'
            }}>
              {time.toLocaleTimeString()}
            </div>

            {/* Live indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,255,136,0.08)',
              border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: 20,
              padding: '4px 12px'
            }}>
              <span className="live-dot" />
              <span style={{
                color: 'var(--admin-green)',
                fontSize: 11,
                fontFamily: 'Space Mono, monospace',
                letterSpacing: 1
              }}>
                LIVE
              </span>
            </div>

            {/* Link to main site */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
              style={{ 
                fontSize: 12, 
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--admin-text-muted)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              View Site ↗
            </a>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: '28px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
