// European SME Network panel.
// Static, scripted view of 4 representative pan-European SMEs already on the
// platform. Bloomberg/Palantir aesthetic to match the Executive Summary.
// Each card is clickable and dispatches a scripted scenario via onSelectScenario.

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CountryBadge } from '@/components/CountryBadge';
import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  Calendar,
  Factory,
  Leaf,
  Users,
} from 'lucide-react';

export interface SMECardData {
  id: string;
  scenarioId: string;
  name: string;
  country: string;
  industry: string;
  employees: number;
  suppliersAudited: number;
  status: 'compliant' | 'at-risk' | 'critical';
  lastAuditDate: string; // ISO yyyy-mm-dd
  scope3VerifiedRatio: string; // e.g. "82% verified" or "1.0× claimed"
  scope3Concern?: string; // short tag, e.g. "3.2× claimed"
  csrdDeadlineDays: number;
}

export const EUROPEAN_SMES: SMECardData[] = [
  {
    id: 'sme-bavarian-motors',
    scenarioId: 'bavarian-motors',
    name: 'Bavarian Motors GmbH',
    country: 'Germany',
    industry: 'Automotive Components',
    employees: 280,
    suppliersAudited: 18,
    status: 'critical',
    lastAuditDate: '2026-05-01',
    scope3VerifiedRatio: '3.2× claimed',
    scope3Concern: 'unverified',
    csrdDeadlineDays: 45,
  },
  {
    id: 'sme-lombardia-tessile',
    scenarioId: 'lombardia-tessile',
    name: 'Lombardia Tessile SRL',
    country: 'Italy',
    industry: 'Textile Manufacturing',
    employees: 120,
    suppliersAudited: 14,
    status: 'at-risk',
    lastAuditDate: '2026-04-28',
    scope3VerifiedRatio: '2.1× claimed',
    scope3Concern: 'partial',
    csrdDeadlineDays: 60,
  },
  {
    id: 'sme-iberian-foods',
    scenarioId: 'iberian-foods',
    name: 'Iberian Foods SL',
    country: 'Spain',
    industry: 'Food Processing',
    employees: 180,
    suppliersAudited: 9,
    status: 'at-risk',
    lastAuditDate: '2026-04-22',
    scope3VerifiedRatio: '78% verified',
    scope3Concern: 'origin gaps',
    csrdDeadlineDays: 90,
  },
  {
    id: 'sme-nordic-pack',
    scenarioId: 'nordic-pack',
    name: 'Nordic Pack AB',
    country: 'Sweden',
    industry: 'Sustainable Packaging',
    employees: 95,
    suppliersAudited: 6,
    status: 'compliant',
    lastAuditDate: '2026-04-30',
    scope3VerifiedRatio: '100% verified',
    csrdDeadlineDays: 180,
  },
];

// Aggregate coverage stats — kept in sync with the cards above.
function computeCoverage(cards: SMECardData[]): {
  smeCount: number;
  countryCount: number;
  suppliersAudited: number;
  violationsDetected: number;
} {
  const countries = new Set(cards.map((c) => c.country));
  return {
    smeCount: cards.length,
    countryCount: countries.size,
    suppliersAudited: cards.reduce((sum, c) => sum + c.suppliersAudited, 0),
    // Violations detected — derived from status bands (pitch number, see demoScenario.ts for the per-supplier breakdown)
    violationsDetected: cards.reduce(
      (sum, c) => sum + (c.status === 'critical' ? 7 : c.status === 'at-risk' ? 2 : 0),
      0,
    ),
  };
}

const statusStyles: Record<SMECardData['status'], { label: string; badge: string; border: string; accent: string; icon: typeof AlertTriangle }> = {
  critical: {
    label: 'Critical',
    badge: 'bg-[#DC2626] text-white',
    border: 'border-[#DC2626]/40 hover:border-[#DC2626]',
    accent: 'text-[#DC2626]',
    icon: AlertTriangle,
  },
  'at-risk': {
    label: 'At Risk',
    badge: 'bg-[#F59E0B] text-black',
    border: 'border-[#F59E0B]/40 hover:border-[#F59E0B]',
    accent: 'text-[#F59E0B]',
    icon: Activity,
  },
  compliant: {
    label: 'Compliant',
    badge: 'bg-[#10B981] text-black',
    border: 'border-[#10B981]/40 hover:border-[#10B981]',
    accent: 'text-[#10B981]',
    icon: ShieldCheck,
  },
};

