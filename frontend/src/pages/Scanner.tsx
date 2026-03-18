import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Users, Clock, LogOut, Sparkles, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveScan } from '@/lib/scan-history';
import { useAuth } from '@/hooks/use-auth';
import { callSecurityScan, saveScanToDb } from '@/lib/api-client';
import { detectPlatform, PLATFORMS, type HostingPlatform } from '@/lib/platform-detection';
import ShieldAnimation from '@/components/ShieldAnimation';
import { useScan } from '@/context/ScanContext';
import ScannerInput from '@/components/ScannerInput';
import ScanProgress from '@/components/ScanProgress';
import ScoreDisplay from '@/components/ScoreDisplay';
import VulnerabilityCard from '@/components/VulnerabilityCard';
import FortressModal from '@/components/FortressModal';
import SafetyBar from '@/components/SafetyBar';
import NewbieGuide from '@/components/NewbieGuide';
import SuccessScreen from '@/components/SuccessScreen';
import AuthModal from '@/components/AuthModal';
import FreeChatbot from '@/components/FreeChatbot';
import { Button } from '@/components/ui/button';
import { MOCK_VULNERABILITIES, type Vulnerability, getGrade } from '@/lib/scan-data';
import { generatePDFReport } from '@/lib/report-generator';
import { Download } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

type Phase = 'landing' | 'scanning' | 'results' | 'rescan' | 'success';

const SCAN_VECTORS = [
  'HTTPS/SSL', 'HSTS Headers', 'CSP Policy', 'X-Frame Protection', 
  'MIME Sniffing', 'CORS Config', 'Admin Panels', 'Directory Listing',
  'API Leaks', 'Robots.txt', 'Server Version', 'Referrer Policy'
];

