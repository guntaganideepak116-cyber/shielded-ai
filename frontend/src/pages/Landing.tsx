import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ShieldCheck, Zap, Lock, Eye, Code, ArrowRight,
  CheckCircle, Users, Star, BarChart3, Globe, Clock, Sparkles, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { LogoRenderer } from '@/components/LogoRenderer';
// Counters can be fetched from the new Node.js backend if needed
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const FEATURES = [
  { icon: Eye, title: 'Deep Vulnerability Scan', desc: 'Checks headers, SSL, admin panels, directory listing, and 50+ security vectors in seconds.' },
  { icon: Code, title: 'Auto-Generated Fix Code', desc: 'Get copy-paste-ready .htaccess, NGINX, or Cloudflare configs tailored to your server.' },
  { icon: Zap, title: 'One-Click Fortify', desc: 'Apply fixes, re-scan, and watch your score jump from D- to A+ in under 90 seconds.' },
  { icon: ShieldCheck, title: 'Continuous Monitoring', desc: 'Background re-scans detect new vulnerabilities before hackers do.' },
  { icon: BarChart3, title: 'Score Benchmarking', desc: 'Compare your security posture against industry averages and competitors.' },
  { icon: Globe, title: 'Multi-Platform Support', desc: 'Apache, NGINX, Cloudflare, WordPress, Vercel — we detect and adapt automatically.' },
];

const STATS = [
  { value: 'LIVE', label: 'Network status' },
  { value: '0-Day', label: 'Threat detection' },
  { value: '24/7', label: 'Audit interval' },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'CTO, Launchpad.io', quote: 'Went from a D- to A+ in literally 90 seconds. Our security audit passed the next day.', stars: 5 },
  { name: 'Marcus Rivera', role: 'DevOps Lead, ScaleUp', quote: 'The auto-generated configs saved our team 40+ hours of manual security hardening.', stars: 5 },
  { name: 'Priya Sharma', role: 'Founder, IndieStack', quote: 'Finally a security tool that doesn\'t require a PhD to use. Copy, paste, done.', stars: 5 },
];

