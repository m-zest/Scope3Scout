// Bloomberg-terminal-style executive summary strip.
// Sits at the top of the dashboard. Shows 4 metrics in large numerals:
//   Financial Exposure · Suppliers At Risk · CSRD Violations · Time To Impact
//
// Accepts an optional `override` prop. When set (e.g. during the Milan demo
// scenario), the panel snaps to the scripted numbers regardless of underlying
// supplier data — hardcoded narrative beats accurate-but-inconsistent data
// during a pitch.

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExecutiveSummaryMetrics {
  financialExposureEur: number;
  suppliersAtRisk: number;
  csrdViolations: number;
  timeToImpactDays: number;
}

interface ExecutiveSummaryProps {
  /** Computed from current supplier data — used when override is null. */
  computed: ExecutiveSummaryMetrics;
  /** Scripted demo numbers — when set, these win. */
  override?: ExecutiveSummaryMetrics | null;
  /** Whether the demo scenario is currently active (changes the chrome). */
  scenarioActive?: boolean;
}

type Trend = 'up-bad' | 'down-good' | 'flat';

function TrendIndicator({ trend, label }: { trend: Trend; label: string }) {
  if (trend === 'up-bad') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#DC2626]">
        <TrendingUp className="h-3 w-3" />
        {label}
      </span>
    );
  }
  if (trend === 'down-good') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#10B981]">
        <TrendingDown className="h-3 w-3" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#F59E0B]">
      <Minus className="h-3 w-3" />
      {label}
    </span>
  );
}

function formatExposure(eur: number): string {
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(1)}M`;
  if (eur >= 1_000) return `€${(eur / 1_000).toFixed(0)}K`;
  return `€${eur}`;
}

export function ExecutiveSummary({ computed, override, scenarioActive = false }: ExecutiveSummaryProps) {
  const m = override ?? computed;

  // Trend logic: tone of the row depends on whether we have any risk at all
  const exposureTrend: Trend = m.financialExposureEur > 1_000_000 ? 'up-bad' : m.financialExposureEur > 0 ? 'flat' : 'down-good';
  const atRiskTrend: Trend = m.suppliersAtRisk >= 3 ? 'up-bad' : m.suppliersAtRisk > 0 ? 'flat' : 'down-good';
  const violationsTrend: Trend = m.csrdViolations >= 5 ? 'up-bad' : m.csrdViolations > 0 ? 'flat' : 'down-good';
  const ttiTrend: Trend = m.timeToImpactDays > 0 && m.timeToImpactDays < 60 ? 'up-bad' : m.timeToImpactDays === 0 ? 'down-good' : 'flat';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-md border bg-black',
        scenarioActive ? 'border-[#DC2626]/40' : 'border-white/[0.12]',
      )}
    >
      {scenarioActive && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#DC2626]" />
      )}
      <div className="flex items-center justify-between px-5 py-2 border-b border-white/[0.06]">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">
          Risk Posture · Live
        </span>
        {scenarioActive && (
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#DC2626]">
            Scenario Active · Bavarian Motors → Carpathian Components
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
        <div className="px-5 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-1.5">Financial Exposure</p>
          <p className={cn(
            'font-heading text-3xl md:text-4xl font-bold tracking-tight tabular-nums',
            m.financialExposureEur > 0 ? 'text-white' : 'text-[#10B981]'
          )}>
            {formatExposure(m.financialExposureEur)}
          </p>
          <div className="mt-1.5">
            <TrendIndicator
              trend={exposureTrend}
              label={m.financialExposureEur > 1_000_000 ? 'critical' : m.financialExposureEur > 0 ? 'monitoring' : 'clear'}
            />
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-1.5">Suppliers At Risk</p>
          <p className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-white tabular-nums">
            {m.suppliersAtRisk}
          </p>
          <div className="mt-1.5">
            <TrendIndicator
              trend={atRiskTrend}
              label={m.suppliersAtRisk >= 3 ? 'elevated' : m.suppliersAtRisk > 0 ? 'stable' : 'no risk'}
            />
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-1.5">CSRD Violations</p>
          <p className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-white tabular-nums">
            {m.csrdViolations}
          </p>
          <div className="mt-1.5">
            <TrendIndicator
              trend={violationsTrend}
              label={m.csrdViolations >= 5 ? 'detected' : m.csrdViolations > 0 ? 'detected' : 'none'}
            />
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-1.5">Time To Impact</p>
          <p className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-white tabular-nums">
            {m.timeToImpactDays > 0 ? `${m.timeToImpactDays}d` : '—'}
          </p>
          <div className="mt-1.5">
            <TrendIndicator
              trend={ttiTrend}
              label={m.timeToImpactDays > 0 && m.timeToImpactDays < 60 ? 'urgent' : m.timeToImpactDays === 0 ? 'no impact' : 'monitoring'}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
