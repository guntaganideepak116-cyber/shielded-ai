import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, loginWithEmail, sendMagicLink } = useAuth();
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Access Granted. Welcome to the Command Center.');
      navigate('/scan');
    } catch (error: any) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      toast.error(error.message || 'Authentication sequence failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Identity required (Email) for Magic Link generation.');
      return;
    }
    setMagicLoading(true);
    try {
      await sendMagicLink(email);
      toast.success('Magic link transmitted to your terminal.');
    } catch (error: any) {
      toast.error('Transmission failed. Inspect your network.');
    } finally {
      setMagicLoading(false);
    }
  };

  const handleSocial = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Google Identity Verified.');
      navigate('/scan');
    } catch (error: any) {
      toast.error('Identity verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-mesh flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass-card border-white/5 float-animation text-[10px] uppercase tracking-widest font-bold text-primary">
            <Sparkles className="w-3 h-3" />
            <span>15K+ sites protected by AI</span>
          </div>
          <h1 className="font-display text-5xl font-black mb-2 flex items-center justify-center gap-3">
            <Shield className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(102,126,234,0.5)]" />
            <span className="gradient-text tracking-tighter">SECURESHIELD AI</span>
          </h1>
          <p className="text-white/50 font-body text-sm">Enterprise Identity Verification</p>
        </motion.div>

        <motion.div
          className="glass-saas-card p-10 rounded-[2.5rem] relative overflow-hidden group"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={errorShake ? { x: [-10, 10, -10, 10, 0], opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
        >
          {/* Subtle Inner Glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Terminal ID (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  type="email" 
                  placeholder="agent@secureshield.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-primary/40 focus:border-primary/40 transition-all font-body text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Access Key (Password)</label>
                <Link to="/reset-password" title="reset-password"  className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider">Recover Key</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-primary/40 focus:border-primary/40 transition-all font-body text-white"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full h-14 neon-purple-btn rounded-2xl font-display font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group overflow-hidden"
              disabled={loading}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    LOGIN SECURELY
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
            <button 
              onClick={handleMagicLink}
              disabled={magicLoading}
              className="w-full h-12 glass-card hover:bg-white/5 border-white/5 rounded-xl text-xs font-bold font-body text-white/70 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {magicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-yellow-400" />}
              ✨ Send passwordless magic link
            </button>

            <Button 
              onClick={handleSocial}
              variant="outline"
              className="w-full h-12 bg-white/[0.02] border-white/10 rounded-xl font-bold font-body text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              disabled={loading}
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Continue with Federal Identity (Google)
            </Button>
          </div>
        </motion.div>

        <motion.p 
          className="mt-10 text-center text-sm text-white/30 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Need a security terminal? 
          <Link to="/signup" className="ml-2 text-primary hover:underline font-black uppercase tracking-wider text-[11px]">Create Free Account →</Link>
        </motion.p>
      </div>

      {/* RTL / Language Footer */}
      <div className="absolute bottom-8 flex gap-6 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] font-body">
        <button className="hover:text-primary transition-colors">English</button>
        <button className="hover:text-primary transition-colors">Telugu</button>
        <button className="hover:text-primary transition-colors">Hindi</button>
      </div>
    </div>
  );
};

export default LoginPage;
