import { useState, useEffect } from 'react';

const PWAInstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed check
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check dismissed
    if (localStorage.getItem('pwa-banner-dismissed')) return;

    // Check if prompt already fired
    if ((window as any).deferredInstallPrompt) {
      setShowBanner(true);
    }

    // Listen for future prompt
    const handleReady = () => setShowBanner(true);
    window.addEventListener('pwaInstallReady', handleReady);

    // Also listen for appinstalled
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setIsInstalled(true);
    });

    return () => {
      window.removeEventListener('pwaInstallReady', handleReady);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = (window as any).deferredInstallPrompt;
    if (!prompt) {
      // Fallback: show instructions
      alert(
        'To install:\n' +
        'Chrome: Tap ⋮ menu → "Add to Home Screen"\n' +
        'Safari: Tap Share → "Add to Home Screen"'
      );
      return;
    }
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    (window as any).deferredInstallPrompt = null;
    setShowBanner(false);
    if (outcome === 'accepted') setIsInstalled(true);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner || isInstalled || window.innerWidth > 768) return null;

  return (
    <>
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9998,
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)'
        }}
      />

      <div style={{
        position: 'fixed',
        top: '12px',
        left: '12px',
        right: '12px',
        zIndex: 9999,
        background: '#0d1424',
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        border: '1px solid rgba(0,212,255,0.2)',
        animation: 'pwaSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg,#1e293b,#0f172a)',
          border: '1px solid rgba(0,212,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0
        }}>
          🛡️
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: '#f8fafc',
            fontWeight: '700',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            marginBottom: '2px'
          }}>
            SecureWeb AI
          </div>
          <div style={{
            color: '#94a3b8',
            fontSize: '11px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            secureweb-ai.vercel.app
          </div>
        </div>

        <button
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg,#00d4ff,#7c3aed)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: '800',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,212,255,0.2)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Install
        </button>

        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#64748b',
            fontSize: '18px',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            lineHeight: '1'
          }}
        >
          &times;
        </button>
      </div>

      <style>{`
        @keyframes pwaSlideDown {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default PWAInstallBanner;
