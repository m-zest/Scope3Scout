import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Clock,
  CheckCircle2,
  Loader2,
  FileDown,
  Trash2,
} from 'lucide-react';
import { getDemoSuppliers, type DemoScanResult } from '@/data/demoSuppliers';
import { generateSupplierReport } from '@/lib/pdf';
import type { Supplier, Violation, SimulationOutput } from '@/types';
import { cn } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

interface GeneratedReport {
  id: string;
  supplierName: string;
  generatedAt: string;
  pages: number;
  riskLevel: string;
  blob: Blob;
}

function demoToSupplier(d: DemoScanResult & { id: string }): Supplier {
  return {
    id: d.id,
    org_id: 'demo',
    name: d.supplier_name,
    website: d.website,
    country: d.country,
    industry: d.industry,
    status: d.status,
    risk_score: d.risk_score,
    risk_level: d.risk_level,
    last_scanned_at: '2026-03-27T09:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
  };
}

function demoToViolations(d: DemoScanResult): Violation[] {
  return d.violations.map((v) => ({
    ...v,
    supplier_id: 'demo',
  }));
}

function demoToSimulation(d: DemoScanResult): SimulationOutput {
  return {
    ...d.simulation_output,
    id: 'sim-demo',
    supplier_id: 'demo',
    simulated_at: '2026-03-27T09:00:00Z',
  };
}

const riskBadge: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function Reports() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const demoSuppliers = getDemoSuppliers();

  const handleGenerate = async (d: DemoScanResult & { id: string }) => {
    setGenerating(d.id);
    // Small delay for UX
    await new Promise((r) => setTimeout(r, 800));

    const supplier = demoToSupplier(d);
    const violations = demoToViolations(d);
    const simulation = demoToSimulation(d);

    const doc = generateSupplierReport(supplier, violations, simulation);
    const blob = doc.output('blob');

    const report: GeneratedReport = {
      id: `report-${Date.now()}`,
      supplierName: d.supplier_name,
      generatedAt: new Date().toISOString(),
      pages: doc.getNumberOfPages(),
      riskLevel: d.risk_level,
      blob,
    };

    setReports((prev) => [report, ...prev]);
    setGenerating(null);
  };

  const handleDownload = (report: GeneratedReport) => {
    const url = URL.createObjectURL(report.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.supplierName.replace(/\s+/g, '_')}_CSRD_Report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateAll = async () => {
    for (const d of demoSuppliers) {
      if (!reports.find((r) => r.supplierName === d.supplier_name)) {
        await handleGenerate(d);
      }
    }
  };

  const removeReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <motion.div className="space-y-5 max-w-4xl" initial="hidden" animate="visible" variants={stagger}>
      {/* PDF Report Generator */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#818cf8]" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold text-white tracking-tight">CSRD Report Generator</h2>
              <p className="text-[11px] text-neutral-500">Generate audit-ready PDF reports per supplier</p>
            </div>
          </div>
          <button
            onClick={handleGenerateAll}
            disabled={!!generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#818cf8] to-[#c084fc] text-white text-xs font-semibold hover:shadow-[0_0_20px_rgba(129,140,248,0.3)] transition-all disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Generate All
          </button>
        </div>

        <div className="grid gap-2">
          {demoSuppliers.map((d) => {
            const alreadyGenerated = reports.find((r) => r.supplierName === d.supplier_name);
            const isGenerating = generating === d.id;
            return (
              <div
                key={d.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border', riskBadge[d.risk_level])}>
                    {d.risk_level.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{d.supplier_name}</p>
                    <p className="text-[11px] text-neutral-600">{d.country} · {d.industry} · {d.violations.length} violations</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerate(d)}
                  disabled={!!generating}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    alreadyGenerated
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:text-white hover:bg-white/[0.08]'
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : alreadyGenerated ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <FileDown className="h-3 w-3" />
                      Generate PDF
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Report History */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <Clock className="h-5 w-5 text-neutral-400" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-white tracking-tight">Generated Reports</h2>
            <p className="text-[11px] text-neutral-500">{reports.length} report{reports.length !== 1 ? 's' : ''} generated this session</p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="border border-dashed border-white/[0.08] rounded-2xl p-8 text-center">
            <FileText className="h-6 w-6 text-neutral-700 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No reports generated yet</p>
            <p className="text-xs text-neutral-600 mt-1">Click "Generate PDF" on any supplier above</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#818cf8]/10 border border-[#818cf8]/20 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-[#818cf8]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{report.supplierName}</p>
                    <p className="text-[10px] text-neutral-600">
                      {new Date(report.generatedAt).toLocaleString()} · {report.pages} pages · {(report.blob.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(report)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#818cf8]/10 border border-[#818cf8]/20 text-[#818cf8] text-xs font-medium hover:bg-[#818cf8]/20 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                  <button
                    onClick={() => removeReport(report.id)}
                    className="p-1.5 rounded-lg text-neutral-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
