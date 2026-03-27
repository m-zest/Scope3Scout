import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  RefreshCw,
  Download,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Zap,
  Bot,
  Sparkles,
} from 'lucide-react';
import type { DemoScanResult } from '@/data/demoSuppliers';
import type { Contradiction } from './ContradictionPanel';
import { generateGeminiReport, generateComplianceAction, hasGeminiKey } from '@/lib/gemini';

interface ActionPanelProps {
  supplierName: string;
  scanResult: DemoScanResult & { id: string };
  contradictions: Contradiction[];
  totalTime: number;
  isLive: boolean;
}

// Fallback report when Gemini unavailable
function getFallbackReport(supplierName: string, scanResult: DemoScanResult, contradictions: Contradiction[]): string {
  const exposure = scanResult.simulation_output.financial_exposure_eur;
  return `## Executive Summary

${supplierName} is classified as **${scanResult.risk_level.toUpperCase()} RISK** (score: ${scanResult.risk_score}/100) based on ${contradictions.length} critical claim-evidence mismatches and ${scanResult.violations.length} documented violation(s). Immediate action is required to mitigate regulatory exposure of EUR ${exposure.toLocaleString()}.

## Key Findings

${contradictions.map(c => `- **${c.agent}**: Supplier claims "${c.claim}" — contradicted by evidence: "${c.evidence}" (${Math.round(c.confidence * 100)}% confidence)`).join('\n')}
${scanResult.violations.map(v => `- [${v.severity.toUpperCase()}] ${v.type}: ${v.description}`).join('\n')}

## Recommended Actions

1. **Immediate** (0-7 days): Suspend new purchase orders pending supplier clarification
2. **Short-term** (7-30 days): Request updated certification documentation and third-party audit
3. **Medium-term** (30-90 days): Evaluate alternative suppliers; initiate contract review clause

## Regulatory Risk

Under EU CSRD/CSDDD regulations, continued engagement with a non-compliant supplier constitutes a due diligence failure. Potential penalties include fines up to 5% of annual turnover and mandatory public disclosure of supply chain risks.`;
}

function getFallbackAction(supplierName: string, contradictions: Contradiction[], riskLevel: string): string {
  return `Our automated compliance audit of ${supplierName} has identified ${contradictions.length} critical discrepancy(ies) requiring immediate clarification. Specifically, claims regarding "${contradictions[0]?.claim || 'ESG compliance'}" are contradicted by documented evidence. We request updated certification documentation and a formal response within 14 business days. Please note that under our ${riskLevel.toUpperCase()}-risk protocol, failure to provide satisfactory clarification may trigger a formal contract review under Section 8.3 of our Supplier Code of Conduct.`;
}

