import { Outlet, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  userEmail?: string;
}

export function AppLayout({ userEmail }: AppLayoutProps) {
  const location = useLocation();

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
    <div
      className="flex min-h-screen bg-[#030303]"
      style={{
        backgroundImage: 'linear-gradient(to right, rgba(128,128,128,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.03) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <AppSidebar userEmail={userEmail} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 flex items-center justify-between px-8 border-b border-white/[0.04] bg-black/40 backdrop-blur-2xl sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            {isSupplierDetail ? (
              <nav className="text-[13px] text-neutral-600 flex items-center gap-1.5">
                <a href="/dashboard" className="hover:text-neutral-400 transition-colors">Dashboard</a>
                <span className="text-neutral-700">/</span>
                <span className="text-white font-medium">Supplier Detail</span>
              </nav>
            ) : (
              <h1 className="font-heading text-sm font-semibold text-white tracking-tight">{pageTitle}</h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[12px] text-neutral-500 cursor-default">
              <Search className="h-3.5 w-3.5 text-neutral-600" />
              <span>Search Suppliers</span>
              <div className="flex items-center gap-1 ml-3">
                <kbd className="font-mono text-[10px] text-neutral-600 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">Ctrl</kbd>
                <kbd className="font-mono text-[10px] text-neutral-600 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">K</kbd>
              </div>
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
