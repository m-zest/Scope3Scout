import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Fingerprint, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';
import { useDemoMode } from '@/App';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { enterDemoMode } = useDemoMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans antialiased bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#818cf8]/10 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#e879f9]/5 via-transparent to-transparent" />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10">
        <div>
          <div className="flex items-center gap-2.5 mb-20 cursor-pointer" onClick={() => navigate('/')}>
            <Logo size={32} />
            <span className="font-heading font-semibold text-lg tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Scope3Scout
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
          >
            <h1 className="text-5xl font-light leading-[1.1] tracking-tight text-white mb-5">
              Supply chain risk intelligence,{' '}
              <span className="bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#e879f9] bg-clip-text text-transparent font-normal">
                powered by AI.
              </span>
            </h1>
            <p className="text-[#a3a3a3] text-lg font-light max-w-md leading-relaxed">
              Scan, detect violations, and simulate regulatory outcomes across your entire supplier network.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 flex flex-wrap gap-2"
          >
            {['CSRD Compliance', 'AI-Powered Scanning', 'Real-time Alerts', 'PDF Reports'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md text-xs text-neutral-400 font-medium"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <Lock className="h-3 w-3" />
          EU CSRD &amp; CSDDD Compliant Intelligence Platform
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden cursor-pointer" onClick={() => navigate('/')}>
            <Logo size={28} />
            <span className="font-heading font-semibold text-base tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Scope3Scout
            </span>
          </div>

          {/* Glassy card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 shadow-[0_0_60px_-15px_rgba(129,140,248,0.15)]">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#818cf8]/20 to-[#e879f9]/20 border border-white/[0.08] flex items-center justify-center">
                <Fingerprint className="h-4.5 w-4.5 text-[#818cf8]" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-white tracking-tight">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-[11px] text-neutral-500">
                  {isLogin ? 'Sign in to continue' : 'Get started with Scope3Scout'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#818cf8]/40 focus:border-[#818cf8]/50 transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#818cf8]/40 focus:border-[#818cf8]/50 transition-all"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#818cf8] to-[#c084fc] text-white rounded-xl font-medium text-sm transition-all hover:shadow-[0_0_30px_rgba(129,140,248,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-neutral-500 hover:text-[#818cf8] transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => { enterDemoMode(); navigate('/dashboard'); }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 text-sm font-medium hover:bg-white/[0.06] hover:text-neutral-200 hover:border-white/[0.12] transition-all"
              >
                Try Demo - No Account Needed
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
