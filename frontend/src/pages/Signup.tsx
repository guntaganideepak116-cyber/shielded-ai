import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, Users, CheckCircle, Star, Sparkles, Loader2, ArrowRight, ShieldAlert, Award, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const PasswordStrength = ({ password }: { password: string }) => {
  const score = useMemo(() => {
    let s = 0;
    if (password.length > 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const colors = ['bg-red-500/30', 'bg-orange-500/30', 'bg-yellow-500/30', 'bg-green-500/30', 'bg-primary'];
  const labels = ['WEAK', 'FAIR', 'GOOD', 'STRONG', 'ELITE'];

  if (!password) return null;

  return (
    <div className="space-y-1.5 px-1">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Strength</span>
        <span className={`text-[9px] font-black uppercase tracking-widest ${score >= 3 ? 'text-primary' : 'text-white/40'}`}>
          {labels[score]}
        </span>
      </div>
      <div className="flex gap-1 h-1">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-full transition-all duration-500 ${i < score ? colors[score] : 'bg-white/5'}`} 
          />
        ))}
      </div>
    </div>
  );
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { user, registerWithEmail, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    teamName: ''
  });

  // Auto-redirect if Google sign-in succeeds but its promise gets stuck
  useEffect(() => {
    if (user && !user.isAnonymous) {
      toast.success('Identity Verified. Redirecting to Command Center...');
      navigate('/scan');
    }
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerWithEmail(formData.email, formData.password, formData.name);
      toast.success('Access Initialized. Profile Synchronized.');
      navigate('/scan');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Initialization sequence interrupted.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const PERKS = [
    { icon: <ShieldAlert className="w-4 h-4 text-primary" />, title: "Unlimited Scans", desc: "No limits on security audits" },
    { icon: <Users className="w-4 h-4 text-purple-400" />, title: "Team Collab", desc: "Share findings with your squad" },
    { icon: <Headphones className="w-4 h-4 text-pink-400" />, title: "Priority Support", desc: "Direct line to our security team" },
    { icon: <Award className="w-4 h-4 text-yellow-400" />, title: "Custom Badges", desc: "Twitter ready security scores" }
  ];

  return (
    <div className="min-h-screen auth-mesh flex flex-col lg:flex-row relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />

      {/* Left Column: Branding (Hidden on small screens) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 bg-black/20 border-r border-white/5 relative z-10">
        <div>
          <motion.div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group w-fit"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Shield className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(102,126,234,0.4)] transition-transform group-hover:scale-110" />
            <span className="font-display font-black text-2xl tracking-tighter gradient-text">SECUREWEB AI</span>
          </motion.div>
        </div>

        <div className="max-w-md">
          <motion.h2 
            className="font-display text-5xl font-black text-white/90 mb-6 leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Join <span className="gradient-text">15K+ teams</span> securing their future.
          </motion.h2>
          
          <div className="grid grid-cols-2 gap-6 mt-12 mb-12">
            {PERKS.map((perk, i) => (
              <motion.div 
                key={i}
                className="glass-card p-5 border-white/5 hover:border-primary/20 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <div className="mb-3 bg-white/5 w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {perk.icon}
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white/80 mb-1">{perk.title}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="glass-card-strong p-6 border-white/5 rounded-2xl flex gap-4 items-center">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0c0a09] bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                  {['JD', 'SM', 'RK', 'AL'][i]}
                </div>
              ))}
            </div>
            <div className="text-[10px] text-white/50 font-body">
              <span className="text-white font-bold">Trusted by global leaders</span> <br /> 
              Vercel, Railway, and 12,000+ others.
            </div>
          </div>
        </div>

        <div className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} Enterprise Grade Protection
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-10">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-display font-black text-3xl gradient-text tracking-tighter">SECUREWEB AI</h1>
          </div>

          <div className="mb-10">
            <h3 className="font-display text-4xl font-black mb-2 tracking-tight">Access Initialized.</h3>
            <p className="text-white/40 font-body text-sm">Secure your terminal and start protecting.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="text" 
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="pl-10 h-12 bg-white/[0.03] border-white/10 rounded-2xl font-body text-sm text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Team (Opt)</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="text" 
                    placeholder="Ops"
                    value={formData.teamName}
                    onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                    className="pl-10 h-12 bg-white/[0.03] border-white/10 rounded-2xl font-body text-sm text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  type="email" 
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10 h-12 bg-white/[0.03] border-white/10 rounded-2xl font-body text-sm text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-10 h-12 bg-white/[0.03] border-white/10 rounded-2xl font-body text-sm text-white"
                  required
                />
              </div>
              <PasswordStrength password={formData.password} />
            </div>

            <Button 
              type="submit"
              className="w-full h-14 neon-purple-btn rounded-2xl font-display font-black text-lg mt-4"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "DEPLOY PROFILE →"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
            <Button 
              onClick={() => signInWithGoogle()}
              variant="outline"
              className="w-full h-12 bg-white/[0.02] border-white/10 rounded-xl font-bold font-body text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-3"
              disabled={loading}
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Quick Join with Google
            </Button>
          </div>

          <p className="mt-10 text-center text-xs text-white/30 font-body">
            Already authorized? 
            <Link to="/login" className="ml-2 text-primary hover:underline font-black uppercase tracking-wider text-[10px]">Sign In Instead →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
