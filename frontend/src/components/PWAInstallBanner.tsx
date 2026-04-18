import { useState, useEffect, useCallback } from 'react';

const DISMISS_KEY = 'pwa:dismissed';
const INSTALL_KEY = 'pwa:installed';

export default function PWAInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Never show if already installed or dismissed
    if (
      localStorage.getItem(INSTALL_KEY) === '1' ||
      localStorage.getItem(DISMISS_KEY) === '1' ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window.navigator as any).standalone;
    const show = () => setVisible(true);

    // If iOS or we already have the prompt, show after delay
    if (isIOS || (window as any).deferredInstallPrompt) {
      setTimeout(show, 3000);
    }

    // Backup: Show after 8 seconds anyway if not dismissed, to capture "shy" browsers
    const backupTimer = setTimeout(show, 8000);

    const handlePrompt = (e: Event) => {
      // e.preventDefault(); // Handled by index.html or Navbar
      (window as any).deferredInstallPrompt = e;
      setTimeout(show, 2500);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('pwa:ready', show);
    window.addEventListener('pwa:installed', () => setVisible(false));

    return () => {
      clearTimeout(backupTimer);
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('pwa:ready', show);
    };
  }, []);

  // DISMISS — works on mobile and desktop
  const dismiss = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  }, []);

  const install = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const prompt = (window as any).deferredInstallPrompt;

    if (!prompt) {
      // iOS Safari fallback
      alert(
        'Install SecureWeb AI:\n\n' +
        'iPhone/iPad: Tap Share → Add to Home Screen\n' +
        'Android: Tap ⋮ → Add to Home Screen'
      );
      dismiss();
      return;
    }

    setInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      (window as any).deferredInstallPrompt = null;
      if (outcome === 'accepted') {
        localStorage.setItem(INSTALL_KEY, '1');
        window.dispatchEvent(new Event('appinstalled'));
      }
      setVisible(false);
    } catch {
      setInstalling(false);
    }
  }, [dismiss]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop — clicking dismisses */}
      <div
        onClick={() => dismiss()}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2,4,9,0.65)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 99990,
        }}
      />

      {/* Banner */}
      <div
        role="dialog"
        aria-label="Install SecureWeb AI"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          right: 12,
          zIndex: 99999,
          background: '#0d1424',
          borderRadius: 16,
          padding: '14px 14px 14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,212,255,0.15)',
          animation: 'pwaIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <style>{`
          @keyframes pwaIn {
            from { opacity:0; transform:translateY(-24px) scale(0.95); }
            to   { opacity:1; transform:translateY(0)     scale(1);    }
          }
        `}</style>

        {/* Icon */}
        <div style={{
          width: 50, height: 50, borderRadius: 13,
          background: 'linear-gradient(135deg,#0a0f1e,#1a2234)',
          border: '1px solid rgba(0,212,255,0.2)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 26, flexShrink: 0,
        }}>
          🛡️
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: '#f0f4ff', fontWeight: 700,
            fontSize: 15, fontFamily: 'Arial,sans-serif',
            whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis', marginBottom: 2,
          }}>
            SecureWeb AI
          </div>
          <div style={{
            color: '#8892a4', fontSize: 12,
            fontFamily: 'Arial,sans-serif',
            whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            secureweb-ai.vercel.app
          </div>
        </div>

        {/* Install */}
        <button
          onClick={install}
          disabled={installing}
          style={{
            background: installing
              ? '#1a2234'
              : 'linear-gradient(135deg,#00d4ff,#7c3aed)',
            color: '#fff', border: 'none',
            borderRadius: 10, padding: '9px 18px',
            fontSize: 14, fontWeight: 700,
            fontFamily: 'Arial,sans-serif',
            cursor: installing ? 'wait' : 'pointer',
            flexShrink: 0, whiteSpace: 'nowrap',
            minHeight: 40,
            boxShadow: installing ? 'none'
              : '0 4px 12px rgba(0,212,255,0.3)',
          }}
        >
          {installing ? '…' : 'Install'}
        </button>

        {/* CLOSE X — fixed to actually work */}
        <button
          onClick={() => dismiss()}
          aria-label="Dismiss install banner"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#8892a4',
            fontSize: 20, lineHeight: 1,
            cursor: 'pointer',
            width: 36, height: 36,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 0,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          ×
        </button>
      </div>
    </>
  );
}