interface EuropeanSMENetworkProps {
  onSelectScenario: (scenarioId: string) => void;
  activeScenarioId?: string | null;
}

export function EuropeanSMENetwork({ onSelectScenario, activeScenarioId }: EuropeanSMENetworkProps) {
  const coverage = computeCoverage(EUROPEAN_SMES);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      {/* Coverage strip */}
      <div className="rounded-md border border-white/[0.12] bg-black px-5 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">European SME Coverage</span>
          <div className="flex items-center gap-5 text-[12px] text-neutral-300">
            <span><span className="font-heading font-bold text-white tabular-nums">{coverage.smeCount}</span> <span className="text-neutral-500">SMEs</span></span>
            <span className="text-neutral-700">·</span>
            <span><span className="font-heading font-bold text-white tabular-nums">{coverage.countryCount}</span> <span className="text-neutral-500">countries</span></span>
            <span className="text-neutral-700">·</span>
            <span><span className="font-heading font-bold text-white tabular-nums">{coverage.suppliersAudited}</span> <span className="text-neutral-500">suppliers audited</span></span>
            <span className="text-neutral-700">·</span>
            <span><span className="font-heading font-bold text-[#DC2626] tabular-nums">{coverage.violationsDetected}</span> <span className="text-neutral-500">violations detected</span></span>
          </div>
        </div>
      </div>

      {/* SME cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {EUROPEAN_SMES.map((sme) => {
          const style = statusStyles[sme.status];
          const Icon = style.icon;
          const isActive = activeScenarioId === sme.scenarioId;
          return (
            <button
              key={sme.id}
              type="button"
              onClick={() => onSelectScenario(sme.scenarioId)}
              className={cn(
                'group relative overflow-hidden rounded-md border bg-black px-4 py-4 text-left transition-all',
                style.border,
                isActive && 'ring-1 ring-white/40',
              )}
            >
              {/* Top accent bar */}
              <div className={cn('absolute top-0 left-0 right-0 h-[2px]', isActive ? 'bg-white' : style.accent.replace('text-', 'bg-'))} />

              {/* Header — name + country + status badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <CountryBadge country={sme.country} />
                    <h3 className="font-heading text-sm font-bold text-white tracking-tight truncate">{sme.name}</h3>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
                    <Factory className="h-2.5 w-2.5" />
                    <span>{sme.industry}</span>
                    <span className="text-neutral-700">·</span>
                    <Users className="h-2.5 w-2.5" />
                    <span>{sme.employees} emp</span>
                  </p>
                </div>
                <span className={cn('text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md', style.badge)}>
                  <span className="inline-flex items-center gap-1">
                    <Icon className="h-2.5 w-2.5" />
                    {style.label}
                  </span>
                </span>
              </div>

              {/* Metric grid */}
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] border-t border-white/[0.06] pt-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-600">Suppliers</p>
                  <p className="font-heading text-base font-bold text-white tabular-nums">{sme.suppliersAudited}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-600">CSRD due</p>
                  <p className={cn(
                    'font-heading text-base font-bold tabular-nums',
                    sme.csrdDeadlineDays < 60 ? 'text-[#DC2626]' : sme.csrdDeadlineDays < 120 ? 'text-[#F59E0B]' : 'text-[#10B981]'
                  )}>
                    {sme.csrdDeadlineDays}d
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] uppercase tracking-wider text-neutral-600 flex items-center gap-1"><Leaf className="h-2.5 w-2.5" />Scope 3 verified vs claimed</p>
                  <p className={cn('font-mono text-[12px] font-semibold mt-0.5', style.accent)}>
                    {sme.scope3VerifiedRatio}
                    {sme.scope3Concern && <span className="ml-1.5 text-[10px] uppercase text-neutral-500 font-normal">· {sme.scope3Concern}</span>}
                  </p>
                </div>
              </div>

              {/* Footer — last audit */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  Last audit {sme.lastAuditDate}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-neutral-600 group-hover:text-white transition-colors">
                  Load Audit →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
