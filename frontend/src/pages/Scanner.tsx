import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Users, Clock, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveScan } from '@/lib/scan-history';
import { useAuth } from '@/hooks/use-auth';
import { runScan, getGlobalScanCount, subscribeToCounter } from '@/lib/api-helpers';
import { detectPlatform, PLATFORMS, type HostingPlatform } from '@/lib/platform-detection';
import ShieldAnimation from '@/components/ShieldAnimation';
import ScannerInput from '@/components/ScannerInput';
import ScanProgress from '@/components/ScanProgress';
import ScoreDisplay from '@/components/ScoreDisplay';
import VulnerabilityCard from '@/components/VulnerabilityCard';
import FortressModal from '@/components/FortressModal';
import SafetyBar from '@/components/SafetyBar';
import NewbieGuide from '@/components/NewbieGuide';
import SuccessScreen from '@/components/SuccessScreen';
import { Button } from '@/components/ui/button';
import { MOCK_VULNERABILITIES, type Vulnerability } from '@/lib/scan-data';

type Phase = 'landing' | 'scanning' | 'results' | 'rescan' | 'success';

const Scanner = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInAnonymously, signOut } = useAuth();
  const [phase, setPhase] = useState<Phase>('landing');
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(62);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(MOCK_VULNERABILITIES);
  const [globalCount, setGlobalCount] = useState(10247);
  const [detectedPlatform, setDetectedPlatform] = useState<HostingPlatform>('apache');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    getGlobalScanCount().then(setGlobalCount);
    const unsub = subscribeToCounter(setGlobalCount);
    return unsub;
  }, []);

  const startScan = useCallback(async (inputUrl: string) => {
    if (!user) {
      try { await signInAnonymously(); } catch (e) { console.error('Auth error:', e); }
    }
    const platform = detectPlatform(inputUrl);
    setDetectedPlatform(platform);
    setUrl(inputUrl);
    setPhase('scanning');
    setProgress(0);
    setTimeLeft(15);
  }, [user, signInAnonymously]);

  useEffect(() => {
    if (phase !== 'scanning' && phase !== 'rescan') return;
    const isRescan = phase === 'rescan';
    const duration = isRescan ? 3000 : 4000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      setTimeLeft(Math.max(0, Math.ceil((duration - elapsed) / 1000)));

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(async () => {
          try {
            const results = await runScan(url, user?.id);
            setScore(results.score);
            setVulnerabilities(results.vulnerabilities);
            
            saveScan({ 
              id: Date.now().toString(), 
              url, 
              score: results.score, 
              grade: results.grade, 
              hostingType: results.platform, 
              vulnerabilities: results.vulnerabilities, 
              timestamp: new Date() 
            });

            if (results.score >= 80 && isRescan) {
              setPhase('success');
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
              setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 } }), 300);
            } else {
              setPhase('results');
            }
          } catch (error) {
            console.error('Scan API error:', error);
            // Fallback to results if possible or show error
            setPhase('results');
          }
        }, 500);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [phase, url, user, detectedPlatform]);

  const handleFixed = () => {
    setShowModal(false);
    setPhase('rescan');
    setProgress(0);
    setTimeLeft(5);
  };

  const handleScanAnother = () => {
    setPhase('landing');
    setUrl('');
    setScore(62);
    setVulnerabilities(MOCK_VULNERABILITIES);
  };

  const platformInfo = PLATFORMS[detectedPlatform];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(231, 84%, 66%) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(270, 50%, 50%) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg gradient-text">SECURESHIELD AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/history')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-body">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{globalCount.toLocaleString()} secured</span>
            </div>
            {user && !user.is_anonymous && (
              <button onClick={signOut}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors font-body">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </nav>

        <main className="container mx-auto px-4 pb-24">
          <AnimatePresence mode="wait">
            {/* LANDING */}
            {phase === 'landing' && (
              <motion.div key="landing" className="flex flex-col items-center justify-center min-h-[80vh] gap-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
                <ShieldAnimation />
                <div className="text-center max-w-2xl">
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-4">
                    SECURESHIELD AI
                  </h1>
                  <p className="text-lg text-muted-foreground font-body">
                    Find vulnerabilities. Detect platform. Generate exact fixes.
                  </p>
                </div>
                <ScannerInput onScan={startScan} isScanning={false} />

                {/* Platform badges */}
                <motion.div className="flex flex-wrap justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  {(['vercel', 'netlify', 'github-pages', 'wordpress', 'apache'] as HostingPlatform[]).map(p => (
                    <span key={p} className="text-xs font-body px-3 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border">
                      {PLATFORMS[p].icon} {PLATFORMS[p].name}
                    </span>
                  ))}
                </motion.div>

                <motion.div className="flex items-center gap-6 text-xs text-muted-foreground font-body"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-success" />
                    <span>Universal Detection</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                    <span className="ml-1">4.9/5</span>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* SCANNING / RESCAN */}
            {(phase === 'scanning' || phase === 'rescan') && (
              <motion.div key="scanning" className="flex flex-col items-center justify-center min-h-[80vh] gap-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ShieldAnimation scanning />
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {phase === 'rescan' ? 'Re-scanning...' : 'Scanning'} {url}
                  </h2>
                  <p className="text-sm text-muted-foreground font-body">
                    {phase === 'rescan' ? 'Verifying your fixes...' : 'Detecting platform & analyzing security...'}
                  </p>
                  {phase === 'scanning' && progress > 30 && (
                    <motion.div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                      style={{ background: `${platformInfo.color}15`, border: `1px solid ${platformInfo.color}40` }}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                      <span className="text-sm">{platformInfo.icon}</span>
                      <span className="text-xs font-display font-bold" style={{ color: platformInfo.color }}>
                        {platformInfo.name.toUpperCase()} DETECTED
                      </span>
                    </motion.div>
                  )}
                </div>
                <ScanProgress progress={progress} timeLeft={timeLeft} />
              </motion.div>
            )}

            {/* RESULTS */}
            {phase === 'results' && (
              <motion.div key="results" className="py-8 space-y-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-body mb-1">Results for {url}</p>
                  {/* Platform badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                    style={{ background: `${platformInfo.color}15`, border: `1px solid ${platformInfo.color}40` }}>
                    <span className="text-lg">{platformInfo.icon}</span>
                    <span className="text-sm font-display font-bold" style={{ color: platformInfo.color }}>
                      Platform: {platformInfo.name}
                    </span>
                  </div>
                  <ScoreDisplay score={score} />
                  <div className="flex justify-center gap-4 mt-6">
                    <span className="severity-critical text-xs font-semibold px-3 py-1.5 rounded-full">
                      🔴 {vulnerabilities.filter(v => v.severity === 'critical').length} Critical
                    </span>
                    <span className="severity-high text-xs font-semibold px-3 py-1.5 rounded-full">
                      🟡 {vulnerabilities.filter(v => v.severity === 'high').length} High
                    </span>
                    <span className="severity-medium text-xs font-semibold px-3 py-1.5 rounded-full">
                      🟢 {vulnerabilities.filter(v => v.severity === 'medium').length} Medium
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={() => setShowModal(true)}
                    className="shimmer-btn px-8 py-6 text-lg font-display font-bold rounded-xl pulse-neon">
                    <Lock className="w-5 h-5 mr-2" />
                    🤖 {platformInfo.name.toUpperCase()} FIX READY — SECURE NOW
                  </Button>
                </div>

                <div className="max-w-3xl mx-auto space-y-3">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Vulnerabilities Found
                  </h3>
                  {vulnerabilities.map((vuln, i) => (
                    <VulnerabilityCard key={vuln.id} vuln={vuln} index={i} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* SUCCESS */}
            {phase === 'success' && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SuccessScreen oldScore={62} newScore={94} onScanAnother={handleScanAnother} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {(phase === 'results' || phase === 'success') && (
        <SafetyBar
          onRestore={handleScanAnother}
          onGuide={() => setShowGuide(true)}
          showGuide={score < 80 && phase === 'results'}
        />
      )}

      <FortressModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onFixed={handleFixed}
        platform={detectedPlatform}
      />

      <NewbieGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onComplete={() => { setShowGuide(false); handleFixed(); }}
        platform={detectedPlatform}
        url={url}
      />
    </div>
  );
};

export default Scanner;
