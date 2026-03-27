import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, CheckCircle2, Info, Zap, ArrowRight } from 'lucide-react';

export interface TimelineEntry {
  id: string;
  timestamp: number;
  agent: string;
  message: string;
  type: 'step' | 'action' | 'success' | 'warning' | 'contradiction' | 'info';
  url?: string;
}

interface TimelineFeedProps {
  entries: TimelineEntry[];
}

const typeConfig = {
  step: { icon: ArrowRight, color: 'text-neutral-500', bg: 'bg-neutral-500/10', dot: 'bg-neutral-500' },
  action: { icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10', dot: 'bg-cyan-500' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
  contradiction: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-500' },
  info: { icon: Info, color: 'text-[#818cf8]', bg: 'bg-[#818cf8]/10', dot: 'bg-[#818cf8]' },
};

export function TimelineFeed({ entries }: TimelineFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/60 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">Live Feed</span>
        </div>
        <span className="text-[10px] text-neutral-600">{entries.length} events</span>
      </div>

      {/* Timeline entries */}
      <div className="max-h-[500px] overflow-y-auto p-3 space-y-0.5 scrollbar-thin">
        <AnimatePresence initial={false}>
          {entries.map((entry) => {
            const config = typeConfig[entry.type];
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                className="flex items-start gap-2 py-1.5"
              >
                {/* Timestamp */}
                <span className="text-[8px] font-mono text-neutral-700 shrink-0 mt-0.5 w-14">
                  {formatTime(entry.timestamp)}
                </span>

                {/* Dot */}
                <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', config.dot,
                  entry.type === 'contradiction' ? 'animate-pulse' : ''
                )} />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={cn('text-[9px] font-bold', config.color)}>
                      {entry.agent}
                    </span>
                  </div>
                  <p className={cn(
                    'text-[10px] leading-tight mt-0.5 break-words',
                    entry.type === 'contradiction' ? 'text-red-400 font-semibold' :
                    entry.type === 'warning' ? 'text-amber-400/80' :
                    entry.type === 'success' ? 'text-emerald-400/70' :
                    'text-neutral-500'
                  )}>
                    {entry.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
