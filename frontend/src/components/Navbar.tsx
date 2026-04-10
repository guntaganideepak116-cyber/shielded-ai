import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Globe, LogOut, Menu, X, LayoutDashboard, 
  History, Activity, Code, BookOpen, Download
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
      e.preventDefault();
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
    const prompt = window.deferredInstallPrompt;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      localStorage.setItem('pwa-installed', 'true');
    }
  };

  const navLinks = [
    { name: t('nav.docs'), path: '/documentation', icon: BookOpen },
    { name: t('nav.history'), path: '/history', icon: History },
    { name: t('dash.title'), path: '/scan', icon: LayoutDashboard },
    { name: t('nav.monitoring'), path: '/monitoring', icon: Activity },
    { name: t('nav.api'), path: '/api-docs', icon: Code },
  ];

  return (
    <>
      <nav className="navbar container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* LOGO */}
        <div className="nav-logo logo-wrapper flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <LogoRenderer className="logo-icon w-8 h-8 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <span className="logo-text font-display font-bold text-lg sm:text-xl gradient-text text-nowrap leading-tight">SECUREWEB AI</span>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-xs font-body transition-colors ${
                location.pathname === link.path ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* RIGHT SECTION */}
        <div className="nav-right flex items-center gap-2 sm:gap-3 shrink-0">
          {/* PWA Install (Desktop only) */}
          {canInstall && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleInstallClick}
              className="hidden lg:flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10 h-8 text-[11px] font-bold uppercase tracking-wider"
            >
              <Download className="w-3.5 h-3.5" />
              {t('mon.add')}
            </Button>
          )}

          {/* Lang Toggle */}
          <button
            onClick={() => setLang(lang === 'EN' ? 'TE' : 'EN')}
            className="px-2 py-1 rounded bg-white/5 border border-white/10 text-primary hover:bg-white/10 transition-all font-display text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 min-w-[120px] sm:min-w-[140px] justify-center h-8"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-white/80">{lang === 'EN' ? 'ENGLISH' : 'తెలుగు'}</span>
            <span className="text-primary/40 mx-0.5">/</span>
            <span>{lang === 'EN' ? 'తెలుగు' : 'ENGLISH'}</span>
          </button>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {(user && !user.isAnonymous) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="user-avatar w-8 h-8 border border-white/10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
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
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-xs font-display px-3 h-8 hover:bg-white/5"
                >
                  {t('nav.signin')}
                </Button>
                <div className="flex flex-col items-center">
                   <div className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em] mb-0.5">{t('common.beta')}</div>
                   <Button
                     onClick={() => navigate('/signup')}
                     className="gradient-btn text-xs font-display px-4 h-8"
                   >
                     {t('hero.cta')}
                   </Button>
                </div>
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
              className="mobile-nav-menu open"
            >
              <div className="flex flex-col gap-2">
                <div className="px-4 py-2 mb-4 border-b border-white/5">
                   <div className="flex items-center gap-2 mb-4">
                      <LogoRenderer className="w-6 h-6" />
                      <span className="font-display font-bold text-sm gradient-text">SECUREWEB AI</span>
                   </div>
                   <button
                      onClick={() => {
                        setLang(lang === 'EN' ? 'TE' : 'EN');
                        setMenuOpen(false);
                      }}
                      className="w-full text-left py-2 text-xs text-primary font-bold flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      {lang === 'EN' ? 'SWITCH TO తెలుగు' : 'SWITCH TO ENGLISH'}
                    </button>
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
                  <div className="mt-4 grid grid-cols-2 gap-2 px-4">
                    <Button variant="outline" size="sm" onClick={() => { navigate('/login'); setMenuOpen(false); }}>Login</Button>
                    <Button className="gradient-btn" size="sm" onClick={() => { navigate('/signup'); setMenuOpen(false); }}>Join</Button>
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
