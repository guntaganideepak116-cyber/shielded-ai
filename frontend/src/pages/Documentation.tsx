import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, Shield, ShieldAlert, Award, FileCode, CheckCircle2,
  ChevronRight, ArrowRight, Menu, X, Info, Globe, Activity, Cpu, Lock, AlertTriangle
} from 'lucide-react';
import { LogoRenderer } from '@/components/LogoRenderer';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DOCS_NAV = [
  { id: 'getting-started', title: 'Getting Started', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'how-it-works', title: 'How Scanning Works', icon: <Cpu className="w-4 h-4" /> },
  { id: 'understanding-score', title: 'Understanding Your Score', icon: <Shield className="w-4 h-4" /> },
  { id: 'vulnerability-types', title: 'Vulnerability Types', icon: <ShieldAlert className="w-4 h-4" /> },
  { id: 'fix-recommendations', title: 'Fix Recommendations', icon: <FileCode className="w-4 h-4" /> },
  { id: 'faq', title: 'FAQ', icon: <Info className="w-4 h-4" /> }
];

const VULNS = [
  { name: 'Missing CSP', risk: 'HIGH', desc: 'Content Security Policy (CSP) headers tell the browser which sources are trusted for executable scripts.', fix: 'Add a Content-Security-Policy header using meta tags or server config.' },
  { name: 'Missing XSS Protection', risk: 'MEDIUM', desc: 'Prevents the browser from loading pages when reflected cross-site scripting (XSS) is detected.', fix: 'Set X-XSS-Protection: 1; mode=block in your server.' },
  { name: 'Insecure Cookies', risk: 'HIGH', desc: 'Cookies without Secure or HttpOnly flags can be intercepted or manipulated by scripts.', fix: 'Add Secure; HttpOnly; SameSite=Strict to your Set-Cookie headers.' },
  { name: 'HSTS Disabled', risk: 'CRITICAL', desc: 'HTTP Strict Transport Security (HSTS) ensures browsers only interact with your site over HTTPS.', fix: 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains.' }
];

const Documentation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const filteredNav = useMemo(() => 
    DOCS_NAV.filter(nav => nav.title.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body selection:bg-primary/30">

      <div className="flex max-w-[1440px] mx-auto">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/50 border-r border-white/5 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} pt-24 md:pt-20 px-6 safe-padding-bottom`}>
          <div className="mb-8 space-y-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                   placeholder="Search docs..." 
                   value={search} onChange={e => setSearch(e.target.value)}
                   className="h-10 bg-slate-950 border-white/10 pl-10 text-xs font-medium"
                />
             </div>
          </div>
          
          <nav className="space-y-1">
             {filteredNav.map(nav => (
                <button 
                  key={nav.id} 
                  onClick={() => setActiveSection(nav.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${activeSection === nav.id ? 'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-lg shadow-primary/5' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
                >
                   <span className={`${activeSection === nav.id ? 'text-primary' : 'text-slate-600 group-hover:text-slate-400'}`}>{nav.icon}</span>
                   <span className="truncate">{nav.title}</span>
                </button>
             ))}
          </nav>

          <div className="mt-12 p-6 glass-card border-primary/10 bg-primary/5">
             <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Community Hub</p>
             <p className="text-[11px] leading-relaxed text-slate-400 mb-4 font-medium italic">Join 500+ security researchers in the SecureWeb AI discourse.</p>
             <Button variant="link" className="p-0 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white">Join Discord <ArrowRight className="w-3 h-3 ml-1.5" /></Button>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
           <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Content */}
        <main className="flex-1 p-8 md:p-16 lg:p-24 overflow-y-auto max-w-4xl mx-auto min-h-screen pt-24 md:pt-32">
           <AnimatePresence mode="wait">
              {activeSection === 'getting-started' && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                    <div className="space-y-4">
                       <h2 className="text-4xl lg:text-6xl font-display font-black tracking-tighter uppercase italic leading-none mb-4">First-Response Security</h2>
                       <p className="text-xl text-slate-400 font-medium font-body leading-relaxed max-w-2xl">
                         SecureWeb AI is an autonomous auditing engine designed to detect over 50+ critical web vulnerabilities in under 10 seconds.
                       </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                       <div className="glass-card p-8 border-white/5 space-y-4 bg-slate-900/30 hover:border-primary/20 transition-all cursor-pointer group">
                          <CheckCircle2 className="w-6 h-6 text-success" />
                          <h3 className="text-xl font-display font-black uppercase italic tracking-tighter">Instant Audits</h3>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed italic">Enter any URL and receive a deep-packet analysis of the site's external security perimeter.</p>
                       </div>
                       <div className="glass-card p-8 border-white/5 space-y-4 bg-slate-900/30 hover:border-primary/20 transition-all cursor-pointer group">
                          <Activity className="w-6 h-6 text-primary" />
                          <h3 className="text-xl font-display font-black uppercase italic tracking-tighter">AI Remediation</h3>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed italic">Get platform-specific (Nginx, Apache, Node) security patches generated by our proprietary AI model.</p>
                       </div>
                    </div>

                    <div className="space-y-8 pt-12 border-t border-white/5">
                       <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter">The SecureWeb Lifecycle</h3>
                       <div className="space-y-8">
                          {[
                             { step: '01', title: 'Target Identification', desc: 'Input your domain into the scanner. We support React, Next.js, WordPress, and raw HTML stacks.' },
                             { step: '02', title: 'Deep Packet Inspection', desc: 'Our bots verify SSL health, probe security headers, and query global threat databases.' },
                             { step: '03', title: 'Autonomous Repair', desc: 'Deploy generated patches directly to your server config to instantly raise your score.' }
                          ].map(item => (
                             <div key={item.step} className="flex gap-6 items-start">
                                <span className="text-2xl font-black text-primary/30 font-display italic">{item.step}</span>
                                <div>
                                   <h4 className="text-lg font-black uppercase mb-1">{item.title}</h4>
                                   <p className="text-sm text-slate-500 font-medium max-w-xl">{item.desc}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </motion.div>
              )}

              {activeSection === 'vulnerability-types' && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                    <div className="space-y-3">
                       <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter">Threat Catalog</h2>
                       <p className="text-lg text-slate-500 font-bold uppercase tracking-widest text-[10px]">Active Vector Analysis</p>
                    </div>

                    <div className="grid gap-6">
                       {VULNS.map(v => (
                          <div key={v.name} className="glass-card p-8 border-white/5 space-y-6">
                             <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-display font-black italic tracking-tighter">{v.name}</h3>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${v.risk === 'HIGH' ? 'bg-destructive/20 text-destructive border-destructive/20' : v.risk === 'CRITICAL' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'} border`}>{v.risk} RISK</span>
                             </div>
                             <div className="space-y-4">
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Vector Analysis</p>
                                   <p className="text-sm text-slate-400 leading-relaxed font-medium italic">{v.desc}</p>
                                </div>
                                <div className="space-y-2">
                                   <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Recommended Fix</p>
                                   <code className="block p-4 bg-slate-900 rounded-xl border border-white/5 text-xs text-primary font-mono group hover:bg-slate-800 transition-colors cursor-pointer">
                                      {v.fix}
                                   </code>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              )}

              {activeSection === 'understanding-score' && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                    <div className="space-y-3">
                       <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter">Scoring Algorithm</h2>
                       <p className="text-lg text-slate-500 font-black tracking-[0.4em] text-[10px] uppercase">Engine Version: 5.2 (Quantum)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {[
                          { range: '90-100', status: 'SECURE', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
                          { range: '70-89', status: 'MODERATE', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
                          { range: '0-69', status: 'CRITICAL', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' }
                       ].map(grade => (
                          <div key={grade.range} className={`p-8 rounded-3xl border ${grade.border} ${grade.bg} space-y-4 text-center`}>
                             <span className="text-3xl font-black font-display italic leading-none">{grade.range}</span>
                             <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${grade.color}`}>{grade.status}</p>
                          </div>
                       ))}
                    </div>

                    <div className="glass-card p-10 border-white/5 space-y-8 bg-slate-900/50">
                       <h3 className="text-xl font-display font-black uppercase italic tracking-tighter">Point Deduction Protocol</h3>
                       <div className="space-y-6">
                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                             <div>
                                <p className="font-bold text-sm">Expired SSL Certificate</p>
                                <p className="text-[10px] text-slate-500 uppercase font-medium">Automatic protocol isolation</p>
                             </div>
                             <span className="text-destructive font-black">-40 Points</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                             <div>
                                <p className="font-bold text-sm">VirusTotal Red Flag</p>
                                <p className="text-[10px] text-slate-500 uppercase font-medium">Malicious reputation detected</p>
                             </div>
                             <span className="text-destructive font-black">-35 Points</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                             <div>
                                <p className="font-bold text-sm">Missing Security Header</p>
                                <p className="text-[10px] text-slate-500 uppercase font-medium">Standard compliance failure (HSTS/CSP)</p>
                             </div>
                             <span className="text-primary font-black">-10-15 Points</span>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              )}

              {activeSection === 'how-it-works' && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                    <div className="space-y-6">
                       <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter leading-none">Internal Architecture</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <div className="flex items-center gap-2 mb-4">
                                <Globe className="w-5 h-5 text-primary" />
                                <h3 className="text-sm font-black uppercase italic tracking-widest">Network Analysis</h3>
                             </div>
                             <p className="text-[11px] leading-relaxed text-slate-500 font-medium italic">
                                SECUREWEB nodes simulate real user traffic from globally distributed data centers to audit your server's initial response handshake.
                             </p>
                          </div>
                          <div className="space-y-4">
                             <div className="flex items-center gap-2 mb-4">
                                <Cpu className="w-5 h-5 text-success" />
                                <h3 className="text-sm font-black uppercase italic tracking-widest">Heuristic Engine</h3>
                             </div>
                             <p className="text-[11px] leading-relaxed text-slate-500 font-medium italic">
                                Our AI heuristics go beyond static analysis, predicting how vulnerabilities might be chained together for a full exploit.
                             </p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="glass-card p-12 bg-primary/5 border-primary/20 text-center space-y-4">
                       <Lock className="w-12 h-12 text-primary mx-auto mb-2" />
                       <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter">Privacy First Data Policy</h3>
                       <p className="text-xs text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
                          We never store scan results for unscoped domains. Only verified owners who activate monitoring have their security history archived in our encrypted Firestore clusters.
                       </p>
                    </div>
                 </motion.div>
              )}

              {activeSection === 'faq' && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                    <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter">Operational FAQ</h2>
                    <div className="space-y-4">
                       {[
                         { q: "Is this a real scanner?", a: "Yes. Every scan executes a real-time HTTP probe verify headers, SSL certificates, and reputation via VirusTotal v3 API." },
                         { q: "What APIs do you use?", a: "We integrate with VirusTotal for URL reputation, Groq/Anthropic for AI remediation logic, and Resend for PDF report delivery." },
                         { q: "Can I scan any website?", a: "To ensure ethical usage, deep-penetration scans require domain verification. Basic header audits are open to all URLs." },
                         { q: "Is my private data stored?", a: "No. We do not store sensitive server information. Our scanner only audits external, public-facing signals." }
                       ].map(faq => (
                          <div key={faq.q} className="p-8 glass-card border-white/5 hover:bg-slate-900/50 transition-all cursor-pointer group">
                             <h4 className="text-lg font-black uppercase mb-3 flex items-center justify-between">
                                {faq.q} <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                             </h4>
                             <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{faq.a}</p>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Documentation;
