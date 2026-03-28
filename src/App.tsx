import { useEffect, useState, lazy, Suspense, Component, type ReactNode, type ErrorInfo, createContext, useContext, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScanResultProvider } from '@/lib/scanResultContext';
import type { Session } from '@supabase/supabase-js';

// Lazy-loaded pages for code-splitting
const Home = lazy(() => import('@/pages/Home'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Upload = lazy(() => import('@/pages/Upload'));
const SupplierDetail = lazy(() => import('@/pages/SupplierDetail'));
const Reports = lazy(() => import('@/pages/Reports'));
const Alerts = lazy(() => import('@/pages/Alerts'));
const Settings = lazy(() => import('@/pages/Settings'));

// ─── Demo Mode Context ───
interface DemoContextValue {
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const DemoContext = createContext<DemoContextValue>({ isDemoMode: false, enterDemoMode: () => {}, exitDemoMode: () => {} });
export function useDemoMode() { return useContext(DemoContext); }

// ─── Error Boundary ───
interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="max-w-md text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-lg font-heading font-semibold text-white">Something went wrong</h2>
            <p className="text-sm text-neutral-500">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/dashboard'; }}
              className="px-4 py-2 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/20 text-[#818cf8] text-sm font-medium hover:bg-[#818cf8]/20 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Page loading fallback ───
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-600">Loading...</p>
      </div>
    </div>
  );
}

// ─── Protected Route guard (allows demo mode bypass) ───
function ProtectedRoute({ session, isDemoMode, children }: { session: Session | null; isDemoMode: boolean; children: ReactNode }) {
  if (!session && !isDemoMode) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem('scope3scout_demo_mode') === 'true');

  const enterDemoMode = useCallback(() => {
    localStorage.setItem('scope3scout_demo_mode', 'true');
    setIsDemoMode(true);
  }, []);

  const exitDemoMode = useCallback(() => {
    localStorage.removeItem('scope3scout_demo_mode');
    setIsDemoMode(false);
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  const isAuthed = !!session || isDemoMode;

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <DemoContext.Provider value={{ isDemoMode, enterDemoMode, exitDemoMode }}>
            <ScanResultProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public landing page */}
                    <Route
                      path="/"
                      element={
                        isAuthed ? <Navigate to="/dashboard" replace /> : <Home />
                      }
                    />

                    {/* Auth */}
                    <Route
                      path="/auth"
                      element={
                        isAuthed ? <Navigate to="/dashboard" replace /> : <Auth />
                      }
                    />

                    {/* Protected app routes with layout (auth OR demo mode) */}
                    <Route
                      element={
                        <ProtectedRoute session={session} isDemoMode={isDemoMode}>
                          <AppLayout userEmail={session?.user?.email || (isDemoMode ? 'demo@scope3scout.com' : undefined)} />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/supplier/:id" element={<SupplierDetail />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Default redirect */}
                    <Route
                      path="*"
                      element={
                        <Navigate
                          to={isAuthed ? '/dashboard' : '/'}
                          replace
                        />
                      }
                    />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ScanResultProvider>
          </DemoContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
