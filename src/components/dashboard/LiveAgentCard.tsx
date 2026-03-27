import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AgentStatus } from './CCTVGrid';

interface LiveAgentCardProps {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  status: AgentStatus;
  progress: number;
  result?: string;
  steps: string[];
  screenshots: string[];
  duration?: number;
  url?: string;
  currentUrl?: string;
  isLive: boolean;
  onClick?: () => void;
  isExpanded?: boolean;
}

export function LiveAgentCard({
  name,
  description,
  icon: Icon,
  color,
  bgColor,
  status,
  progress,
  result,
  steps,
  screenshots,
  duration,
  currentUrl,
  isLive,
  onClick,
  isExpanded,
}: LiveAgentCardProps) {
  const latestScreenshot = screenshots.at(-1);
  const latestLog = steps.at(-1);
  const hasContradiction = result?.includes('MISMATCH') || result?.includes('expired') || result?.includes('FOUND:');

  return (
    <div>
      <motion.div
        className={cn(
          'relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-300',
          status === 'running'
            ? cn('border-cyan-500/30 bg-black/80 shadow-[0_0_25px_rgba(6,182,212,0.1)]')
            : status === 'queued'
              ? 'bg-white/[0.01] border-white/[0.05] opacity-60'
              : status === 'idle'
                ? 'bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03]'
                : hasContradiction
                  ? 'bg-red-500/[0.04] border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.08)]'
                  : status === 'warning'
                    ? 'bg-amber-500/[0.04] border-amber-500/15'
                    : status === 'error'
                      ? 'bg-red-500/[0.04] border-red-500/15'
                      : 'bg-emerald-500/[0.03] border-emerald-500/15'
        )}
        onClick={onClick}
        animate={status === 'running' ? { scale: [1, 1.005, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {/* Top bar — LIVE indicator + agent name */}
        <div className={cn(
          'flex items-center justify-between px-3 py-2 border-b',
          status === 'running' ? 'border-cyan-500/10 bg-cyan-500/[0.03]'
            : hasContradiction ? 'border-red-500/10 bg-red-500/[0.03]'
            : 'border-white/[0.04]'
        )}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn('w-5 h-5 rounded flex items-center justify-center shrink-0', bgColor)}>
              <Icon className={cn('h-3 w-3', color)} />
            </div>
            <span className="text-[11px] font-semibold text-white truncate">{name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {status === 'running' && isLive && (
              <span className="flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            )}
            {status === 'running' && !isLive && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">
                DEMO
              </span>
            )}
            {hasContradiction && status !== 'running' && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 animate-pulse">
                MISMATCH
              </span>
            )}
            {status === 'success' && !hasContradiction && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
            {status === 'warning' && !hasContradiction && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
            {status === 'error' && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </div>
        </div>

        {/* Screenshot area / content area */}
        <div className="relative min-h-[80px]">
          {latestScreenshot ? (
            <div className="relative">
              <img
                src={latestScreenshot}
                alt="Agent screenshot"
                className="w-full h-24 object-cover opacity-80"
              />
              {/* Overlay with latest log */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2">
                <p className="text-[9px] font-mono text-green-400 leading-tight truncate">
                  {'>'} {latestLog || 'Processing...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-1.5">
              {status === 'running' ? (
                <>
                  {/* Terminal-style live logs */}
                  <div className="space-y-0.5 max-h-[60px] overflow-hidden">
                    {steps.slice(-3).map((step, i) => (
                      <p key={i} className="text-[9px] font-mono text-green-400/80 leading-tight truncate">
                        <span className="text-green-600">{'>'}</span> {step}
                      </p>
                    ))}
                    {steps.length === 0 && (
                      <p className="text-[9px] font-mono text-cyan-400/60 animate-pulse">
                        {'>'} Initializing agent...
                      </p>
                    )}
                  </div>
                  {/* Current URL */}
                  {currentUrl && (
                    <p className="text-[8px] font-mono text-neutral-600 truncate">
                      {currentUrl}
                    </p>
                  )}
                </>
              ) : status === 'queued' ? (
                <div className="flex items-center justify-center h-[50px]">
                  <p className="text-[10px] text-neutral-600">Queued...</p>
                </div>
              ) : status === 'idle' ? (
                <div className="flex flex-col items-center justify-center h-[50px] gap-1">
                  <Icon className={cn('h-4 w-4', color, 'opacity-30')} />
                  <p className="text-[9px] text-neutral-700">{description}</p>
                </div>
              ) : (
                /* Completed state */
                <div className="space-y-1">
                  <p className={cn(
                    'text-[10px] font-medium leading-tight line-clamp-3',
                    hasContradiction ? 'text-red-400' :
                    status === 'warning' ? 'text-amber-400' :
                    status === 'error' ? 'text-red-400' : 'text-emerald-400/80'
                  )}>
                    {result}
                  </p>
                  {duration && (
                    <p className="text-[8px] text-neutral-700 font-mono">{(duration / 1000).toFixed(1)}s</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress bar at bottom */}
        {(status === 'running' || status === 'queued') && (
          <div className="h-0.5 bg-white/[0.04]">
            <motion.div
              className={cn(
                'h-full rounded-full',
                status === 'running'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                  : 'bg-neutral-700'
              )}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </motion.div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-[10px] space-y-2">
              {currentUrl && (
                <div>
                  <p className="text-neutral-600 font-semibold uppercase tracking-wider text-[8px] mb-0.5">Current URL</p>
                  <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-[#818cf8] hover:underline break-all text-[9px]">
                    {currentUrl.length > 60 ? currentUrl.substring(0, 60) + '...' : currentUrl}
                  </a>
                </div>
              )}
              {screenshots.length > 0 && (
                <div>
                  <p className="text-neutral-600 font-semibold uppercase tracking-wider text-[8px] mb-1">Screenshots ({screenshots.length})</p>
                  <div className="flex gap-1 overflow-x-auto">
                    {screenshots.slice(-3).map((src, i) => (
                      <img key={i} src={src} alt="" className="h-16 rounded border border-white/[0.06] object-cover" />
                    ))}
                  </div>
                </div>
              )}
              {steps.length > 0 && (
                <div>
                  <p className="text-neutral-600 font-semibold uppercase tracking-wider text-[8px] mb-1">Agent Steps ({steps.length})</p>
                  <div className="space-y-0.5 max-h-32 overflow-y-auto font-mono">
                    {steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-neutral-400 text-[9px]">
                        <span className="text-neutral-700 shrink-0">{i + 1}.</span>
                        <span className="break-all">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result && (
                <div>
                  <p className="text-neutral-600 font-semibold uppercase tracking-wider text-[8px] mb-0.5">Full Result</p>
                  <p className={cn(
                    'break-all text-[9px]',
                    hasContradiction ? 'text-red-400' :
                    status === 'warning' ? 'text-amber-400' :
                    status === 'error' ? 'text-red-400' : 'text-emerald-400/80'
                  )}>
                    {result}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
