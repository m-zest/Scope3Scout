import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

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
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <aside
      className={cn(
        'flex flex-col min-h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Shield className="h-6 w-6 text-emerald-500 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-heading font-bold text-sm text-foreground block truncate">Scope3Scout</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-emerald-600 dark:text-emerald-400')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-full"
        >
          {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-full"
          title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
        </button>

        {/* User email */}
        {userEmail && !collapsed && (
          <p className="px-3 py-1 text-xs text-slate-400 dark:text-slate-500 truncate">
            {userEmail}
          </p>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