export function ActionPanel({
  supplierName,
  scanResult,
  contradictions,
  totalTime,
  isLive,
}: ActionPanelProps) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [reportText, setReportText] = useState<string | null>(null);
  const [actionText, setActionText] = useState<string | null>(null);
  const [reportStage, setReportStage] = useState<string>('');
  const [actionStage, setActionStage] = useState<string>('');
  const [reportReady, setReportReady] = useState(false);
  const [actionReady, setActionReady] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating('report');
    setReportReady(false);

    // Animated stages
    setReportStage('Analyzing findings...');
    await new Promise(r => setTimeout(r, 800));
    setReportStage('Summarizing risks...');
    await new Promise(r => setTimeout(r, 600));
    setReportStage('Generating executive report with AI...');

    const findings = contradictions.map(c => ({ claim: c.claim, evidence: c.evidence, confidence: c.confidence }));
    const violations = scanResult.violations.map(v => ({
      type: v.type,
      description: v.description,
      severity: v.severity,
      fine_amount_eur: v.fine_amount_eur,
    }));

    let report = '';
    if (hasGeminiKey()) {
      report = await generateGeminiReport(
        supplierName, findings, violations,
        scanResult.risk_score, scanResult.risk_level,
        scanResult.simulation_output.financial_exposure_eur,
      );
    }

    if (!report) {
      report = getFallbackReport(supplierName, scanResult, contradictions);
    }

    setReportStage('Report ready');
    setReportText(report);
    setReportReady(true);
    setGenerating(null);
  };

  const handleComplianceAction = async () => {
    setGenerating('action');
    setActionReady(false);

    setActionStage('Drafting supplier notification...');
    await new Promise(r => setTimeout(r, 700));
    setActionStage('Attaching evidence...');
    await new Promise(r => setTimeout(r, 500));
    setActionStage('Preparing compliance request...');

    const findings = contradictions.map(c => ({ claim: c.claim, evidence: c.evidence }));

    let action = '';
    if (hasGeminiKey()) {
      action = await generateComplianceAction(supplierName, findings, scanResult.risk_level);
    }

    if (!action) {
      action = getFallbackAction(supplierName, contradictions, scanResult.risk_level);
    }

    setActionStage('Draft ready');
    setActionText(action);
    setActionReady(true);
    setGenerating(null);
  };

  const handleDownloadPdf = async () => {
    setGenerating('pdf');
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
    } catch { /* fallback */ }
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
      </div>

      {/* AI Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* AI Report Generation */}
        <button
          onClick={handleGenerateReport}
          disabled={generating === 'report'}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300',
            reportReady
              ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400'
              : 'bg-[#818cf8]/[0.06] border-[#818cf8]/20 text-[#818cf8] hover:bg-[#818cf8]/[0.12] hover:shadow-[0_0_20px_rgba(129,140,248,0.1)]'
          )}
        >
          {generating === 'report' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : reportReady ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          <span className="text-[11px] font-semibold">
            {generating === 'report' ? reportStage : reportReady ? 'Report Generated' : 'AI Generate Report'}
          </span>
        </button>

        {/* Initiate Compliance Action */}
        <button
          onClick={handleComplianceAction}
          disabled={generating === 'action'}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300',
            actionReady
              ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/[0.06] border-amber-500/20 text-amber-400 hover:bg-amber-500/[0.12] hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]'
          )}
        >
          {generating === 'action' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : actionReady ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Zap className="h-5 w-5" />
          )}
          <span className="text-[11px] font-semibold">
            {generating === 'action' ? actionStage : actionReady ? 'Draft Ready' : 'Initiate Compliance Action'}
          </span>
        </button>

        {/* Download PDF */}
        <button
          onClick={handleDownloadPdf}
          disabled={generating === 'pdf'}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-cyan-500/[0.06] border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/[0.12] hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300"
        >
          {generating === 'pdf' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          <span className="text-[11px] font-semibold">Download CSRD PDF</span>
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

      {/* AI Report Preview */}
      <AnimatePresence>
        {reportText && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-[#818cf8]/20 bg-[#818cf8]/[0.03] backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-4 w-4 text-[#818cf8]" />
                <h3 className="font-heading text-sm font-bold text-[#818cf8] uppercase tracking-wider">AI-Generated Executive Report</h3>
                {hasGeminiKey() && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#818cf8]/10 text-[#818cf8] border border-[#818cf8]/20 ml-auto">
                    GEMINI AI
                  </span>
                )}
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-neutral-300 leading-relaxed">
                {reportText.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h4 key={i} className="text-white font-heading font-bold text-sm mt-4 mb-2 tracking-tight">{line.replace('## ', '')}</h4>;
                  if (line.startsWith('- **')) return <p key={i} className="text-[13px] text-neutral-300 ml-2 mb-1">{line}</p>;
                  if (line.startsWith('- ')) return <p key={i} className="text-[13px] text-neutral-400 ml-2 mb-1">{line}</p>;
                  if (line.match(/^\d+\./)) return <p key={i} className="text-[13px] text-neutral-300 ml-2 mb-1">{line}</p>;
                  if (line.trim() === '') return null;
                  return <p key={i} className="text-[13px] text-neutral-300 mb-2">{line}</p>;
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Compliance Action Draft */}
      <AnimatePresence>
        {actionText && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-amber-400" />
                <h3 className="font-heading text-sm font-bold text-amber-400 uppercase tracking-wider">AI-Drafted Supplier Notification</h3>
                {hasGeminiKey() && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 ml-auto">
                    GEMINI AI
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 mb-2">To: {supplierName} Compliance Department</p>
                <p className="text-[13px] text-neutral-300 leading-relaxed whitespace-pre-wrap">{actionText}</p>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                  Send to Supplier
                </button>
                <span className="text-[10px] text-neutral-600">|</span>
                <button className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-300 transition-colors">
                  Edit Draft
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial exposure + consequence line */}
      {scanResult.simulation_output.financial_exposure_eur > 0 && (
        <div className="space-y-2">
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
          {/* "Why this matters" consequence line */}
          {contradictions.length > 0 && (
            <div className="px-5 py-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/10">
              <p className="text-[12px] text-amber-300/90 leading-relaxed">
                <span className="font-bold">Why this matters:</span> This violation could trigger regulatory review within {scanResult.simulation_output.predictions?.[0]?.timeline_days || 45} days and result in EUR {scanResult.simulation_output.financial_exposure_eur.toLocaleString()} total exposure under EU CSRD Article 29a due diligence requirements.
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
