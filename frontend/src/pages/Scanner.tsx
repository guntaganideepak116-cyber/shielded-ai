import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, Sparkles, AlertTriangle, Globe,
  Activity, PieChart as PieIcon, ShieldCheck, Download,
  Search, Loader2, Mail, ArrowRight,
  ArrowLeft, ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/context/LanguageContext';
import { callSecurityScan, getAiFixes, sendEmailAlert } from '@/lib/api-client';
import { detectPlatform, PLATFORMS, type HostingPlatform } from '@/lib/platform-detection';
import ShieldAnimation from '@/components/ShieldAnimation';
import { LogoRenderer } from '@/components/LogoRenderer';

// -----------------------------
import ScannerInput from '@/components/ScannerInput';
import ScoreDisplay from '@/components/ScoreDisplay';
import VulnerabilityCard from '@/components/VulnerabilityCard';
import SmartFixCard from '@/components/SmartFixCard';
import { FIX_GUIDES } from '@/lib/fixGuides';
import FortressModal from '@/components/FortressModal';
import SuccessScreen from '@/components/SuccessScreen';
import AuthModal from '@/components/AuthModal';
import HeadersGrid from '@/components/HeadersGrid';
import SSLCard from '@/components/SSLCard';
import VirusTotalCard from '@/components/VirusTotalCard';
import OWASPCard from '@/components/OWASPCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Vulnerability, type ScanResult, type AiFixResponse } from '@/lib/scan-data';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { toast } from 'react-hot-toast';
import { generatePDFReport } from '@/lib/report-generator';

const Scanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Map scan vulnerability IDs to fix guide IDs
  const VULN_TO_GUIDE: Record<string, string> = {
    'ssl-invalid':          'ssl-invalid',
    'vt-malicious':         'vt-malicious',
    'sensitive-aws':        'exposed-api-key',
    'sensitive-google':     'exposed-api-key',
    'sensitive-github':     'exposed-api-key',
    'sensitive-password':   'hardcoded-password',
    'exposed-path-.env':    'exposed-env',
    'sensitive-mongodb':    'db-uri-exposed',
    'sensitive-mysql':      'db-uri-exposed',
    'open-port-3306':       'open-db-port',
    'open-port-27017':      'open-db-port',
    'open-port-22':         'open-ssh-port',
    'server-disclosure':    'server-disclosure',
    'powered-by-disclosure':'powered-by-disclosure',
    'exposed-path-phpinfo': 'phpinfo-exposed',
    'exposed-path-admin':   'admin-panel-exposed',
    'exposed-path-.git':    'git-config-exposed',
    'dns-no-spf':           'dns-no-spf',
    'dns-no-dmarc':         'dns-no-dmarc',
    'dns-no-dkim':          'dns-no-dkim',
    'dns-no-caa':           'dns-no-caa',
  };
  
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<'landing' | 'scanning' | 'results'>('landing');
  const [progress, setProgress] = useState(0);
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
  const [scanError, setScanError] = useState<{type: string, message: string, suggestions?: string[]} | null>(null);
  const [isRescanning, setIsRescanning] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);

  // Problem 6 — Restore scan result if it exists
  useEffect(() => {
    const saved = sessionStorage.getItem('lastScanResult');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const scanTime = new Date(parsed.scannedAt);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (scanTime > oneHourAgo) {
          setScanResult(parsed);
          setPhase('results');
          setScore(parsed.score);
          setUrl(parsed.url);
          if (parsed.vulnerabilities) {
            setVulnerabilities(parsed.vulnerabilities.map((v: any) => ({
                id: v.id || Math.random().toString(),
                issue: v.title || v.issue || 'Insecure Configuration',
                severity: (v.severity?.toLowerCase() || 'medium') as 'critical' | 'high' | 'medium' | 'low',
                status: 'failed',
                fixTime: '1m',
                description: v.description || 'Security vector mitigation recommended.'
            })));
          }
        } else {
          sessionStorage.removeItem('lastScanResult');
        }
      } catch (e) {
        sessionStorage.removeItem('lastScanResult');
      }
    }
  }, []);


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
    setScanError(null);
    
    trackEvent('scan_started', { url: cleanUrl });

    const platform = detectPlatform(cleanUrl);
    setDetectedPlatform(platform);

    const startTime = Date.now();
    let isComplete = false;

    // Start API call immediately
    const apiPromise = finishScan(cleanUrl).then(() => {
      isComplete = true;
    });

    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        // If API finished, accelerate to 100%, otherwise slow down at 90%
        let pct;
        if (isComplete) {
          pct = 100;
        } else {
          // Normal progress up to 90% over 6 seconds
          pct = Math.min((elapsed / 6000) * 90, 90);
        }
        
        setProgress(pct);

        // Step-by-step progress messages
        if (pct < 20) setStatusMessage("🔍 Validating URL...");
        else if (pct < 40) setStatusMessage("📡 Fetching security headers...");
        else if (pct < 60) setStatusMessage("🔒 Checking SSL certificate...");
        else if (pct < 85) setStatusMessage("🦠 Running VirusTotal scan...");
        else setStatusMessage("🤖 Generating AI recommendations...");

        if (pct >= 100) {
            clearInterval(interval);
        }
    }, 100);
  };

  const finishScan = async (cleanUrl: string) => {
    try {
        const realData = await callSecurityScan(cleanUrl);
        
        if (!realData || ['error', 'not_found', 'unreachable', 'invalid', 'timeout', 'blocked'].includes(realData.status)) {
            setScanError({
                type: realData?.status || 'error',
                message: realData?.message || "We couldn't reach that website. Please check the URL and try again.",
                suggestions: realData?.suggestions || []
            });
            setPhase('landing');
            return;
        }

        setScanResult(realData);
        sessionStorage.setItem('lastScanResult', JSON.stringify(realData));
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

        // ─── AUTO EMAIL AFTER SCAN ───────────────────────
        const autoSendEmail = async (scanData: ScanResult) => {
          try {
            // Only auto-send if user is logged in
            if (!user || !user.email) return;

            const response = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                userName: user.displayName || 'there',
                scanResult: scanData,
                autoSent: true  // flag to track auto vs manual
              })
            });

            const result = await response.json();

            if (result.success) {
              setScore(finalScore); // Ensure score is set
              toast.success(
                `📧 Report sent to ${user.email}`,
                {
                  duration: 4000,
                  style: {
                    background: '#0d1424',
                    color: '#00ff88',
                    border: '1px solid #00ff88',
                    borderRadius: '8px',
                    fontSize: '13px'
                  },
                  icon: '📧'
                }
              );
            }
          } catch (err: any) {
            // Silent fail — never block the UI for email
            console.log('Auto email skipped:', err.message);
          }
        };

        // Call it right after scan completes
        autoSendEmail(realData);
        // ─────────────────────────────────────────────────
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
          userName: user?.displayName || 'there',
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
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
      
      <div className="relative z-10 w-full pt-4">
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
                    {t('scanner.title')}
                  </h1>
                  <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                    {t('scanner.subtitle')}
                  </p>
                </div>

                <div className="relative">
                   <ScannerInput onScan={handleScan} isScanning={false} />
                   
                   {scanError && (
                    <div style={{
                      background: 'rgba(255,51,102,0.1)',
                      border: '1px solid rgba(255,51,102,0.3)',
                      borderRadius: '12px',
                      padding: '20px 24px',
                      marginTop: '32px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '20px' }}>
                          {scanError.type === 'not_found' ? '🔍' :
                           scanError.type === 'timeout' ? '⏱️' :
                           scanError.type === 'invalid' ? '❌' :
                           scanError.type === 'blocked' ? '🚫' : '⚠️'}
                        </span>
                        <span style={{
                          color: '#ff3366',
                          fontWeight: '700',
                          fontSize: '15px',
                          textTransform: 'uppercase'
                        }}>
                          {scanError.type === 'not_found' 
                            ? 'Website Not Found'
                            : scanError.type === 'timeout'
                            ? 'Website Timeout'
                            : scanError.type === 'invalid'
                            ? 'Invalid URL'
                            : scanError.type === 'blocked'
                            ? 'URL Blocked'
                            : 'Scan Failed'}
                        </span>
                      </div>

                      <p style={{
                        color: '#f0f4ff',
                        fontSize: '14px',
                        margin: '0 0 12px 0',
                        lineHeight: '1.5'
                      }}>
                        {scanError.message}
                      </p>

                      {scanError.suggestions && scanError.suggestions.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          {scanError.suggestions.map((s, i) => (
                            <div key={i} style={{
                              color: '#8892a4',
                              fontSize: '13px',
                              marginTop: '4px'
                            }}>
                              💡 {s}
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setScanError(null)}
                        style={{
                          background: 'rgba(255,51,102,0.2)',
                          border: '1px solid rgba(255,51,102,0.4)',
                          color: '#ff3366',
                          padding: '8px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                        Try Another URL
                      </button>
                    </div>
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
                {/* Results Header (PROBLEM 1 FIX) */}
                <div style={{
                  background: '#0d1424',
                  border: '1px solid #1a2234',
                  borderRadius: '16px',
                  padding: '24px 32px',
                  marginBottom: '24px',
                  boxShadow: 'none'
                }}>
                  {/* Status badges row */}
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      background: 'rgba(0,212,255,0.1)',
                      border: '1px solid rgba(0,212,255,0.3)',
                      color: '#00d4ff',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      OPERATIONAL AUDIT
                    </span>
                    <span style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #1a2234',
                      color: '#8892a4',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      textTransform: 'uppercase'
                    }}>
                      🖥️ {detectPlatform(scanResult?.url || '')} DETECTED
                    </span>
                  </div>

                  {/* BIG URL display */}
                  <h1 style={{
                    color: '#f0f4ff',
                    fontSize: 'clamp(20px, 3vw, 32px)',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    margin: '0 0 20px 0',
                    wordBreak: 'break-all',
                    lineHeight: '1.3'
                  }}>
                    {(scanResult.url || '').toUpperCase()}
                  </h1>

                  {/* Meta row */}
                  <div style={{
                    display: 'flex',
                    gap: '24px',
                    flexWrap: 'wrap',
                    marginBottom: '24px'
                  }}>
                    <span style={{
                      color: '#8892a4',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      ⚡ ENGINE V5.0 DEEPSCAN
                    </span>
                    <span style={{
                      color: '#8892a4',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      🕐 VERIFIED {new Date(scanResult.scannedAt || new Date()).toLocaleTimeString()}
                    </span>
                    <span style={{
                      color: scanResult.status === 'secure' ? '#00ff88' : scanResult.status === 'vulnerable' ? '#ff3366' : '#ffaa00',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      ● {scanResult.status?.toUpperCase()}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={() => {
                        const el = document.getElementById('vuln-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                        setShowModal(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '14px 28px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                      🔒 FIX VULNERABILITIES
                    </button>
                    <button onClick={() => handleScan(url)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #1a2234',
                        color: '#f0f4ff',
                        borderRadius: '10px',
                        padding: '14px 20px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}>
                      ↺ RE-SCAN
                    </button>
                    <button onClick={handleShare}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #1a2234',
                        color: '#f0f4ff',
                        borderRadius: '10px',
                        padding: '14px 20px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}>
                      ↗ SHARE
                    </button>
                    <button onClick={() => generatePDFReport(scanResult)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #1a2234',
                        color: '#f0f4ff',
                        borderRadius: '10px',
                        padding: '14px 20px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}>
                      ↓ PDF
                    </button>
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
                      
                      <div style={{
                        background: '#0d1424',
                        border: '1px solid #1a2234',
                        borderRadius: '12px',
                        padding: '20px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '16px'
                        }}>
                          <span style={{
                            color: '#8892a4',
                            fontSize: '12px',
                            fontWeight: '600',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                          }}>
                            STRATEGIC INSIGHTS
                          </span>
                          <span style={{ fontSize: '18px' }}>✨</span>
                        </div>

                        <p style={{
                          color: '#f0f4ff',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          margin: '0 0 16px 0',
                          fontStyle: 'italic'
                        }}>
                          {(vulnerabilities?.length || 0) === 0
                            ? '✅ Excellent! No security anomalies detected. Your website follows security best practices.'
                            : `Detected ${vulnerabilities?.length} security anomalie${(vulnerabilities?.length || 0) > 1 ? 's' : ''}. Fix remaining issues to reach Grade A.`
                          }
                        </p>

                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          flexWrap: 'wrap'
                        }}>
                          <button onClick={() => handleScan(url)}
                            style={{
                              flex: 1,
                              background: 'rgba(0,212,255,0.1)',
                              border: '1px solid rgba(0,212,255,0.3)',
                              color: '#00d4ff',
                              borderRadius: '8px',
                              padding: '10px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                            RE-SCAN
                          </button>
                          <button onClick={() => {
                              const el = document.getElementById('vuln-section');
                              el?.scrollIntoView({ behavior: 'smooth' });
                              setShowModal(true);
                            }}
                            style={{
                              flex: 1,
                              background: 'rgba(124,58,237,0.2)',
                              border: '1px solid rgba(124,58,237,0.4)',
                              color: '#a78bfa',
                              borderRadius: '8px',
                              padding: '10px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                            GET SHIELD
                          </button>
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

                    {/* 5. SMART FIX GUIDES (NEW) */}
                    <div className="space-y-6 pt-12">
                      <div className="flex items-center gap-4 px-2">
                        <div className="h-[1px] flex-1 bg-white/5" />
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-3">
                           Step-By-Step Remediation Playbooks
                        </h3>
                        <div className="h-[1px] flex-1 bg-white/5" />
                      </div>

                      {scanResult?.vulnerabilities?.map((vuln: any) => {
                        const guideId = VULN_TO_GUIDE[vuln.id];
                        if (!guideId || !(FIX_GUIDES as any)[guideId]) return null;

                        return (
                          <SmartFixCard
                            key={vuln.id + "-guide"}
                            vulnerabilityId={guideId}
                            scanResult={scanResult}
                            onRescan={async () => {
                              await handleScan(scanResult.url);
                              toast.success('Re-scan complete! Site remediated.');
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="right-column">
                    {/* 1. Security Headers Analysis */}
                    <HeadersGrid headers={scanResult.headers} />

                    <div className="email-report-section glass-card !bg-[#0d1424] !border-[#1a2234] !p-8 shadow-none space-y-6">
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

export default Scanner;
