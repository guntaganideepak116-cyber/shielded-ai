import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Globe, LogOut, Menu, X, LayoutDashboard, 
  History, Activity, Code, BookOpen, Download, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoRenderer } from '@/components/LogoRenderer';
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

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (window.deferredInstallPrompt) {
      setCanInstall(true);
    }
    const handler = (e: Event) => {
      // e.preventDefault(); // REMOVED TO ENABLE NATIVE BANNER
      (window as any).deferredInstallPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('pwaInstallReady', () => setCanInstall(true));
    window.addEventListener('appinstalled', () => setCanInstall(false));
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    const prompt = (window as any).deferredInstallPrompt;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      (window as any).deferredInstallPrompt = null;
      localStorage.setItem('pwa-installed', 'true');
    }
  };

  const navLinks = [
    { name: t('nav.docs'), path: '/documentation', icon: BookOpen },
    { name: 'FAQ', path: '/faq', icon: HelpCircle },
    { name: 'Pricing', path: '/pricing', icon: Shield },
    { name: t('nav.history'), path: '/history', icon: History },
    { name: t('dash.title'), path: '/scan', icon: LayoutDashboard },
    { name: t('nav.monitoring'), path: '/monitoring', icon: Activity },
    { name: t('nav.api'), path: '/api-docs', icon: Code },
  ];

  return (
    <>
      <nav className="navbar container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* LOGO */}
        <div className="nav-logo logo-wrapper flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/')}>
          <LogoRenderer className="logo-icon w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)] filter brightness-125" />
          <span className="logo-text font-display font-black text-sm sm:text-base md:text-xl gradient-text tracking-tighter italic uppercase whitespace-nowrap pr-3">SECUREWEB AI</span>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-[12px] font-black uppercase tracking-widest transition-all duration-300 relative group ${
                location.pathname === link.path ? 'text-primary' : 'text-slate-500 hover:text-white'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-[1px] bg-primary transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
          ))}
        </div>

        {/* RIGHT SECTION */}
        <div className="nav-right flex items-center gap-2 sm:gap-4 shrink-0">
          {/* PWA Install (Desktop) */}


          {/* Lang Toggle Removed */}

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {(user && !user.isAnonymous) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 glass-card border-white/5 p-1 pr-3 rounded-full hover:bg-white/5 transition-colors cursor-pointer">
                    <Avatar className="w-8 h-8 border border-primary/20">
                      <AvatarImage src={user.photoURL || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
                        {user.email?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{user.displayName || 'Architect'}</span>
                      <span className="text-[8px] font-bold text-success uppercase tracking-widest mt-0.5">Verified</span>
                    </div>
                  </div>
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
            ) : (
              <div className="hidden lg:flex items-center">
                <Button
                  onClick={() => navigate('/signup')}
                  className="gradient-btn text-[11px] font-black uppercase tracking-[0.2em] px-6 h-10 rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.5)] transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Hamburger (Mobile) */}
          <button 
            className="hamburger lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="menu-overlay open"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mobile-nav-menu open overflow-y-auto max-h-[100dvh] pb-24 z-[99999]"
            >
              <div className="flex flex-col gap-2 min-h-full">
                 <div className="px-4 py-6 mb-2 border-b border-white/5 bg-white/5 rounded-2xl mx-2">
                    <div className="flex items-center gap-3 mb-6 flex-nowrap overflow-hidden">
                       <LogoRenderer className="w-8 h-8 shrink-0 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                       <span className="font-display font-black text-lg gradient-text uppercase italic tracking-tighter whitespace-nowrap">SECUREWEB AI</span>
                    </div>
                    
                    {/* Lang Toggle Removed from Mobile */}
                 </div>

                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => {
                      navigate(link.path);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body transition-all ${
                      location.pathname === link.path ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </button>
                ))}

                {canInstall && (
                  <button
                    onClick={() => {
                      handleInstallClick();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-success font-bold text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Install Web App (PWA)
                  </button>
                )}

                {!user || user.isAnonymous ? (
                  <div className="mt-8 flex flex-col gap-3 px-4 pb-20">
                    <Button 
                      className="w-full h-14 rounded-2xl gradient-btn font-black uppercase tracking-[0.2em] text-xs shadow-xl"
                      onClick={() => { navigate('/signup'); setMenuOpen(false); }}
                    >
                      Get Started
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 mt-4 text-red-400 font-bold text-sm border-t border-white/5"
                  >
                    <LogOut className="w-4 h-4" />
                    De-authorize
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
