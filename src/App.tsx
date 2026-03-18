import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout/AppLayout';
import type { Session } from '@supabase/supabase-js';

import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Upload from '@/pages/Upload';
import SupplierDetail from '@/pages/SupplierDetail';
import Reports from '@/pages/Reports';
import Alerts from '@/pages/Alerts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ children, session }: { children: React.ReactNode; session: Session | null }) {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public landing page */}
            <Route
              path="/"
              element={
                session ? <Navigate to="/dashboard" replace /> : <Home />
              }
            />

            {/* Auth */}
            <Route
              path="/auth"
              element={
                session ? <Navigate to="/dashboard" replace /> : <Auth />
              }
            />

            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute session={session}>
                  <AppLayout userEmail={session?.user?.email} />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/supplier/:id" element={<SupplierDetail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/alerts" element={<Alerts />} />
            </Route>

            {/* Default redirect */}
            <Route
              path="*"
              element={
                <Navigate
                  to={session ? '/dashboard' : '/'}
                  replace
                />
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
