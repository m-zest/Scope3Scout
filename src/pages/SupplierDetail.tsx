import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Shield,
  AlertTriangle,
  FileText,
  ExternalLink,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useSupplier } from '@/hooks/useSuppliers';
import { useViolations } from '@/hooks/useViolations';
import { useLatestSimulation } from '@/hooks/useSimulations';
import { getDemoSuppliers } from '@/data/demoSuppliers';
import { cn } from '@/lib/utils';
import type { Supplier, Violation, SimulationOutput } from '@/types';

const riskLevelConfig = {
  low: { label: 'LOW', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
  medium: { label: 'MEDIUM', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20' },
  high: { label: 'HIGH', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' },
  critical: { label: 'CRITICAL', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' },
};

function getRiskConfig(level: string) {
  return riskLevelConfig[level as keyof typeof riskLevelConfig] || {
    label: level.toUpperCase(),
    color: 'text-muted-foreground bg-muted border-border',
  };
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const isDemo = id?.startsWith('demo-supplier-');

  const { data: dbSupplier, isLoading: supplierLoading } = useSupplier(isDemo ? '' : (id || ''));
  const { data: dbViolations } = useViolations(isDemo ? undefined : id);
  const { data: dbSimulation } = useLatestSimulation(isDemo ? '' : (id || ''));

  const { supplier, violations, simulation } = useMemo(() => {
    if (isDemo) {
      const demoList = getDemoSuppliers();
      const demoIndex = parseInt(id?.replace('demo-supplier-', '') || '1') - 1;
      const demo = demoList[demoIndex] || demoList[0];

      const sup: Supplier = {
        id: demo.id,
        org_id: 'demo',
        name: demo.supplier_name,
        website: demo.website,
        country: demo.country,
        industry: demo.industry,
        status: demo.status,
        risk_score: demo.risk_score,
        risk_level: demo.risk_level,
        last_scanned_at: '2026-03-15T00:00:00Z',
        created_at: '2026-03-15T00:00:00Z',
      };

      const viol: Violation[] = demo.violations.map((v) => ({
        ...v,
        supplier_id: demo.id,
      }));

      const sim: SimulationOutput = {
        ...demo.simulation_output,
        id: 'demo-sim',
        supplier_id: demo.id,
        simulated_at: '2026-03-15T00:00:00Z',
      };

      return { supplier: sup, violations: viol, simulation: sim };
    }

    return {
      supplier: dbSupplier as Supplier | null,
      violations: (dbViolations as Violation[]) || [],
      simulation: dbSimulation as SimulationOutput | null,
    };
  }, [isDemo, id, dbSupplier, dbViolations, dbSimulation]);

  if (!isDemo && supplierLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Supplier not found.</p>
      </div>
    );
  }

  const riskConfig = getRiskConfig(supplier.risk_level);

  return (
    <motion.div
      className="space-y-6 max-w-4xl"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Demo banner */}
      {isDemo && (
        <motion.div variants={fadeUp} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-sm">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-amber-800 dark:text-amber-300"><span className="font-semibold">Demo Mode</span> — viewing sample supplier data</span>
        </motion.div>
      )}

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <Building2 className="h-6 w-6 text-slate-400" />
        </div>
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold text-foreground">{supplier.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {supplier.country || 'Unknown Country'} &middot; {supplier.industry || 'Unknown Industry'}
          </p>
        </div>
        <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-lg border ml-auto shrink-0', riskConfig.color)}>
          {riskConfig.label} &middot; {supplier.risk_score}/100
        </span>
      </motion.div>

      {/* Info grid */}
      <motion.div variants={fadeUp} className="surface-elevated rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wider">Supplier Information</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
            <p className="font-medium text-foreground capitalize">{supplier.status}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Website</p>
            {supplier.website ? (
              <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-sm">
                {(() => { try { return new URL(supplier.website).hostname; } catch { return supplier.website; } })()}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <p className="font-medium text-foreground">N/A</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Last Scanned</p>
            <p className="font-medium text-foreground">{formatDate(supplier.last_scanned_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">CSRD Status</p>
            {simulation?.csrd_compliant ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Compliant
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
                <ShieldAlert className="h-3.5 w-3.5" /> Non-Compliant
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Risk Assessment */}
      <motion.div variants={fadeUp} className="surface-elevated rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wider">Risk Assessment</h2>
        </div>

        <div className={cn('border rounded-xl p-5', riskConfig.color)}>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-heading font-bold">{supplier.risk_score}/100</span>
            <span className="text-sm font-semibold tracking-wider">{riskConfig.label}</span>
          </div>

          {/* Risk bar */}
          <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 mt-2 mb-4 overflow-hidden">
            <div
              className={cn('h-full rounded-full', supplier.risk_score >= 60 ? 'bg-red-500' : supplier.risk_score >= 40 ? 'bg-orange-500' : 'bg-emerald-500')}
              style={{ width: `${supplier.risk_score}%` }}
            />
          </div>

          {simulation ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-1">Pattern Analysis</p>
                <p>
                  {simulation.predictions && simulation.predictions.length > 0
                    ? `Similar violations in comparable cases have led to regulatory action. ${simulation.csrd_compliant ? 'Current status meets CSRD requirements.' : 'Current status does not meet CSRD compliance requirements.'}`
                    : 'Insufficient data for pattern analysis. Additional scans recommended.'}
                </p>
              </div>

              <div>
                <p className="font-semibold mb-1">Recommended Action</p>
                <p>{simulation.recommended_action}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-current/10">
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wider">CSRD Compliance</p>
                  <p className="mt-1">{simulation.csrd_compliant ? 'Compliant' : 'Non-Compliant'}</p>
                </div>
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wider">Financial Exposure</p>
                  <p className="mt-1">EUR {simulation.financial_exposure_eur.toLocaleString()}</p>
                </div>
              </div>

              {simulation.predictions && simulation.predictions.length > 0 && (
                <div className="pt-3 border-t border-current/10">
                  <p className="font-semibold text-xs uppercase tracking-wider mb-3">Agent Predictions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {simulation.predictions.map((pred, i) => (
                      <div key={i} className="bg-black/5 dark:bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="capitalize font-medium text-xs">{pred.agent_type}</span>
                          <span className="text-xs font-bold">{Math.round(pred.probability * 100)}%</span>
                        </div>
                        <p className="text-xs opacity-80">{pred.prediction}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm opacity-80">No simulation data available. Run Tier 3 analysis for this supplier.</p>
          )}
        </div>
      </motion.div>

      {/* Violations */}
      <motion.div variants={fadeUp} className="surface-elevated rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wider">Violations &amp; Evidence Record</h2>
        </div>

        {violations && violations.length > 0 ? (
          <div className="space-y-4">
            {violations.map((violation, index) => (
              <div key={violation.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">Violation #{index + 1}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold capitalize text-foreground">{violation.type}</span>
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md border', getRiskConfig(violation.severity).color)}>
                        {violation.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(violation.found_at)}
                  </div>
                </div>

                <p className="text-sm text-foreground mb-2">{violation.description}</p>

                {violation.fine_amount_eur > 0 && (
                  <p className="text-sm text-foreground mb-3">
                    <span className="font-semibold">Fine:</span> EUR {violation.fine_amount_eur.toLocaleString()}
                  </p>
                )}

                {(violation.source_url || violation.source_name) && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                    <p className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-wider">Evidence Source</p>
                    <div className="surface-inset rounded-lg p-3 text-sm space-y-1">
                      {violation.source_name && (
                        <p><span className="font-semibold text-foreground">Source:</span> <span className="text-foreground">{violation.source_name}</span></p>
                      )}
                      {violation.source_url && (
                        <p>
                          <span className="font-semibold text-foreground">URL:</span>{' '}
                          <a href={violation.source_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
                            {violation.source_url.length > 60 ? violation.source_url.substring(0, 60) + '...' : violation.source_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </p>
                      )}
                      <p><span className="font-semibold text-foreground">Retrieved:</span> <span className="text-foreground">{formatDate(violation.found_at)}</span></p>
                      {violation.source_excerpt && (
                        <p className="italic text-muted-foreground border-l-2 border-slate-200 dark:border-slate-600 pl-3 mt-2">
                          &ldquo;{violation.source_excerpt.substring(0, 150)}{violation.source_excerpt.length > 150 ? '...' : ''}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">No violations on record. This supplier has not been flagged during any scan cycle.</p>
          </div>
        )}
      </motion.div>

      {/* Report footer */}
      <motion.div variants={fadeUp} className="border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-muted-foreground text-center space-y-0.5">
        <p>Report generated by Scope3Scout</p>
        <p>Data sourced from public records &middot; Retrieved: {formatDate(new Date().toISOString())}</p>
        <p>For compliance use only</p>
      </motion.div>
    </motion.div>
  );
}
