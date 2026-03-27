import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';

export interface Contradiction {
  id: string;
  agent: string;
  claim: string;
  evidence: string;
  confidence: number;
  sourceUrl?: string;
  severity: 'critical' | 'high' | 'medium';
}

interface ContradictionPanelProps {
  contradictions: Contradiction[];
}

export function ContradictionPanel({ contradictions }: ContradictionPanelProps) {
  if (contradictions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Big header */}
      <div className="rounded-2xl border-2 border-red-500/30 bg-gradient-to-b from-red-500/[0.08] to-black/60 backdrop-blur-2xl overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.1)]">
        {/* Alert header */}
        <div className="px-6 py-4 border-b border-red-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center"
            >
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </motion.div>
            <div>
              <h2 className="font-heading text-lg font-bold text-red-400 tracking-tight">
                CONTRADICTIONS DETECTED
              </h2>
              <p className="text-[11px] text-red-400/60">
                {contradictions.length} claim-evidence mismatch{contradictions.length > 1 ? 'es' : ''} found during audit
              </p>
            </div>
          </div>
          <span className="text-2xl font-heading font-bold text-red-400">{contradictions.length}</span>
        </div>

        {/* Contradiction cards */}
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {contradictions.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'rounded-xl border p-5 relative overflow-hidden',
                  c.severity === 'critical'
                    ? 'border-red-500/25 bg-red-500/[0.04]'
                    : 'border-amber-500/25 bg-amber-500/[0.04]'
                )}
              >
                {/* Severity badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn('h-4 w-4', c.severity === 'critical' ? 'text-red-400' : 'text-amber-400')} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Detected by {c.agent}
                    </span>
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-1 rounded-lg border',
                    c.severity === 'critical'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  )}>
                    {c.severity.toUpperCase()}
                  </span>
                </div>

                {/* Claim vs Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">Supplier Claim</p>
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-sm text-neutral-300 leading-relaxed italic">
                        &ldquo;{c.claim}&rdquo;
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-red-400/60">Evidence Found</p>
                    <div className="p-3 rounded-lg bg-red-500/[0.04] border border-red-500/10">
                      <p className="text-sm text-red-300 leading-relaxed font-medium">
                        {c.evidence}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confidence + Source */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-neutral-600">Confidence</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={cn('h-full rounded-full',
                              c.confidence >= 0.9 ? 'bg-red-500' : c.confidence >= 0.7 ? 'bg-amber-500' : 'bg-yellow-500'
                            )}
                            style={{ width: `${c.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-white">
                          {Math.round(c.confidence * 100)}%
                        </span>
                      </div>
                    </div>
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
