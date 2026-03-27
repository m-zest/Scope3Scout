import { motion } from 'framer-motion';
import { Scan, Shield, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hasTinyFishKey } from '@/lib/tinyfish';

interface MissionControlProps {
  supplierName: string;
  status: 'idle' | 'scanning' | 'complete' | 'error';
  progress: number;
  agentsComplete: number;
  totalAgents: number;
  elapsed: number;
  contradictions: number;
}

export function MissionControl({
  supplierName,
  status,
  progress,
  agentsComplete,
  totalAgents,
  elapsed,
  contradictions,
}: MissionControlProps) {
  const statusLabel = {
    idle: 'Ready to Scan',
    scanning: 'Auditing in Progress',
    complete: 'Audit Complete',
    error: 'Scan Error',
  }[status];

  const statusColor = {
    idle: 'text-neutral-400',
    scanning: 'text-cyan-400',
    complete: contradictions > 0 ? 'text-red-400' : 'text-emerald-400',
    error: 'text-red-400',
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-2xl"
    >
      {/* Animated gradient border effect */}
      {status === 'scanning' && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-[-2px] rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 animate-gradient-x" />
          <div className="absolute inset-[1px] rounded-2xl bg-black/90" />
        </div>
      )}

      <div className="relative px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Status */}
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500',
              status === 'scanning'
                ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                : status === 'complete'
                  ? contradictions > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/[0.04] border-white/[0.08]'
            )}>
              {status === 'scanning' ? (
                <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
              ) : (
                <Scan className={cn('h-5 w-5', statusColor)} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="font-heading text-lg font-bold text-white tracking-tight">
                  {supplierName || 'Select a Supplier'}
                </h2>
                {hasTinyFishKey() && (
                  <span className="relative flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </span>
                )}
                {!hasTinyFishKey() && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    DEMO
                  </span>
                )}
              </div>
              <p className={cn('text-sm font-medium', statusColor)}>{statusLabel}</p>
            </div>
          </div>

          {/* Center: Progress */}
          <div className="flex-1 max-w-sm mx-4 hidden md:block">
            <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1.5">
              <span>{agentsComplete}/{totalAgents} Agents</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  status === 'scanning' ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 bg-[length:200%_100%] animate-gradient-x'
                    : status === 'complete' ? (contradictions > 0 ? 'bg-red-500' : 'bg-emerald-500')
                    : 'bg-neutral-700'
                )}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 text-neutral-500">
                <Clock className="h-3 w-3" />
                <span className="text-[10px] uppercase tracking-wider">Elapsed</span>
              </div>
              <p className="text-sm font-mono font-bold text-white mt-0.5">{elapsed.toFixed(1)}s</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-neutral-500">
                <Shield className="h-3 w-3" />
                <span className="text-[10px] uppercase tracking-wider">Findings</span>
              </div>
              <p className={cn(
                'text-sm font-mono font-bold mt-0.5',
                contradictions > 0 ? 'text-red-400' : 'text-emerald-400'
              )}>
                {contradictions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