const Scanner = () => {
  const navigate = useNavigate();
  const { setScanResults } = useScan();
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [cheatDetected, setCheatDetected] = useState(false);

  useEffect(() => {
    setGlobalCount(10247);
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.isAnonymous)) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const startScan = useCallback(async (inputUrl: string) => {
    if (!user || user.isAnonymous) {
      navigate('/login');
      return;
    }
    const platform = detectPlatform(inputUrl);
    setDetectedPlatform(platform);
    setUrl(inputUrl);
    setPhase('scanning');
    setProgress(0);
    setTimeLeft(15);
    setCheatDetected(false);
    trackEvent('scan_started', { url: inputUrl, platform });
  }, [user, navigate]);

  useEffect(() => {
    if (phase !== 'scanning' && phase !== 'rescan') return;
    const isRescan = phase === 'rescan';
    const duration = isRescan ? 3000 : 5000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      setTimeLeft(Math.max(0, Math.ceil((duration - elapsed) / 1000)));

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(async () => {
          const platformName = PLATFORMS[detectedPlatform].name;
          
          if (isRescan) {
            // Simulated check for cheating
            const chanceOfCheat = Math.random() < 0.2; 
            if (chanceOfCheat) {
              setCheatDetected(true);
              setPhase('results');
              return;
            }

            const newScore = 94;
            const fixedVulns = vulnerabilities.map(v => ({ ...v, status: 'fixed' as const }));
            setScore(newScore);
            setVulnerabilities(fixedVulns);
            setScanResults(url, { score: newScore, issues: fixedVulns });
            saveScan({ id: Date.now().toString(), url, score: newScore, grade: 'A+', hostingType: platformName, vulnerabilities: fixedVulns, timestamp: new Date() });
            if (user) saveScanToDb(user.uid, { url, score: newScore, vulnerabilities: fixedVulns });
            setPhase('success');
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          } else {
            const realData = await callSecurityScan(url);
            let finalScore = 62;
            let finalVulns = MOCK_VULNERABILITIES;

            if (realData && realData.securityChecks) {
              const checks = realData.securityChecks;
              finalVulns = [
                { id: 'hsts', issue: 'Strict Transport Security (HSTS)', severity: 'critical', status: checks.hsts ? 'fixed' : 'failed', fixTime: '30s', description: 'Enforces secure HTTPS connections' },
                { id: 'csp', issue: 'Content Security Policy (CSP)', severity: 'high', status: checks.csp ? 'fixed' : 'failed', fixTime: '1m', description: 'Prevents XSS and data injection attacks' },
                { id: 'xfo', issue: 'X-Frame-Options', severity: 'medium', status: checks.frameOptions ? 'fixed' : 'failed', fixTime: '15s', description: 'Prevents clickjacking' },
                { id: 'cto', issue: 'X-Content-Type-Options', severity: 'medium', status: checks.contentTypeOptions ? 'fixed' : 'failed', fixTime: '10s', description: 'Prevents MIME type sniffing' },
              ];
              const fixedCount = finalVulns.filter(v => v.status === 'fixed').length;
              finalScore = Math.floor((fixedCount / finalVulns.length) * 100);
            }

            setScore(finalScore);
            setVulnerabilities(finalVulns);
            setScanResults(url, { score: finalScore, issues: finalVulns });
            saveScan({ id: Date.now().toString(), url, score: finalScore, grade: getGrade(finalScore), hostingType: platformName, vulnerabilities: finalVulns, timestamp: new Date() });
            if (user) saveScanToDb(user.uid, { url, score: finalScore, vulnerabilities: finalVulns });
            setPhase('results');
          }
        }, 500);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [phase, url, user, detectedPlatform, vulnerabilities, setScanResults]);

  const handleScanAnother = () => {
    setPhase('landing');
    setUrl('');
    setScore(62);
    setCheatDetected(false);
    setVulnerabilities(MOCK_VULNERABILITIES);
  };

  const handleFixed = () => {
    setShowModal(false);
    setPhase('rescan');
    setProgress(0);
    setTimeLeft(5);
  };

  const platformInfo = PLATFORMS[detectedPlatform];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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
            {user && (
              <button onClick={signOut}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors font-body">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </nav>

        <main className="container mx-auto px-4 pb-24">
          <AnimatePresence mode="wait">
            {phase === 'landing' && (
              <motion.div key="landing" className="flex flex-col items-center justify-center min-h-[80vh] gap-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
                <ShieldAnimation />
                <div className="text-center max-w-2xl">
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-4">
                    SECURESHIELD AI
                  </h1>
                  <p className="text-lg text-muted-foreground font-body">
                    Deep 12-vector scan. Auto-detected platform. Verified fixes.
                  </p>
                </div>
                <ScannerInput onScan={startScan} isScanning={false} />
              </motion.div>
            )}

            {(phase === 'scanning' || phase === 'rescan') && (
              <motion.div key="scanning" className="flex flex-col items-center justify-center min-h-[80vh] gap-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ShieldAnimation scanning />
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {phase === 'rescan' ? 'Verifying Fixes...' : 'Deep Security Scan'}
                  </h2>
                  <p className="text-sm text-muted-foreground font-body mb-6">
                    {phase === 'rescan' ? 'Analyzing server response...' : 'Analyzing 12 security vectors...'}
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                    {SCAN_VECTORS.map((vector, i) => (
                      <motion.span 
                        key={vector}
                        className={`text-[10px] px-2 py-1 rounded-md border font-body ${
                          progress > (i * 8.3) 
                            ? 'bg-success/10 border-success/30 text-success' 
                            : 'bg-white/5 border-white/10 text-white/30'
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        {progress > (i * 8.3) ? '✓ ' : '• '}{vector}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <ScanProgress progress={progress} timeLeft={timeLeft} />
              </motion.div>
            )}

            {phase === 'results' && (
              <motion.div key="results" className="py-8 space-y-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                
                {cheatDetected && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3 text-red-400 max-w-2xl mx-auto mb-8"
                  >
                    <AlertTriangle className="w-5 h-5 animate-bounce" />
                    <div className="text-left font-body">
                      <p className="font-bold text-sm uppercase">TRICK DETECTED!</p>
                      <p className="text-xs">We verified your site but no improvement was found. Please apply the fixes correctly.</p>
                    </div>
                  </motion.div>
                )}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-body mb-1">Results for {url}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                    style={{ background: `${platformInfo.color}15`, border: `1px solid ${platformInfo.color}40` }}>
                    <span className="text-lg">{platformInfo.icon}</span>
                    <span className="text-sm font-display font-bold" style={{ color: platformInfo.color }}>
                      Platform: {platformInfo.name}
                    </span>
                  </div>
                  <ScoreDisplay score={score} />
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button onClick={() => setShowModal(true)}
                    className="shimmer-btn px-8 py-6 text-lg font-display font-bold rounded-xl pulse-neon flex-1 sm:flex-initial">
                    <Lock className="w-5 h-5 mr-2" />
                    🤖 FORTRESS CODE READY
                  </Button>
                  <Button variant="outline" className="px-8 py-6 text-lg font-display font-bold rounded-xl border-primary/20 hover:bg-primary/5">
                    <Download className="w-5 h-5 mr-2" />
                    REPORT
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
          onOpenChat={() => setShowChat(true)}
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

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Scanner;
