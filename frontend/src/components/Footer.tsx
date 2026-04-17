import { LogoRenderer } from '@/components/LogoRenderer';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="border-t border-white/5 bg-background relative z-20 overflow-hidden">
      <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <LogoRenderer className="w-8 h-8 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          <span className="font-display font-black text-xl tracking-tighter gradient-text uppercase italic pr-4">SECUREWEB AI</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
           <button onClick={() => navigate('/scan')} className="hover:text-primary transition-colors">Start Scan</button>
           <button onClick={() => navigate('/documentation')} className="hover:text-primary transition-colors">Docs</button>
           <button onClick={() => navigate('/faq')} className="hover:text-primary transition-colors">FAQ</button>
           <button onClick={() => navigate('/pricing')} className="hover:text-primary transition-colors">Plans</button>
        </div>

        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          © 2026 Secureweb AI. <span className="hidden sm:inline">Autonomous Cloud Security.</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
