import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Crown, Rocket, ArrowRight, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/pricingConfig';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleUpgrade = async (planKey: string) => {
    if (!user || user.isAnonymous) {
      toast.error("Please login to upgrade");
      navigate('/login');
      return;
    }

    if (planKey === 'free') return;

    setLoading(planKey);
    try {
      const res = await fetch('/api/user/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, plan: planKey })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully upgraded to ${planKey.toUpperCase()} plan!`);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Upgrade failed");
    } finally {
      setLoading(null);
    }
  };

  const getIcon = (key: string) => {
    switch (key) {
      case 'free': return <Rocket className="w-6 h-6 text-[#00ff88]" />;
      case 'pro': return <Zap className="w-6 h-6 text-[#00d4ff]" />;
      case 'enterprise': return <Crown className="w-6 h-6 text-[#7c3aed]" />;
      default: return <Shield className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body pb-20 pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest"
          >
            Flexible Security Tiers
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic"
          >
            Scale Your <span className="gradient-text">Fortress</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-medium uppercase tracking-tight"
          >
            Choose the level of intelligence required to protect your digital perimeter.
            Real-time scanning, AI fixes, and autonomous monitoring.
          </motion.p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(PLANS as any).map(([key, plan]: [string, any], idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`relative glass-card p-1 border-white/5 flex flex-col h-full group ${key === 'pro' ? 'border-primary/30 ring-1 ring-primary/20' : ''}`}
            >
              {key === 'pro' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-[0_4px_20px_rgba(0,212,255,0.4)]">
                  Most Popular
                </div>
              )}
              
              <div className="bg-slate-900/50 rounded-[28px] p-8 flex-1 flex flex-col space-y-8">
                {/* Plan Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                      {getIcon(key)}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{plan.badge}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-black tracking-tight uppercase italic">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display font-black">${plan.price}</span>
                      <span className="text-slate-500 text-xs font-bold font-body">/MO</span>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-white/5 w-full" />

                {/* Features */}
                <ul className="space-y-4 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm group/item">
                      <div className="mt-1 p-0.5 rounded-full bg-success/10 text-success">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-slate-300 font-medium tracking-tight group-hover/item:text-white transition-colors">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded?.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm opacity-30 grayscale">
                      <div className="mt-1 p-0.5 rounded-full bg-white/10 text-white">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                      <span className="text-slate-500 font-medium tracking-tight line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action */}
                <Button 
                  onClick={() => handleUpgrade(key)}
                  disabled={loading === key || (key === 'free')}
                  className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest gap-2 transition-all ${
                    key === 'pro' 
                      ? 'bg-primary text-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]' 
                      : key === 'enterprise'
                      ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                      : 'bg-transparent text-slate-500 border border-white/5'
                  }`}
                >
                  {loading === key ? <Loader2 className="w-4 h-4 animate-spin" /> : key === 'free' ? 'CURRENT_PLAN' : `ACTIVATE_${plan.name.toUpperCase()}`}
                  {key !== 'free' && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ / Trust */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="text-center space-y-8 pt-12"
        >
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Trusted by Security Teams Globally</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 grayscale">
             {['NETSEC', 'FORTRESS', 'SENTINEL', 'VAULT', 'ARMOR'].map(l => (
               <span key={l} className="font-display font-black text-xl italic tracking-tighter">{l}</span>
             ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Pricing;
