
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

// ─── HARDCODED ADMIN EMAIL ─────────────────────────
const ADMIN_EMAILS = ['guntaganideepak1234@gmail.com'];
// ──────────────────────────────────────────────────

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      if (user.isAnonymous || !ADMIN_EMAILS.includes(user.email || '')) {
        // Not admin → send to homepage silently
        navigate('/', { replace: true });
        return;
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#020409',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ fontSize: 32 }}>🛡️</div>
        <div style={{
          color: '#00d4ff',
          fontFamily: 'Space Mono, monospace',
          fontSize: 13,
          letterSpacing: 2
        }}>
          VERIFYING ADMIN ACCESS...
        </div>
      </div>
    );
  }

  // If we are not loading and have an admin user, show the children
  if (user && !user.isAnonymous && ADMIN_EMAILS.includes(user.email || '')) {
    return children;
  }

  return null;
}
