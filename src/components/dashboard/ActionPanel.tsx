import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  FileText,
  RefreshCw,
  Mail,
  Download,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import type { DemoScanResult } from '@/data/demoSuppliers';
import type { Contradiction } from './ContradictionPanel';

interface ActionPanelProps {
  supplierName: string;
  scanResult: DemoScanResult & { id: string };
  contradictions: Contradiction[];
  totalTime: number;
  isLive: boolean;
}

export function ActionPanel({
  supplierName,
  scanResult,
  contradictions,
  totalTime,
  isLive,
}: ActionPanelProps) {
  const [contactSent, setContactSent] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleContact = async () => {
    setGenerating('contact');
    await new Promise((r) => setTimeout(r, 1500));
    setContactSent(true);
    setGenerating(null);
  };

  const handleReport = async () => {
    setGenerating('report');
    // Dynamic import pdf.ts
    try {
      const { generateSupplierReport } = await import('@/lib/pdf');
      const supplierObj = {
        id: scanResult.id,
        org_id: 'audit',
        name: supplierName,
        website: scanResult.website,
        country: scanResult.country,
        industry: scanResult.industry,
        status: scanResult.status,
        risk_score: scanResult.risk_score,
        risk_level: scanResult.risk_level,
        last_scanned_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      const violations = scanResult.violations.map(v => ({ ...v, supplier_id: scanResult.id }));
      const simulation = {
        ...scanResult.simulation_output,
        id: 'sim-' + scanResult.id,
        supplier_id: scanResult.id,
        simulated_at: new Date().toISOString(),
      };
      generateSupplierReport(supplierObj, violations, simulation);
    } catch {
      // Fallback
    }
    await new Promise((r) => setTimeout(r, 500));
    setReportGenerated(true);
    setGenerating(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Summary Stats */}
      <div className="rounded-2xl border border-white/[0.06] bg-black/60 backdrop-blur-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Audit Summary</h3>
          <span className="text-[10px] text-neutral-600 ml-auto">
            16 agents · {totalTime}s{isLive ? ' · live' : ' · demo'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-2xl font-heading font-bold text-white">{scanResult.risk_score}</p>
            <p className="text-[9px] text-neutral-600 uppercase tracking-wider mt-1">Risk Score</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className={cn('text-2xl font-heading font-bold',
              scanResult.risk_level === 'critical' ? 'text-red-400' :
              scanResult.risk_level === 'high' ? 'text-orange-400' :
              scanResult.risk_level === 'medium' ? 'text-yellow-400' : 'text-emerald-400'
            )}>
              {scanResult.risk_level.toUpperCase()}
            </p>
            <p className="text-[9px] text-neutral-600 uppercase tracking-wider mt-1">Risk Level</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-2xl font-heading font-bold text-red-400">{contradictions.length}</p>
            <p className="text-[9px] text-neutral-600 uppercase tracking-wider mt-1">Contradictions</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-2xl font-heading font-bold text-white">{scanResult.violations.length}</p>
            <p className="text-[9px] text-neutral-600 uppercase tracking-wider mt-1">Violations</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className={cn('text-2xl font-heading font-bold', scanResult.simulation_output.csrd_compliant ? 'text-emerald-400' : 'text-red-400')}>
              {scanResult.simulation_output.csrd_compliant ? 'YES' : 'NO'}
            </p>
            <p className="text-[9px] text-neutral-600 uppercase tracking-wider mt-1">CSRD</p>
          </div>
        </div>

        {/* Recommended Action */}
        {scanResult.simulation_output.recommended_action && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10">
            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400/60 mb-1">Recommended Action</p>
            <p className="text-sm text-amber-300/90">{scanResult.simulation_output.recommended_action}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Auto-Contact Supplier */}
        <button
          onClick={handleContact}
          disabled={contactSent || generating === 'contact'}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300',
            contactSent
              ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/[0.06] border-amber-500/20 text-amber-400 hover:bg-amber-500/[0.12] hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]'
          )}
        >
          {generating === 'contact' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : contactSent ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Mail className="h-5 w-5" />
          )}
          <span className="text-[11px] font-semibold">
            {contactSent ? 'Contact Sent' : 'Auto-Contact Supplier'}
          </span>
        </button>

        {/* Generate Report */}
        <button
          onClick={handleReport}
          disabled={generating === 'report'}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300',
            reportGenerated
              ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400'
              : 'bg-[#818cf8]/[0.06] border-[#818cf8]/20 text-[#818cf8] hover:bg-[#818cf8]/[0.12] hover:shadow-[0_0_20px_rgba(129,140,248,0.1)]'
          )}
        >
          {generating === 'report' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : reportGenerated ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
          <span className="text-[11px] font-semibold">
            {reportGenerated ? 'Report Ready' : 'Generate CSRD Report'}
          </span>
        </button>

        {/* Download Evidence */}
        <button
          onClick={() => {
            // Create evidence JSON download
            const evidence = {
              supplier: supplierName,
              scan_date: new Date().toISOString(),
              risk_score: scanResult.risk_score,
              risk_level: scanResult.risk_level,
              contradictions: contradictions.map(c => ({
                claim: c.claim,
                evidence: c.evidence,
                confidence: c.confidence,
                agent: c.agent,
              })),
              violations: scanResult.violations,
              recommendations: scanResult.simulation_output.recommended_action,
            };
            const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${supplierName.replace(/\s+/g, '_')}_evidence.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-cyan-500/[0.06] border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/[0.12] hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300"
        >
          <Download className="h-5 w-5" />
          <span className="text-[11px] font-semibold">Download Evidence</span>
        </button>

        {/* Re-run Scan */}
        <button
          onClick={() => window.location.reload()}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-all duration-300"
        >
          <RefreshCw className="h-5 w-5" />
          <span className="text-[11px] font-semibold">Re-run Scan</span>
        </button>
      </div>

      {/* Financial exposure warning */}
      {scanResult.simulation_output.financial_exposure_eur > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/[0.04] border border-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <div>
            <p className="text-sm text-red-300 font-semibold">
              Financial Exposure: EUR {scanResult.simulation_output.financial_exposure_eur.toLocaleString()}
            </p>
            <p className="text-[11px] text-red-400/60">
              Estimated regulatory penalties, contract termination costs, and reputational damage
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
