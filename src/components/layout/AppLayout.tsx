import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  userEmail?: string;
}

export function AppLayout({ userEmail }: AppLayoutProps) {
  const location = useLocation();

  // Page title mapping
  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/upload': 'Upload Suppliers',
    '/reports': 'Reports',
    '/alerts': 'Alerts',
    '/settings': 'Settings',
  };

  const pageTitle = pageTitles[location.pathname] || '';
  const isSupplierDetail = location.pathname.startsWith('/supplier/');

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppSidebar userEmail={userEmail} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            {isSupplierDetail ? (
              <nav className="text-sm text-slate-400 flex items-center gap-1.5">
                <a href="/dashboard" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Dashboard</a>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-foreground font-medium">Supplier Detail</span>
              </nav>
            ) : (
              <h1 className="font-heading text-lg font-semibold text-foreground">{pageTitle}</h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-400 cursor-default">
              <kbd className="font-mono text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">Ctrl</kbd>
              <kbd className="font-mono text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">K</kbd>
              <span className="ml-1">Search</span>
            </div>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
