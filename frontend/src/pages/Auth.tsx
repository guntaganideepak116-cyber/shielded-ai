import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Github, Mail, Lock, ArrowLeft, Loader2, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        toast.success('Welcome back!');
      } else {
        await registerWithEmail(email, password);
        toast.success('Account created successfully!');
      }
      navigate('/scan');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'google') => {
    setLoading(true);
    try {
      if (provider === 'google') await signInWithGoogle();
      toast.success('Signed in with Google');
      navigate('/scan');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Social sign-in failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(231, 84%, 66%) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(270, 50%, 50%) 0%, transparent 70%)' }} />

      {/* Left Side: Branding & Social Proof (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-muted/30 border-r border-white/5 relative z-10">
        <motion.button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-body">Back to website</span>
        </motion.button>

        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-primary" />
            <span className="font-display font-bold text-2xl gradient-text">SECUREWEB AI</span>
          </div>
          
          <h2 className="font-display text-4xl font-bold text-foreground mb-6 leading-tight">
            Security hardening shouldn't be a <span className="gradient-text">full-time job.</span>
          </h2>
          
          <div className="space-y-4 mb-12">
            {[
              "Real-time vulnerability detection",
              "Auto-generated server configurations",
              "Continuous security monitoring",
              "Enterprise-grade reporting"
            ].map((feature, i) => (
              <motion.div 
                key={i}
                className="flex items-center gap-3 text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-body text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="glass-card-strong p-6 rounded-2xl border-white/5">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-sm text-foreground/80 italic font-body mb-4">
              "We secured our entire infrastructure in less than 2 minutes. The most intuitive security tool I've used."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">JD</div>
              <div>
                <div className="text-xs font-bold font-display">James Duncan</div>
                <div className="text-[10px] text-muted-foreground">CTO at GrowthScale</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} SECUREWEB AI. All rights reserved.
        </p>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
          className="w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="lg:hidden text-center mb-12">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-display font-bold text-3xl gradient-text">SECUREWEB AI</h1>
          </div>

          <div className="mb-10">
            <h2 className="font-display text-3xl font-bold mb-2">
              {isLogin ? 'Sign In' : 'Get Started'}
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              {isLogin ? 'Welcome back to your security dashboard.' : 'Start securing your websites today.'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <Button 
              onClick={() => handleSocial('google')}
              variant="outline"
              className="w-full py-6 glass-card hover:bg-white/5 border-white/10 font-display font-semibold transition-all relative overflow-hidden group"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-3" alt="Google" />
              Continue with Google
            </Button>
          </div>

          <div className="relative mb-8 text-center">
            <span className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
            <span className="relative bg-background px-4 text-[10px] text-muted-foreground uppercase tracking-widest">
              Or use your email
            </span>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground ml-1">Email</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50"
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground ml-1">Password</label>
                {isLogin && <button type="button" className="text-[10px] text-primary hover:underline">Forgot?</button>}
              </div>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50"
                required
              />
            </div>
            <Button 
              type="submit"
              className="w-full py-6 gradient-btn text-lg font-display font-bold rounded-xl shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground font-body">
            {isLogin ? "New to SecureShield?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-primary hover:underline font-bold"
            >
              {isLogin ? 'Create one now' : 'Sign in instead'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
