import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Building2,
  Shield,
  AlertTriangle,
  FileText,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { useSupplier } from '@/hooks/useSuppliers';
import { useViolations } from '@/hooks/useViolations';
import { useLatestSimulation } from '@/hooks/useSimulations';
import { getDemoSuppliers } from '@/data/demoSuppliers';
import { cn } from '@/lib/utils';
import type { Supplier, Violation, SimulationOutput } from '@/types';

const riskLevelConfig = {
  low: { label: 'LOW', color: 'text-green-600 bg-green-50 border-green-200' },
  medium: { label: 'MEDIUM', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  high: { label: 'HIGH', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  critical: { label: 'CRITICAL', color: 'text-red-600 bg-red-50 border-red-200' },
};

function getRiskConfig(level: string) {
  return riskLevelConfig[level as keyof typeof riskLevelConfig] || {
    label: level.toUpperCase(),
    color: 'text-muted-foreground bg-muted border-border',
  };
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const isDemo = id?.startsWith('demo-supplier-');

  // DB hooks (only run when not demo)
  const { data: dbSupplier, isLoading: supplierLoading } = useSupplier(isDemo ? '' : (id || ''));
  const { data: dbViolations } = useViolations(isDemo ? undefined : id);
  const { data: dbSimulation } = useLatestSimulation(isDemo ? '' : (id || ''));

  // Resolve demo data
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
        <p className="text-muted-foreground">Loading supplier data...</p>
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
    <div className="space-y-6 max-w-4xl">
      {/* Demo banner */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-center gap-2 text-amber-800 text-sm">
          <span className="text-base">🎬</span>
          <span className="font-medium">Demo Mode</span>
          <span className="text-amber-700">— viewing sample supplier data</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {supplier.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {supplier.country || 'Unknown Country'} &middot; {supplier.industry || 'Unknown Industry'} &middot; ID: {supplier.id}
          </p>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Supplier Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium text-foreground capitalize">{supplier.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Website</p>
            {supplier.website ? (
              <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                {(() => { try { return new URL(supplier.website).hostname; } catch { return supplier.website; } })()} <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <p className="font-medium text-foreground">N/A</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground">Last Scanned</p>
            <p className="font-medium text-foreground">{formatDate(supplier.last_scanned_at)}</p>
          </div>
        </div>
      </div>

      {/* Risk Assessment — audit-ready language */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Assessment
        </h2>

        <div className={cn('border rounded-lg p-4 mb-4', riskConfig.color)}>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-2xl font-bold">{supplier.risk_score}/100</span>
            <span className="text-sm font-semibold tracking-wider">{riskConfig.label}</span>
          </div>

          {simulation ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold mb-1">Pattern Analysis</p>
                <p>
                  {simulation.predictions && simulation.predictions.length > 0
                    ? `Similar violations in comparable cases have led to regulatory action. ${
                        simulation.csrd_compliant
                          ? 'Current status meets CSRD requirements.'
                          : 'Current status does not meet CSRD compliance requirements.'
                      }`
                    : 'Insufficient data for pattern analysis. Additional scans recommended.'}
                </p>
              </div>

              <div>
                <p className="font-semibold mb-1">Recommended Action</p>
                <p>{simulation.recommended_action}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-current/20">
                <div>
                  <p className="font-semibold">CSRD Compliance</p>
                  <p>{simulation.csrd_compliant ? 'Compliant' : 'Non-Compliant'}</p>
                </div>
                <div>
                  <p className="font-semibold">Financial Exposure</p>
                  <p>EUR {simulation.financial_exposure_eur.toLocaleString()}</p>
                </div>
              </div>

              {simulation.predictions && simulation.predictions.length > 0 && (
                <div className="pt-2 border-t border-current/20">
                  <p className="font-semibold mb-2">Analysis by Agent Type</p>
                  <div className="space-y-1">
                    {simulation.predictions.map((pred, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="capitalize">{pred.agent_type}</span>
                        <span>{pred.prediction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm">No simulation data available. Tier 3 analysis has not been run for this supplier.</p>
          )}
        </div>
      </div>

      {/* Violations with Evidence Sources */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Violations &amp; Evidence Record
        </h2>

        {violations && violations.length > 0 ? (
          <div className="space-y-6">
            {violations.map((violation, index) => (
              <div
                key={violation.id}
                className="border border-border rounded-lg p-4"
              >
                {/* Violation header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-1">
                      VIOLATION #{index + 1}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold capitalize text-foreground">
                        {violation.type}
                      </span>
                      <span className="text-xs text-muted-foreground">&middot;</span>
                      <span className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded border',
                        getRiskConfig(violation.severity).color
                      )}>
                        {violation.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(violation.found_at)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground mb-2">
                  {violation.description}
                </p>

                {/* Fine */}
                {violation.fine_amount_eur > 0 && (
                  <p className="text-sm text-foreground mb-3">
                    <span className="font-semibold">Fine Amount:</span> EUR {violation.fine_amount_eur.toLocaleString()}
                  </p>
                )}

                {/* Evidence Source */}
                {(violation.source_url || violation.source_name) && (
                  <div className="border-t border-border pt-3 mt-3">
                    <p className="text-xs font-mono text-muted-foreground mb-2">
                      EVIDENCE SOURCE
                    </p>
                    <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
                      {violation.source_name && (
                        <p>
                          <span className="font-semibold text-foreground">Source:</span>{' '}
                          <span className="text-foreground">{violation.source_name}</span>
                        </p>
                      )}
                      {violation.source_url && (
                        <p>
                          <span className="font-semibold text-foreground">URL:</span>{' '}
                          <a
                            href={violation.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {violation.source_url.length > 60
                              ? violation.source_url.substring(0, 60) + '...'
                              : violation.source_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </p>
                      )}
                      <p>
                        <span className="font-semibold text-foreground">Retrieved:</span>{' '}
                        <span className="text-foreground">{formatDate(violation.found_at)}</span>
                      </p>
                      {violation.source_excerpt && (
                        <p className="italic text-muted-foreground border-l-2 border-border pl-3 mt-2">
                          &ldquo;{violation.source_excerpt.substring(0, 100)}
                          {violation.source_excerpt.length > 100 ? '...' : ''}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No violations on record. This supplier has not been flagged during any scan cycle.
          </p>
        )}
      </div>

      {/* Report footer */}
      <div className="border-t border-border pt-4 text-xs text-muted-foreground text-center space-y-1">
        <p>Report generated by Scope3Scout</p>
        <p>Data sourced from public records &middot; Retrieved: {formatDate(new Date().toISOString())}</p>
        <p>For compliance use only</p>
      </div>
    </div>
  );
}
