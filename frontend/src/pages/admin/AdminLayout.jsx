
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  MessageSquare, 
  ShieldAlert, 
  BarChart3, 
  Settings,
  ExternalLink,
  LogOut,
  Clock
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin',              icon: LayoutDashboard, label: 'Overview'          },
  { path: '/admin/live',         icon: Activity,        label: 'Live Feed'         },
  { path: '/admin/users',        icon: Users,           label: 'User Management'   },
  { path: '/admin/messages',     icon: MessageSquare,   label: 'Communications'    },
  { path: '/admin/vulnerabilities',icon: ShieldAlert,     label: 'Threat Intel'      },
  { path: '/admin/analytics',    icon: BarChart3,       label: 'Platform Analytics'},
  { path: '/admin/settings',     icon: Settings,        label: 'System Settings'   },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-bg min-h-screen flex">
      {/* 🔮 GLASS SIDEBAR */}
      <aside className="admin-sidebar-glass w-72 h-screen sticky top-0 flex flex-col z-50">
        <div className="p-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00f5ff] to-[#8b5cf6] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.3)]">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">SECUREWEB</span>
          </div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#f43f5e]/10 border border-[#f43f5e]/20 rounded-md">
            <span className="w-1.5 h-1.5 bg-[#f43f5e] rounded-full animate-pulse" />
            <span className="text-[#f43f5e] text-[10px] font-bold uppercase tracking-widest">Admin Command</span>
          </div>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#00f5ff]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
              <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=0d1117&color=94a3b8`} alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter truncate">Verified Operator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-500 rounded-xl transition-all text-xs font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* 🚀 MAIN INTERFACE */}
      <main className="flex-1 min-h-screen flex flex-col">
        <header className="admin-top-bar h-20 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex flex-col">
            <h2 className="text-white font-semibold text-lg">
              {NAV_ITEMS.find(n => n.path === (location.pathname === '/admin' ? '/admin' : location.pathname))?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
               <span className="font-mono">{location.pathname.replace('/admin', 'ROOT / ADMIN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <Clock className="w-4 h-4 text-[#00f5ff]" />
              <span className="text-white font-mono text-sm font-bold tracking-widest uppercase">
                {time.toLocaleTimeString([], { hour12: false })}
              </span>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-[#10b981]/10 rounded-full border border-[#10b981]/20">
              <div className="admin-dot-live" />
              <span className="text-[#10b981] text-[11px] font-bold uppercase tracking-widest">Channel Active</span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00f5ff]/10 to-[#8b5cf6]/10 hover:from-[#00f5ff]/20 hover:to-[#8b5cf6]/20 border border-white/10 hover:border-[#00f5ff]/30 text-white text-xs font-semibold rounded-full transition-all"
            >
              Public Site
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        <div className="p-10 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