const Landing = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<{totalScans: number, totalUsers: number, secureCount: number} | null>(null);
  const [lang, setLang] = useState<'EN' | 'TE'>('EN');
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
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
    // Stats fetch is handled above
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-48 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #667eea 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #764ba2 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #667eea 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        {/* NAV */}
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="logo-wrapper flex items-center gap-2">
            <LogoRenderer className="logo-icon w-8 h-8 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <span className="logo-text font-display font-bold text-lg sm:text-xl gradient-text text-nowrap leading-tight">SECUREWEB AI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div style={{
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.3)',
              color: '#00d4ff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              fontFamily: 'Arial, sans-serif'
            }} className="hidden sm:block">
              BETA v1.4 LIVE
            </div>
             <button
              onClick={() => setLang(lang === 'EN' ? 'TE' : 'EN')}
              className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-primary hover:bg-white/10 transition-all font-display text-[11px] font-bold"
            >
              {lang === 'EN' ? 'తెలుగు' : 'ENGLISH'}
            </button>
            <button
              onClick={() => navigate('/documentation')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-body hidden sm:block"
            >
              Docs
            </button>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-body hidden sm:block"
            >
              History
            </button>
            
            <div className="hidden lg:flex items-center gap-3">
              {(user && !user.isAnonymous) ? (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => navigate('/scan')}
                    className="gradient-btn text-sm font-display px-5 py-2"
                  >
                    Dashboard
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="w-8 h-8 border border-white/10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                        <AvatarImage src={user.photoURL || ''} />
                        <AvatarFallback className="bg-primary/20 text-[10px]">{user.email?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 glass-card-strong border-white/10 text-white" align="end">
                      <DropdownMenuLabel className="font-display font-bold text-xs uppercase tracking-widest text-white/50">My Terminal</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="focus:bg-white/5 cursor-pointer py-3" onClick={() => navigate('/scan')}>
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-white/5 cursor-pointer py-3" onClick={() => navigate('/monitoring')}>
                        Monitoring
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-white/5 cursor-pointer py-3" onClick={() => navigate('/api-docs')}>
                        Security API
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="focus:bg-red-500/20 text-red-400 cursor-pointer py-3 font-bold" onClick={() => signOut()}>
                        <LogOut className="w-4 h-4 mr-2" />
                        De-authorize Terminal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-xs sm:text-sm font-display px-3 py-2 hover:bg-white/5"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/signup')}
                    className="gradient-btn text-xs sm:text-sm font-display px-3 py-2"
                  >
                    Start Scanning
                  </Button>
                </>
              )}
            </div>

            <button 
              className="hamburger lg:hidden text-slate-400 group flex items-center justify-center"
              onClick={() => navigate('/scan')}
            >
              <div className="flex flex-col gap-1.5 p-2">
                <span className="w-6 h-0.5 bg-primary rounded-full transition-all group-hover:w-8 group-hover:bg-white" />
                <span className="w-8 h-0.5 bg-primary rounded-full transition-all group-hover:w-6 group-hover:bg-white" />
                <span className="w-5 h-0.5 bg-primary rounded-full transition-all group-hover:w-8 group-hover:bg-white" />
              </div>
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section className="container mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div
              className="flex-1 text-center lg:text-left max-w-xl"
              initial="hidden" animate="visible"
            >
              <motion.div variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 glass-card px-3 py-1.5 text-xs font-body text-primary mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {stats && stats.totalScans > 0 ? (
                  <span>⚡ {stats.totalScans.toLocaleString()} websites scanned</span>
                ) : (
                  <span>⚡ AI-powered security scanner</span>
                )}
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                className="hero-title font-display text-4xl sm:text-6xl md:text-7xl font-bold text-foreground leading-tight mb-6"
              >
                {lang === 'EN' ? (
                  <><span className="gradient-text">Improves security</span> by fixing common vulnerabilities.</>
                ) : (
                  <>సాధారణ దుర్బలత్వాలను సరిచేయడం ద్వారా <span className="gradient-text">భద్రతను మెరుగుపరుస్తుంది.</span></>
                )}
              </motion.h1>

              <motion.p variants={fadeUp} custom={2}
                className="hero-subtitle text-lg text-muted-foreground font-body mb-8 max-w-md mx-auto lg:mx-0"
              >
                AI-powered security scanner that finds vulnerabilities, generates server configs, and fortifies your site — no security expertise needed.
              </motion.p>

              <motion.div variants={fadeUp} custom={3}
                className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
              >
                <Button
                  onClick={() => navigate((user && !user.isAnonymous) ? '/scan' : '/signup')}
                  className="gradient-btn px-8 py-6 text-base font-display font-bold rounded-xl pulse-neon w-full sm:w-auto"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Scan Your Website Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Lock className="w-3 h-3" /> No signup required
                </span>
              </motion.div>

              {/* Trust row */}
              <motion.div variants={fadeUp} custom={4}
                className="flex items-center gap-6 mt-8 justify-center lg:justify-start"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                {stats && stats.totalUsers > 0 ? (
                  <span className="text-xs text-muted-foreground font-body">Trusted by {stats.totalUsers.toLocaleString()} digital architects</span>
                ) : (
                  <span className="text-xs text-muted-foreground font-body">Real-time AI Security Scanner</span>
                )}
              </motion.div>
            </motion.div>

            {/* Hero image */}
            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
            >
              <div className="relative group">
                <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 flex items-center justify-center float-animation border border-white/10 backdrop-blur-3xl shadow-[0_0_100px_rgba(102,126,234,0.15)]">
                    <LogoRenderer className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 drop-shadow-[0_0_35px_rgba(168,85,247,0.7)] group-hover:scale-110 transition-transform duration-500" animate={true} />
                    <Sparkles className="absolute top-1/4 right-1/4 w-8 h-8 text-primary animate-pulse opacity-50" />
                </div>
                <div className="absolute inset-0 rounded-full opacity-30 blur-3xl"
                  style={{ background: 'radial-gradient(circle, #667eea 0%, transparent 60%)' }} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="stats-section border-y border-border">
          <div className="container mx-auto px-4 py-8 grid grid-cols-3 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-item text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="font-display text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-body mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="container mx-auto px-4 py-20">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              From Vulnerable to Fortress in{' '}
              <span className="gradient-text">3 Steps</span>
            </h2>
            <p className="text-muted-foreground font-body max-w-lg mx-auto">
              No security background needed. Our AI handles the complexity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: '01', icon: Eye, title: 'Scan', desc: 'Paste your URL. Our AI checks 50+ vulnerability vectors in real-time.' },
              { step: '02', icon: Code, title: 'Generate', desc: 'Get copy-paste server configs auto-detected for your hosting platform.' },
              { step: '03', icon: ShieldCheck, title: 'Fortify', desc: 'Apply the fix, re-scan, and celebrate your A+ security score.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="glass-card-strong p-6 text-center relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-5xl font-display font-bold text-primary/10 absolute top-3 right-4">{item.step}</div>
                <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="container mx-auto px-4 py-20">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Enterprise Security,{' '}
              <span className="gradient-text">Zero Complexity</span>
            </h2>
            <p className="text-muted-foreground font-body max-w-lg mx-auto">
              Everything you need to secure your web presence, powered by AI.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card p-5 group hover:neon-border transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <feature.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display font-semibold text-foreground mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="container mx-auto px-4 py-20">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Trusted by <span className="gradient-text">Developers Worldwide</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="glass-card-strong p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 font-body mb-4 leading-relaxed">"{t.quote}"</p>
                <div>
                  <div className="font-display font-semibold text-sm text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground font-body">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-2 py-10 sm:py-20">
          <motion.div
            className="glass-card-strong neon-border p-6 sm:p-10 md:p-16 text-center max-w-3xl mx-auto w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 break-words">
              Don't Wait for a <span className="gradient-text">Breach</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-body mb-8 max-w-md mx-auto">
              90% of websites have exploitable vulnerabilities. Find and fix yours in 90 seconds — completely free.
            </p>
            <div className="flex justify-center w-full">
              <Button
                onClick={() => navigate('/scan')}
                className="gradient-btn px-4 sm:px-10 py-4 sm:py-6 text-sm sm:text-lg font-display font-bold rounded-xl pulse-neon w-full sm:w-auto overflow-hidden text-ellipsis whitespace-normal sm:whitespace-nowrap"
              >
                <Shield className="w-5 h-5 mr-1 sm:mr-2 shrink-0" />
                <span>Scan Your Website Now</span>
                <ArrowRight className="w-5 h-5 ml-1 sm:ml-2 shrink-0" />
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-6 text-[10px] sm:text-xs text-muted-foreground font-body">
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-success" /> Free forever</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> 90-second results</span>
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> No signup</span>
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border">
          <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <LogoRenderer className="w-6 h-6 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
              <span className="font-display font-semibold text-sm gradient-text">SECUREWEB AI</span>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-body uppercase tracking-tighter">
              <span>Powered by Groq Cloud AI</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>In partnership with Hackathon Secure</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] text-muted-foreground font-body uppercase tracking-[0.2em]">
               <button onClick={() => navigate('/monitoring')} className="hover:text-primary transition-colors">Monitoring</button>
               <button onClick={() => navigate('/api-docs')} className="hover:text-primary transition-colors">API</button>
               <button onClick={() => navigate('/documentation')} className="hover:text-primary transition-colors">Docs</button>
            </div>
            
            <p className="text-[10px] text-muted-foreground font-body italic opacity-50 max-w-xs text-center sm:text-right">
              “This tool performs surface-level security audits. For full penetration testing, contact a certified provider.”
            </p>

            <p className="text-xs text-muted-foreground font-body">
              © {new Date().getFullYear()} SECUREWEB AI.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
