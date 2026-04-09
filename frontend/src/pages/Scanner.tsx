import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Lock, Shield, Clock, LogOut, Sparkles, AlertTriangle, Globe,
  Activity, PieChart as PieIcon, X, ShieldCheck, Download,
  Search, History as HistoryIcon, LayoutDashboard, FileText, Zap,
  ArrowRight, Loader2, Mail, Share2, RefreshCcw, User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/hooks/use-auth';
import { callSecurityScan, getAiFixes, sendEmailAlert } from '@/lib/api-client';
import { detectPlatform, PLATFORMS, type HostingPlatform } from '@/lib/platform-detection';
import ShieldAnimation from '@/components/ShieldAnimation';
import { LogoRenderer } from '@/components/LogoRenderer';
import { useScan } from '@/context/ScanContext';
import ScannerInput from '@/components/ScannerInput';
import ScoreDisplay from '@/components/ScoreDisplay';
import VulnerabilityCard from '@/components/VulnerabilityCard';
import FortressModal from '@/components/FortressModal';
import SuccessScreen from '@/components/SuccessScreen';
import AuthModal from '@/components/AuthModal';
import HeadersGrid from '@/components/HeadersGrid';
import SSLCard from '@/components/SSLCard';
import VirusTotalCard from '@/components/VirusTotalCard';
import OWASPCard from '@/components/OWASPCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Vulnerability } from '@/lib/scan-data';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { toast } from 'react-hot-toast';
import { generatePDFReport } from '@/lib/report-generator';
import { type ScanResult, type AiFixResponse } from '@/lib/scan-data';

const Scanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithGoogle, signOut } = useAuth();
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<'landing' | 'scanning' | 'results'>('landing');
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<HostingPlatform>('apache');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [aiFixes, setAiFixes] = useState<AiFixResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState('🔍 Validating URL...');
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState<'sending' | 'success' | 'error' | null>(null);
  const [emailMessage, setEmailMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if prompt already caught in index.html
    if (window.deferredInstallPrompt) {
      setInstallPrompt(window.deferredInstallPrompt);
      setCanInstall(true);
    }
    
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler as any);
    window.addEventListener('pwaInstallReady', () => {
      if (window.deferredInstallPrompt) {
        setInstallPrompt(window.deferredInstallPrompt);
        setCanInstall(true);
      }
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setCanInstall(false);
  };

  useEffect(() => {
    if (location.state?.reScanUrl) {
      handleScan(location.state.reScanUrl);
    }
  }, [location.state]);

  // Manage body scroll during loading
  useEffect(() => {
    if (phase === 'scanning') {
      document.body.classList.add('is-loading');
    } else {
      document.body.classList.remove('is-loading');
    }
    return () => document.body.classList.remove('is-loading');
  }, [phase]);

  const handleScan = async (targetUrl: string) => {
    // 1. URL Sanitization: Prepend https:// if no protocol exists
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
    }
    
    setUrl(cleanUrl);
    setPhase('scanning');
    setProgress(0);
    setErrorMessage('');
    
    trackEvent('scan_started', { url: cleanUrl });

    const platform = detectPlatform(cleanUrl);
    setDetectedPlatform(platform);

    const startTime = Date.now();
    const duration = 5000;
    
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min((elapsed / duration) * 100, 100);
        setProgress(pct);
        setTimeLeft(Math.max(0, Math.ceil((duration - elapsed) / 1000)));

        // Step-by-step progress messages
        if (pct < 20) setStatusMessage("🔍 Validating URL...");
        else if (pct < 40) setStatusMessage("📡 Fetching security headers...");
        else if (pct < 60) setStatusMessage("🔒 Checking SSL certificate...");
        else if (pct < 80) setStatusMessage("🦠 Running VirusTotal scan...");
        else setStatusMessage("🤖 Generating AI recommendations...");

        if (pct >= 100) {
            clearInterval(interval);
            finishScan(cleanUrl);
        }
    }, 100);
  };

  const finishScan = async (cleanUrl: string) => {
    try {
        const realData = await callSecurityScan(cleanUrl);
        
        if (!realData || realData.status === 'unreachable') {
            toast.error(realData?.message || "Website unreachable", { id: 'scan-error' });
            setErrorMessage(realData?.message || "We couldn't reach that website. Please check the URL and try again.");
            setPhase('landing');
            return;
        }

        setScanResult(realData);
        const finalScore = realData.score;

        const mappedVulns: Vulnerability[] = (realData.vulnerabilities || []).map((issue) => ({
            id: issue.id || Math.random().toString(),
            issue: issue.title || issue.issue,
            severity: (issue.severity?.toLowerCase() || 'medium') as 'critical' | 'high' | 'medium' | 'low',
            status: 'failed',
            fixTime: '1m',
            description: issue.description
        }));

        const aiData = await getAiFixes(realData);
        setAiFixes(aiData);

        setScore(finalScore);
        setVulnerabilities(mappedVulns);
        setPhase('results');
        
        // Auto-scroll to results
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        toast.success("Scan complete! Saved to history ✓", { icon: '🛡️', id: 'scan-complete' });
        
        if (finalScore >= 90) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7', '#ffffff'] });
        }
        
        trackEvent('scan_completed', { url: cleanUrl, score: finalScore });
    } catch (err) {
        toast.error("Critical Engine Error", { id: 'engine-error' });
        setErrorMessage("Critical Engine Error. Please try again.");
        setPhase('landing');
    }
  };

  const scanAnother = () => {
    setPhase('landing');
    setUrl('');
    setScore(null);
    setVulnerabilities(null);
    setScanResult(null);
    setAiFixes(null);
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendEmail = async () => {
    // Validate email
    if (!emailInput.trim()) {
      setEmailStatus('error');
      setEmailMessage('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setEmailStatus('error');
      setEmailMessage('Please enter a valid email address');
      return;
    }

    if (!scanResult) {
      setEmailStatus('error');
      setEmailMessage('No scan result to send');
      return;
    }

    // Set loading state
    setEmailStatus('sending');
    setEmailMessage('Sending report to your inbox...');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          scanResult: scanResult
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // REAL error — show actual error message
        setEmailStatus('error');
        setEmailMessage(
          data.error || 'Failed to send email. Try again.'
        );
        return;
      }

      // REAL success — confirmed by Resend
      setEmailStatus('success');
      setEmailMessage(
        `✅ Report sent to ${emailInput}! 
         Check your inbox (and spam folder).`
      );
      setEmailInput(''); // Clear input

      // Auto-clear success after 6 seconds
      setTimeout(() => {
        setEmailStatus(null);
        setEmailMessage('');
      }, 6000);

    } catch (err) {
      // Network error
      setEmailStatus('error');
      setEmailMessage(
        'Network error. Check your connection and try again.'
      );
    }
  };

  const navLinks = [
    { name: 'Scan History', path: '/history', icon: <HistoryIcon className="w-4 h-4" /> },
    { name: 'Security API', path: '/api-docs', icon: <Lock className="w-4 h-4" /> },
    { name: 'Documentation', path: '/documentation', icon: <FileText className="w-4 h-4" /> },
    { name: 'Monitoring', path: '/monitoring', icon: <Activity className="w-4 h-4" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const platformInfo = detectedPlatform ? PLATFORMS[detectedPlatform] : PLATFORMS.apache;
  const isSecure = (score !== null && score >= 90);

  // Chart Data preparation
  const chartData = [
    { name: 'Critical', value: vulnerabilities?.filter(v => v.severity === 'critical').length || 0, color: '#ef4444' },
    { name: 'High', value: vulnerabilities?.filter(v => v.severity === 'high').length || 0, color: '#f97316' },
    { name: 'Medium', value: vulnerabilities?.filter(v => v.severity === 'medium').length || 0, color: '#eab308' },
    { name: 'Clean', value: vulnerabilities?.length === 0 ? 1 : 0, color: '#22c55e' }
  ];

  const handleShare = () => {
    const scanId = scanResult?.id || 'demo-' + Date.now();
    const shareUrl = `${window.location.origin}/report/${scanId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied! Anyone with this link can view this report", { duration: 4000 });
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-body text-slate-200">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full">
        {/* Navbar */}
        <nav className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-[100]">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="logo-wrapper flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/scan')}>
              <LogoRenderer className="logo-icon w-8 h-8 group-hover:rotate-12 transition-transform" />
              <span className="logo-text font-display font-bold text-xl tracking-tighter gradient-text uppercase">SecureWeb AI</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg ${isActive(link.path) ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="nav-right flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="user-profile-btn flex items-center gap-3 pl-3 pr-1 py-1 rounded-full bg-slate-900 border border-white/10 hover:border-primary/50 transition-all"
                  >
                    <span className="user-name text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <div className="user-avatar w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden border border-primary/20">
                      {user.photoURL ? <img src={user.photoURL} alt="User" /> : <User className="w-4 h-4" />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-56 glass-card bg-slate-900 border-white/10 shadow-2xl overflow-hidden p-1.5"
                      >
                         <button onClick={() => {navigate('/history'); setShowUserDropdown(false)}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left">
                            <HistoryIcon className="w-4 h-4" /> My Scan History
                         </button>
                         <button onClick={() => {navigate('/dashboard'); setShowUserDropdown(false)}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                         </button>
                         <div className="h-px bg-white/5 my-1.5" />
                         <button onClick={() => {signOut(); setShowUserDropdown(false)}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all text-left">
                            <LogOut className="w-4 h-4" /> Sign Out
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="auth-button h-10 px-6 rounded-xl bg-primary text-black font-black uppercase text-[10px] tracking-widest pulse-neon">
                  Sign In
                </Button>
              )}
              
              {canInstall && (
                <button onClick={handleInstallClick}
                  className="hidden sm:inline-flex"
                  style={{
                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}>
                  📱 Install App
                </button>
              )}
              
              <button 
                className="hamburger lg:hidden text-slate-400"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-slate-900 border-b border-white/5 overflow-hidden sticky top-[73px] z-[90]"
            >
               <div className="p-6 space-y-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.path} to={link.path} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-bold ${isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-slate-400'}`}
                    >
                      {link.icon} {link.name}
                    </Link>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="container mx-auto px-6 py-12 md:py-24">
          <AnimatePresence mode="wait">
            {phase === 'landing' && (
              <motion.div key="landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto space-y-16">
                <div className="text-center space-y-8">
                  {!user && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/80 text-[10px] font-black uppercase tracking-widest mb-4">
                      <AlertTriangle className="w-3.5 h-3.5" /> Sign in to save history permanently
                    </motion.div>
                  )}
                  <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight leading-[0.9] uppercase italic">
                    Fortify Your <br />
                    <span className="gradient-text">Web Perimeter</span>
                  </h1>
                  <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                    Deploy AI-driven deep-packet audits. Detect over 50+ vulnerabilities in seconds. 
                    Zero dummy data. Pure security intelligence.
                  </p>
                </div>

                <div className="relative">
                   <ScannerInput onScan={handleScan} isScanning={false} />
                   {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full max-w-lg p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest"
                    >
                      <ShieldAlert className="w-4 h-4" /> {errorMessage}
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                   {[
                     { title: "Quantum Analysis", icon: <Shield className="w-5 h-5" />, desc: "Deep-packet inspection of headers, SSL, and server signatures on every probe.", color: "text-primary" },
                     { title: "AI Remediation", icon: <Sparkles className="w-5 h-5" />, desc: "Custom security patches engineered by Gemini Flash for your specific stack.", color: "text-purple-500" },
                     { title: "24/7 Guard", icon: <Activity className="w-5 h-5" />, desc: "Continuous perimeter monitoring with instant alerts on status changes.", color: "text-success" }
                   ].map((feat, i) => (
                      <div key={i} className="glass-card p-8 border-white/5 space-y-4 group hover:border-white/20 transition-all hover:-translate-y-1">
                        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${feat.color} group-hover:scale-110 transition-transform`}>
                          {feat.icon}
                        </div>
                        <h3 className="font-display font-black text-xl uppercase italic tracking-tighter">{feat.title}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                      </div>
                   ))}
                </div>
              </motion.div>
            )}

            {phase === 'scanning' && (
              <motion.div 
                key="scanning" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#020409] overflow-hidden w-screen h-screen"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
              >
                <div className="space-y-16 text-center">
                  <div className="relative inline-block">
                    <ShieldAnimation progress={progress} />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-5xl font-display font-black text-white">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-4xl font-display font-black uppercase tracking-tighter italic">SECURE_DOMAIN_AUDIT</h2>
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-primary text-sm font-mono tracking-widest uppercase font-black animate-pulse">{statusMessage}</p>
                      <div className="flex gap-1">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className={`h-1 w-8 rounded-full transition-all duration-500 ${progress > (i * 16.6) ? 'bg-primary shadow-[0_0_10px_#6366f1]' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'results' && scanResult && (
              <motion.div key="results" ref={resultsRef} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 max-w-6xl mx-auto pb-40">
                {/* Results Header */}
                <div className="glass-card p-8 md:p-12 border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-none" />
                  
                  <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center justify-between">
                    <div className="space-y-6 flex-1">
                      {/* Score Comparison Badge */}
                      {previousScore !== null && !isRescanning && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} 
                          animate={{ opacity: 1, y: 0 }}
                          className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 mb-2"
                        >
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency Delta:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">{previousScore}</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            <span className="text-xs font-bold text-white">{scanResult.score}</span>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${scanResult.score > (previousScore || 0) ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-500'}`}>
                            {scanResult.score > (previousScore || 0) ? `↑ +${scanResult.score - (previousScore || 0)}` : `↓ ${scanResult.score - (previousScore || 0)}`} POINTS
                          </span>
                        </motion.div>
                      )}

                      {/* Rescanning Status */}
                      {isRescanning && (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center gap-3 text-primary mb-4"
                        >
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm font-display font-black uppercase tracking-tighter italic animate-pulse">RE-SCANNING PERIMETER...</span>
                        </motion.div>
                      )}
                    <div className="scan-header-card flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Operational Audit</span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                          {platformInfo.icon} {platformInfo.name} Detected
                        </div>
                        {isSecure && (
                          <div className="bg-success/20 text-success text-[10px] font-black px-3 py-1 rounded-full border border-success/30 flex items-center gap-1.5 animate-pulse uppercase tracking-widest">
                            <ShieldCheck className="w-3.5 h-3.5" /> PERIMETER FORTIFIED
                          </div>
                        )}
                      </div>
                      <h2 className="scan-result-url text-2xl md:text-5xl font-display font-black break-all tracking-tighter uppercase italic">{url}</h2>
                      <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Engine v5.0 DeepScan</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Verified {new Date().toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="action-buttons-row flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      <Button 
                        onClick={() => {
                          const el = document.getElementById('vuln-section');
                          el?.scrollIntoView({ behavior: 'smooth' });
                          setShowModal(true);
                        }} 
                        disabled={!vulnerabilities || vulnerabilities.length === 0} 
                        className="primary-action-btn flex-1 lg:flex-none h-16 px-10 rounded-2xl bg-primary text-black hover:bg-white transition-all font-display font-black uppercase text-xs tracking-widest shadow-xl"
                      >
                        <Lock className="w-5 h-5 mr-3" /> FIX VULNERABILITIES
                      </Button>
                      <Button 
                        variant="ghost" size="icon" 
                        onClick={() => handleScan(url)}
                        className="h-16 w-16 rounded-2xl bg-white/5 text-white hover:text-primary border border-white/5"
                        title="Re-Scan Site"
                      >
                        <RefreshCcw className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" size="icon" 
                        onClick={handleShare}
                        className="h-16 w-16 rounded-2xl bg-white/5 text-white hover:text-primary border border-white/5"
                        title="Share Report"
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" size="icon" 
                        onClick={() => {
                          generatePDFReport(scanResult);
                          toast.success("PDF Generated Successfully");
                        }} 
                        className="h-16 w-16 rounded-2xl bg-white/5 text-white hover:text-success border border-white/5"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={scanAnother} className="h-16 w-16 rounded-2xl bg-white/5 text-red-400 hover:bg-red-500/10 border border-white/5">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* RESTRUCTURED SCAN RESULTS GRID */}
                <div className="scan-results-grid overflow-hidden">
                  
                  {/* LEFT COLUMN */}
                  <div className="left-column">
                    {/* 1. Score & Strategic Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {score !== null && (
                        <div className="glass-card !p-6 flex items-center justify-center !bg-[#0d1424] !border-[#1a2234]">
                          <ScoreDisplay score={score} />
                        </div>
                      )}
                      
                      <div className="glass-card p-6 border-white/5 flex flex-col justify-between space-y-4 !bg-[#0d1424] !border-[#1a2234]">
                         <div className="flex items-center justify-between border-bottom pb-2 border-[#1a2234]">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Strategic Insights</h4>
                            <Sparkles className="w-5 h-5 text-primary" />
                         </div>
                         <div className="space-y-3">
                            <p className="text-[11px] font-medium leading-relaxed italic text-slate-400">
                               Detected {vulnerabilities?.length} security anomalies. Score optimization required to reach <span className="text-success font-black underline underline-offset-4">Grade A</span>.
                            </p>
                            <div className="flex gap-2">
                               <Button variant="outline" onClick={() => handleScan(url)} className="flex-1 h-10 rounded-lg text-[8px] font-black uppercase tracking-widest border-white/5 bg-white/5 hover:bg-white/10">RE-RUN</Button>
                               <Button variant="outline" onClick={handleEnableMonitor} className="flex-1 h-10 rounded-lg text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">GUARD</Button>
                            </div>
                         </div>
                      </div>
                    </div>

                    {/* 2. Vulnerability List */}
                    <div id="vuln-section" className="space-y-6 scroll-mt-32">
                       <div className="flex items-center justify-between px-2">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                             <ShieldAlert className="w-5 h-5 text-destructive" /> Active Security Vector Analysis
                          </h3>
                       </div>
                       <div className="space-y-4">
                        {vulnerabilities && vulnerabilities.length > 0 ? (
                          vulnerabilities.map((vuln, i) => {
                            const currentFix = aiFixes?.fixes?.find((f) => f.vulnerabilityId === vuln.id);
                            return <VulnerabilityCard key={vuln.id} vuln={vuln} index={i} fix={currentFix} />;
                          })
                        ) : (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 text-center glass-card border-success/20 bg-success/5 rounded-3xl !bg-[#0d1424]">
                             <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-success animate-bounce" />
                             <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter mb-2">Perimeter Secured</h3>
                             <p className="text-sm text-slate-500 font-medium italic">No vulnerabilities detected. Your infrastructure passes all baseline compliance checks.</p>
                          </motion.div>
                        )}
                       </div>
                    </div>

                    {/* 3. SSL Certificate Card (MOVED FROM RIGHT) */}
                    <SSLCard ssl={scanResult.ssl} />

                    {/* 4. VirusTotal Card (MOVED FROM RIGHT) */}
                    <VirusTotalCard virusTotal={scanResult.virusTotal} />
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="right-column">
                    {/* 1. Security Headers Analysis */}
                    <HeadersGrid headers={scanResult.headers} />

                    <div className="email-report-section glass-card p-8 border-primary/20 bg-primary/5 space-y-6 !bg-[#0d1424] !border-[#1a2234]">
                       <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
                             <Mail className="w-5 h-5 text-primary" />
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest">Share Executive Report</h4>
                       </div>
                       <div className="space-y-4">
                          <Input 
                            type="email"
                            placeholder="vulnerability-lead@company.com" 
                            value={emailInput}
                            onChange={(e) => {
                              setEmailInput(e.target.value);
                              // Clear error when user types
                              if (emailStatus === 'error') {
                                setEmailStatus(null);
                                setEmailMessage('');
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendEmail();
                            }}
                            disabled={emailStatus === 'sending'}
                            className={`bg-slate-900 text-xs h-12 rounded-xl border ${
                              emailStatus === 'error' ? 'border-red-500' : 'border-white/10'
                            }`}
                          />
                          <Button 
                            onClick={handleSendEmail}
                            disabled={emailStatus === 'sending'}
                            className={`w-full h-12 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all ${
                              emailStatus === 'sending' 
                                ? 'bg-slate-800 text-slate-500' 
                                : 'bg-white text-black hover:bg-primary hover:text-black'
                            }`}
                          >
                            {emailStatus === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SEND_SECURE_EMAIL'}
                          </Button>

                          {/* Status Message — shows REAL result */}
                          {emailMessage && (
                            <div style={{
                              marginTop: '10px',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              background: emailStatus === 'success'
                                ? 'rgba(0,255,136,0.1)'
                                : emailStatus === 'error'
                                ? 'rgba(255,51,102,0.1)'
                                : 'rgba(0,212,255,0.1)',
                              border: `1px solid ${
                                emailStatus === 'success'
                                  ? '#00ff88'
                                  : emailStatus === 'error'
                                  ? '#ff3366'
                                  : '#00d4ff'
                              }`,
                              color: emailStatus === 'success'
                                ? '#00ff88'
                                : emailStatus === 'error'
                                ? '#ff3366'
                                : '#00d4ff',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {emailMessage}
                            </div>
                          )}
                       </div>
                    </div>

                    {/* 3. OWASP Top 10 Card (MOVED FROM BOTTOM) */}
                    <OWASPCard owasp={scanResult.owasp} />

                    {/* 4. Severity Distribution Chart (MOVED FROM BOTTOM) */}
                    <div className="glass-card space-y-8 !bg-[#0d1424] !border-[#1a2234] !p-6 shadow-none">
                       <div className="flex items-center justify-between">
                         <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <PieIcon className="w-4 h-4 text-primary" /> Severity Distribution
                         </h4>
                         <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full uppercase">Real-time</span>
                       </div>
                       <div className="severity-chart-container">
                         <ResponsiveContainer width="100%" height={160}>
                           <PieChart>
                             <Pie
                                data={chartData}
                                innerRadius={45} 
                                outerRadius={60} 
                                paddingAngle={5} 
                                dataKey="value"
                                stroke="none"
                             >
                               {chartData.map((e, index) => <Cell key={index} fill={e.color} />)}
                             </Pie>
                             <RechartsTooltip 
                               contentStyle={{ background: '#0a0a0b', border: '1px solid #1f1f23', borderRadius: '12px', fontSize: '9px' }} 
                               itemStyle={{ fontWeight: 'black', textTransform: 'uppercase', padding: '0px' }}
                             />
                           </PieChart>
                         </ResponsiveContainer>
                         
                         {/* Compact Legend */}
                         <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                           {chartData.filter(d => d.value > 0).map((d, i) => (
                             <div key={i} className="flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                               <span className="text-[8px] font-black uppercase text-slate-500">{d.name} ({d.value})</span>
                             </div>
                           ))}
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <FortressModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        platform={detectedPlatform} 
        onFixed={() => handleScan(url)} 
        vulnerabilities={vulnerabilities || []} 
        aiFixes={aiFixes}
        scanResult={scanResult}
        setScanResult={setScanResult}
        setIsRescanning={setIsRescanning}
        setPreviousScore={setPreviousScore}
      />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      {/* Footer Nav */}
      {phase === 'results' && (
        <div className="bottom-bar fixed bottom-0 left-0 right-0 p-6 z-[80] pointer-events-none">
           <div className="container mx-auto flex justify-center">
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bottom-actions glass-card p-2 bg-slate-900 shadow-2xl border-white/5 flex gap-2 pointer-events-auto">
                 <Button onClick={scanAnother} variant="ghost" className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-3">
                    <ArrowLeft className="w-4 h-4" /> New Audit
                 </Button>
                 <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="h-12 px-6 rounded-xl bg-primary text-black font-black uppercase text-[10px] tracking-widest shadow-lg">
                    Back to Top
                 </Button>
              </motion.div>
           </div>
        </div>
      )}
    </div>
  );

  async function handleEnableMonitor() {
    if (!user) {
       toast.error("Sign in required for autonomous monitoring");
       setShowAuthModal(true);
       return;
    }
    const response = await fetch('/api/monitor', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ userId: user.uid, url, email: user.email, enabled: true })
    });
    if (response.ok) {
       toast.success("Autonomous monitoring activated ✓");
       navigate('/monitoring');
    }
  }
};

const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const ShieldAlert = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default Scanner;
