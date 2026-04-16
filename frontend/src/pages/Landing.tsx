import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ShieldCheck, Zap, Lock, Eye, Code, ArrowRight,
  CheckCircle, Users, Star, BarChart3, Globe, Clock, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getGlobalScanCount, subscribeToCounter } from '@/lib/supabase-helpers';
import heroShield from '@/assets/hero-shield.png';

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
  { value: '90s', label: 'Average fix time' },
  { value: '50+', label: 'Security checks' },
  { value: '99.2%', label: 'Fix success rate' },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'CTO, Launchpad.io', quote: 'Went from a D- to A+ in literally 90 seconds. Our security audit passed the next day.', stars: 5 },
  { name: 'Marcus Rivera', role: 'DevOps Lead, ScaleUp', quote: 'The auto-generated configs saved our team 40+ hours of manual security hardening.', stars: 5 },
  { name: 'Priya Sharma', role: 'Founder, IndieStack', quote: 'Finally a security tool that doesn\'t require a PhD to use. Copy, paste, done.', stars: 5 },
];

const Landing = () => {
  const navigate = useNavigate();
  const [globalCount, setGlobalCount] = useState(10247);

  useEffect(() => {
    getGlobalScanCount().then(setGlobalCount);
    const unsub = subscribeToCounter(setGlobalCount);
    return unsub;
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
        <nav className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg gradient-text">SECURESHIELD AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-body hidden sm:block"
            >
              History
            </button>
            <Button
              onClick={() => navigate('/scan')}
              className="gradient-btn text-sm font-display px-5 py-2"
            >
              Start Scanning
            </Button>
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
                <span>{globalCount.toLocaleString()} websites fortified</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
              >
                Your Website Is{' '}
                <span className="gradient-text">Hackable.</span>
                <br />
                We Fix It in <span className="gradient-text">90 Seconds.</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2}
                className="text-lg text-muted-foreground font-body mb-8 max-w-md mx-auto lg:mx-0"
              >
                AI-powered security scanner that finds vulnerabilities, generates server configs, and fortifies your site — no security expertise needed.
              </motion.p>

              <motion.div variants={fadeUp} custom={3}
                className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
              >
                <Button
                  onClick={() => navigate('/scan')}
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
                <span className="text-xs text-muted-foreground font-body">4.9/5 from 2,400+ users</span>
              </motion.div>
            </motion.div>

            {/* Hero image */}
            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
            >
              <div className="relative">
                <img src={heroShield} alt="SECURESHIELD AI" className="w-64 md:w-80 lg:w-96 float-animation" />
                <div className="absolute inset-0 rounded-full opacity-30"
                  style={{ background: 'radial-gradient(circle, #667eea 0%, transparent 60%)' }} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="border-y border-border">
          <div className="container mx-auto px-4 py-8 grid grid-cols-3 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
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
        <section className="container mx-auto px-4 py-20">
          <motion.div
            className="glass-card-strong neon-border p-10 md:p-16 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Don't Wait for a <span className="gradient-text">Breach</span>
            </h2>
            <p className="text-muted-foreground font-body mb-8 max-w-md mx-auto">
              90% of websites have exploitable vulnerabilities. Find and fix yours in 90 seconds — completely free.
            </p>
            <Button
              onClick={() => navigate('/scan')}
              className="gradient-btn px-10 py-6 text-lg font-display font-bold rounded-xl pulse-neon"
            >
              <Shield className="w-5 h-5 mr-2" />
              Scan Your Website Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground font-body">
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-success" /> Free forever</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> 90-second results</span>
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> No signup</span>
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border">
          <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold text-sm gradient-text">SECURESHIELD AI</span>
            </div>
            <p className="text-xs text-muted-foreground font-body">
              © {new Date().getFullYear()} SECURESHIELD AI. Fortifying the web, one site at a time.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
