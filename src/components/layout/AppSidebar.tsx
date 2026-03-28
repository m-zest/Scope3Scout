import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { useDemoMode } from '@/App';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload Suppliers', icon: Upload },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface AppSidebarProps {
  userEmail?: string;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { isDemoMode, exitDemoMode } = useDemoMode();

  const handleLogout = async () => {
    if (isDemoMode) {
      exitDemoMode();
      navigate('/');
    } else {
      await supabase.auth.signOut();
      navigate('/auth');
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col min-h-screen m-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-60'
      )}
    >
      {/* Logo */}
      <NavLink to="/" className="h-16 flex items-center px-5 border-b border-white/[0.04] shrink-0 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          <Logo size={28} className="shrink-0" />
          {!collapsed && (
            <span className="font-heading font-semibold text-[15px] tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent block truncate">
              Scope3Scout
            </span>
          )}
        </div>
      </NavLink>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-0.5 mt-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-white/[0.05] text-white'
                  : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Glowing left border for active */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              )}
              <item.icon className={cn('h-[17px] w-[17px] shrink-0', isActive && 'text-cyan-400')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2.5 border-t border-white/[0.04] space-y-0.5">
        {/* Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-neutral-600 hover:bg-white/[0.03] hover:text-neutral-400 transition-colors w-full"
        >
          {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Demo mode badge */}
        {isDemoMode && !collapsed && (
          <div className="px-3 py-1.5 mx-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider text-center">Demo Mode</p>
          </div>
        )}

        {/* User email */}
        {userEmail && !collapsed && (
          <p className="px-3 py-1 text-[11px] text-neutral-600 truncate">{userEmail}</p>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-neutral-600 hover:bg-red-500/[0.08] hover:text-red-400 transition-colors w-full"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
