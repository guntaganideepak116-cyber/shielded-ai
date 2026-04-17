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
import { useLanguage } from '@/context/LanguageContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Footer from '@/components/Footer';

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
  const { lang, setLang, t } = useLanguage();
  const [stats, setStats] = useState<{totalScans: number, totalUsers: number, secureCount: number} | null>(null);
  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => setStats(null));
  }, []);

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
                className="font-display text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6"
              >
                {t('hero.title1')}<br />
                <span className="gradient-text">{t('hero.title2')}</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} custom={2}
                className="text-lg text-muted-foreground font-body leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10"
              >
                {t('hero.subtitle')}
              </motion.p>

              <motion.div variants={fadeUp} custom={3}
                className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <Button 
                   onClick={() => navigate('/scan')}
                   className="gradient-btn h-14 px-10 rounded-2xl text-base font-display font-bold group w-full sm:w-auto"
                >
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/documentation')}
                  className="h-14 px-10 rounded-2xl border-border hover:bg-white/5 font-display text-base w-full sm:w-auto"
                >
                  {t('nav.docs')}
                </Button>
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
              className="flex-1 flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            >
              <div className="relative group max-w-2xl w-full">
                <div className="relative z-10 glass-card-strong border-white/10 overflow-hidden rounded-[2rem] shadow-[0_0_100px_rgba(168,85,247,0.15)] transform group-hover:scale-[1.02] transition-transform duration-700">
                    <img 
                      src="/images/dashboard_hero.png" 
                      alt="SecureWeb AI Dashboard" 
                      className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Decorative glows */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="stats-section border-y border-white/5 bg-white/[0.02]">
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-3 divide-x divide-white/5">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="stat-item px-4 first:pl-0 last:pr-0 text-center sm:text-left"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="font-display text-2xl md:text-5xl font-black gradient-text tracking-tighter italic uppercase">{stat.value}</div>
                  <div className="text-[9px] md:text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">{stat.label}</div>
                </motion.div>
              ))}
            </div>
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mt-6 text-[10px] sm:text-xs text-muted-foreground font-body">
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-success" /> Free forever</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> 90-second results</span>
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
