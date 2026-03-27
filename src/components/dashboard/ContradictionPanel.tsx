import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertTriangle, ExternalLink, ShieldAlert, Clock, DollarSign } from 'lucide-react';

export interface Contradiction {
  id: string;
  agent: string;
  claim: string;
  evidence: string;
  confidence: number;
  sourceUrl?: string;
  severity: 'critical' | 'high' | 'medium';
  financialExposure?: number;
  timelineImpactDays?: number;
}

interface ContradictionPanelProps {
  contradictions: Contradiction[];
}

export function ContradictionPanel({ contradictions }: ContradictionPanelProps) {
  if (contradictions.length === 0) return null;

  // Aggregate financial exposure
  const totalExposure = contradictions.reduce((sum, c) => sum + (c.financialExposure || 0), 0);
  const uniqueExposure = totalExposure > 0 ? totalExposure : 0;
  const minTimeline = Math.min(...contradictions.map(c => c.timelineImpactDays || 90).filter(Boolean));
  const maxTimeline = Math.max(...contradictions.map(c => c.timelineImpactDays || 90).filter(Boolean));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-2xl border-2 border-red-500/30 bg-gradient-to-b from-red-500/[0.08] via-red-500/[0.04] to-black/60 backdrop-blur-2xl overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.12)]">

        {/* Big alert header */}
        <div className="px-6 py-5 border-b border-red-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]"
              >
                <ShieldAlert className="h-6 w-6 text-red-400" />
              </motion.div>
              <div>
                <h2 className="font-heading text-xl font-bold text-red-400 tracking-tight">
                  CRITICAL RISK DETECTED
                </h2>
                <p className="text-xs text-red-400/60 mt-0.5">
                  {contradictions.length} claim-evidence mismatch{contradictions.length > 1 ? 'es' : ''} found by autonomous agents
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-heading font-bold text-red-400">{contradictions.length}</span>
              <p className="text-[9px] text-red-400/40 uppercase tracking-wider">findings</p>
            </div>
          </div>

          {/* Impact metrics row */}
          {(uniqueExposure > 0 || minTimeline < 365) && (
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-red-500/10">
              {uniqueExposure > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-red-400/50">Financial Exposure</p>
                    <p className="text-lg font-heading font-bold text-red-300">
                      EUR {uniqueExposure.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {minTimeline < 365 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400/50">Time to Impact</p>
                    <p className="text-lg font-heading font-bold text-amber-300">
                      {minTimeline === maxTimeline ? `${minTimeline} days` : `${minTimeline}–${maxTimeline} days`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contradiction cards — cleaner spacing */}
        <div className="p-5 space-y-4">
          <AnimatePresence>
            {contradictions.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className={cn(
                  'rounded-xl border p-6 relative overflow-hidden',
                  c.severity === 'critical'
                    ? 'border-red-500/25 bg-red-500/[0.04]'
                    : 'border-amber-500/25 bg-amber-500/[0.04]'
                )}
              >
                {/* Severity + agent badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn('h-4 w-4', c.severity === 'critical' ? 'text-red-400' : 'text-amber-400')} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Detected by {c.agent}
                    </span>
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold px-2.5 py-1 rounded-lg border',
                    c.severity === 'critical'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  )}>
                    {c.severity.toUpperCase()}
                  </span>
                </div>

                {/* Claim vs Evidence — side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">Supplier Claim</p>
                    <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[13px] text-neutral-300 leading-relaxed italic">
                        &ldquo;{c.claim}&rdquo;
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-red-400/60">Evidence Found</p>
                    <div className="p-4 rounded-lg bg-red-500/[0.06] border border-red-500/15">
                      <p className="text-[13px] text-red-300 leading-relaxed font-medium">
                        {c.evidence}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom metrics row — slightly reduced */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.04] flex-wrap gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-neutral-600 mb-1">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${c.confidence * 100}%` }}
                            transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                            className={cn('h-full rounded-full',
                              c.confidence >= 0.9 ? 'bg-red-500' : c.confidence >= 0.7 ? 'bg-amber-500' : 'bg-yellow-500'
                            )}
                          />
                        </div>
                        <span className="text-[12px] font-mono font-bold text-white">
                          {Math.round(c.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    {c.financialExposure && c.financialExposure > 0 && (
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-neutral-600 mb-1">Exposure</p>
                        <p className="text-[12px] font-bold text-red-400">EUR {c.financialExposure.toLocaleString()}</p>
                      </div>
                    )}
                    {c.timelineImpactDays && (
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-neutral-600 mb-1">Timeline</p>
                        <p className="text-[12px] font-bold text-amber-400">{c.timelineImpactDays}d</p>
                      </div>
                    )}
                  </div>
                  {c.sourceUrl && (
                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-[#818cf8] hover:underline"
                    >
                      View Source <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
