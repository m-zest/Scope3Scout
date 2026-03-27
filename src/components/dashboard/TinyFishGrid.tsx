import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Scale,
  Newspaper,
  Award,
  Users,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bot,
  Zap,
  Search,
  FileText,
  Shield,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDemoSuppliers, type DemoScanResult } from '@/data/demoSuppliers';

type AgentStatus = 'idle' | 'running' | 'success' | 'warning' | 'error';

interface AgentTask {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  status: AgentStatus;
  progress: number;
  result?: string;
  duration?: number;
}

const defaultTasks: Omit<AgentTask, 'status' | 'progress'>[] = [
  // Row 1: Tier 1 - Web Scraping Agents
  { id: 'website', name: 'Website Scanner', description: 'Extract ESG claims & certifications', icon: Globe, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
  { id: 'regulatory', name: 'Regulatory Check', description: 'Search EU fines & penalties', icon: Scale, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  { id: 'news', name: 'News Intelligence', description: 'Scan news for violations', icon: Newspaper, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  { id: 'certs', name: 'Cert Verifier', description: 'Verify ISO certifications', icon: Award, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  // Row 2: Tier 1 - Extended Agents
  { id: 'linkedin', name: 'LinkedIn Intel', description: 'Detect layoffs & departures', icon: Users, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
  { id: 'supply', name: 'Supply Chain Map', description: 'Map sub-supplier network', icon: Search, color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20' },
  { id: 'financial', name: 'Financial Risk', description: 'Analyze financial stability', icon: FileText, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
  { id: 'compliance', name: 'CSRD Validator', description: 'Cross-check CSRD reports', icon: Shield, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' },
  // Row 3: Tier 2 - LLM Analysis Agents
  { id: 'classifier', name: 'Violation Classifier', description: 'Classify violation severity', icon: Brain, color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-500/10', borderColor: 'border-fuchsia-500/20' },
  { id: 'greenwash', name: 'Greenwash Detector', description: 'Find claim discrepancies', icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
  { id: 'evidence', name: 'Evidence Extractor', description: 'Extract & rank evidence', icon: Zap, color: 'text-teal-400', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/20' },
  { id: 'sentiment', name: 'Sentiment Analyzer', description: 'Measure public sentiment', icon: Bot, color: 'text-sky-400', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/20' },
  // Row 4: Tier 3 - Simulation Agents
  { id: 'regulator', name: 'Regulator Agent', description: 'Predict enforcement actions', icon: Scale, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  { id: 'media', name: 'Media Agent', description: 'Predict media coverage risk', icon: Newspaper, color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
  { id: 'investor', name: 'Investor Agent', description: 'Predict ESG fund reactions', icon: FileText, color: 'text-lime-400', bgColor: 'bg-lime-500/10', borderColor: 'border-lime-500/20' },
  { id: 'ngo', name: 'NGO Agent', description: 'Predict NGO response', icon: Users, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
];

const tierLabels = [
  { label: 'TIER 1 — Web Scraping', color: 'text-cyan-400', range: [0, 8] },
  { label: 'TIER 2 — LLM Analysis', color: 'text-fuchsia-400', range: [8, 12] },
  { label: 'TIER 3 — Risk Simulation', color: 'text-red-400', range: [12, 16] },
];

function statusIcon(status: AgentStatus) {
  switch (status) {
    case 'running': return <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />;
    case 'success': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
    case 'warning': return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    case 'error': return <XCircle className="h-3.5 w-3.5 text-red-400" />;
    default: return <div className="w-2 h-2 rounded-full bg-neutral-700" />;
  }
}

interface TinyFishGridProps {
  supplierName?: string;
}

export function TinyFishGrid({ supplierName }: TinyFishGridProps) {
  const [tasks, setTasks] = useState<AgentTask[]>(
    defaultTasks.map((t) => ({ ...t, status: 'idle' as AgentStatus, progress: 0 }))
  );
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState(supplierName || '');
  const [scanResult, setScanResult] = useState<(DemoScanResult & { id: string }) | null>(null);
  const [totalTime, setTotalTime] = useState(0);

  const suppliers = getDemoSuppliers();

  const runScan = useCallback(async (targetSupplier: string) => {
    setScanning(true);
    setScanComplete(false);
    setScanResult(null);
    setActiveSupplier(targetSupplier);
    const startTime = Date.now();

    // Reset all tasks
    setTasks((prev) => prev.map((t) => ({ ...t, status: 'idle' as AgentStatus, progress: 0, result: undefined, duration: undefined })));

    const demo = suppliers.find((s) => s.supplier_name === targetSupplier) || suppliers[0];

    // Simulate each agent running sequentially with some overlap
    for (let i = 0; i < defaultTasks.length; i++) {
      const taskId = defaultTasks[i].id;
      setTasks((prev) =>
        prev.map((t) => t.id === taskId ? { ...t, status: 'running' as AgentStatus } : t)
      );

      // Simulate progress
      const duration = 300 + Math.random() * 600;
      const steps = 5;
      for (let step = 1; step <= steps; step++) {
        await new Promise((r) => setTimeout(r, duration / steps));
        setTasks((prev) =>
          prev.map((t) => t.id === taskId ? { ...t, progress: Math.min((step / steps) * 100, 100) } : t)
        );
      }

      // Determine result based on demo data
      const hasViolations = demo.violations.length > 0;
      const isFlagged = demo.risk_level === 'critical' || demo.risk_level === 'high';
      let finalStatus: AgentStatus = 'success';
      let result = 'No issues found';

      if (i < 8) { // Tier 1
        if (hasViolations && (i === 0 || i === 1 || i === 2)) {
          finalStatus = 'warning';
          result = `${demo.violations.length} discrepanc${demo.violations.length === 1 ? 'y' : 'ies'} detected`;
        }
      } else if (i < 12) { // Tier 2
        if (hasViolations && (i === 8 || i === 9)) {
          finalStatus = 'warning';
          result = isFlagged ? 'Critical violations classified' : 'Minor issues found';
        }
      } else { // Tier 3
        if (isFlagged && (i === 12 || i === 13)) {
          finalStatus = 'warning';
          const pred = demo.simulation_output.predictions.find(
            (p) => p.agent_type === defaultTasks[i].id
          );
          result = pred
            ? `${Math.round(pred.probability * 100)}% risk — ${pred.timeline_days}d`
            : 'Elevated risk detected';
        }
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: finalStatus, progress: 100, result, duration: Math.round(duration) }
            : t
        )
      );
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    setTotalTime(parseFloat(elapsed));
    setScanResult(demo);
    setScanComplete(true);
    setScanning(false);
  }, [suppliers]);

  // Auto-scan if supplier name is provided
  useEffect(() => {
    if (supplierName && !scanning && !scanComplete) {
      runScan(supplierName);
    }
  }, [supplierName]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#818cf8]/20 to-[#e879f9]/20 border border-white/[0.08] flex items-center justify-center">
            <Bot className="h-4.5 w-4.5 text-[#818cf8]" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-white tracking-tight">TinyFish AI Agent Grid</h3>
            <p className="text-[11px] text-neutral-500">16 agents · 3 tiers · real-time intelligence</p>
          </div>
        </div>
        {!supplierName && (
          <div className="flex items-center gap-2">
            <select
              value={activeSupplier}
              onChange={(e) => setActiveSupplier(e.target.value)}
              disabled={scanning}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#818cf8]/30"
            >
              <option value="">Select supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.supplier_name}>{s.supplier_name}</option>
              ))}
            </select>
            <button
              onClick={() => activeSupplier && runScan(activeSupplier)}
              disabled={scanning || !activeSupplier}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                scanning
                  ? 'bg-[#818cf8]/20 text-[#818cf8] border border-[#818cf8]/20'
                  : 'bg-gradient-to-r from-[#818cf8] to-[#c084fc] text-white hover:shadow-[0_0_20px_rgba(129,140,248,0.3)] disabled:opacity-40'
              )}
            >
              {scanning ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Run Scan
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tier sections */}
      {tierLabels.map((tier) => (
        <div key={tier.label}>
          <p className={cn('text-[10px] font-bold uppercase tracking-[0.15em] mb-2', tier.color)}>
            {tier.label}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {tasks.slice(tier.range[0], tier.range[1]).map((task) => {
              const Icon = task.icon;
              return (
                <motion.div
                  key={task.id}
                  className={cn(
                    'relative rounded-xl border p-3 transition-all duration-300 overflow-hidden group',
                    task.status === 'running'
                      ? cn(task.bgColor, task.borderColor, 'shadow-lg')
                      : task.status === 'idle'
                        ? 'bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03]'
                        : task.status === 'warning'
                          ? 'bg-amber-500/[0.04] border-amber-500/15'
                          : task.status === 'error'
                            ? 'bg-red-500/[0.04] border-red-500/15'
                            : 'bg-emerald-500/[0.03] border-emerald-500/15'
                  )}
                  animate={task.status === 'running' ? { scale: [1, 1.01, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {/* Progress bar */}
                  {task.status === 'running' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/[0.05]">
                      <motion.div
                        className={cn('h-full rounded-full', task.color.replace('text-', 'bg-'))}
                        initial={{ width: '0%' }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-2">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', task.bgColor, 'border', task.borderColor)}>
                      <Icon className={cn('h-3.5 w-3.5', task.color)} />
                    </div>
                    {statusIcon(task.status)}
                  </div>
                  <p className="text-[11px] font-semibold text-white truncate">{task.name}</p>
                  <p className="text-[9px] text-neutral-600 truncate">{task.description}</p>

                  {/* Result overlay */}
                  <AnimatePresence>
                    {task.result && task.status !== 'idle' && task.status !== 'running' && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5"
                      >
                        <p className={cn(
                          'text-[9px] font-medium truncate',
                          task.status === 'warning' ? 'text-amber-400' :
                          task.status === 'error' ? 'text-red-400' : 'text-emerald-400/70'
                        )}>
                          {task.result}
                        </p>
                        {task.duration && (
                          <p className="text-[8px] text-neutral-700">{task.duration}ms</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Scan Summary */}
      <AnimatePresence>
        {scanComplete && scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Scan Complete — {activeSupplier}</span>
              </div>
              <span className="text-[10px] text-neutral-600">16 agents · {totalTime}s</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-lg font-heading font-bold text-white">{scanResult.risk_score}</p>
                <p className="text-[9px] text-neutral-600 uppercase tracking-wider">Risk Score</p>
              </div>
              <div className="text-center">
                <p className={cn('text-lg font-heading font-bold',
                  scanResult.risk_level === 'critical' ? 'text-red-400' :
                  scanResult.risk_level === 'high' ? 'text-orange-400' :
                  scanResult.risk_level === 'medium' ? 'text-yellow-400' : 'text-emerald-400'
                )}>
                  {scanResult.risk_level.toUpperCase()}
                </p>
                <p className="text-[9px] text-neutral-600 uppercase tracking-wider">Risk Level</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-heading font-bold text-white">{scanResult.violations.length}</p>
                <p className="text-[9px] text-neutral-600 uppercase tracking-wider">Violations</p>
              </div>
              <div className="text-center">
                <p className={cn('text-lg font-heading font-bold', scanResult.simulation_output.csrd_compliant ? 'text-emerald-400' : 'text-red-400')}>
                  {scanResult.simulation_output.csrd_compliant ? 'YES' : 'NO'}
                </p>
                <p className="text-[9px] text-neutral-600 uppercase tracking-wider">CSRD</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
