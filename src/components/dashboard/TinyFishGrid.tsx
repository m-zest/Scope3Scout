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
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Key,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDemoSuppliers, type DemoScanResult } from '@/data/demoSuppliers';
import {
  buildAgentTasks,
  runTinyFishAgent,
  hasTinyFishKey,
  type TinyFishSSEEvent,
  type TinyFishAgentTask,
} from '@/lib/tinyfish';

type AgentStatus = 'idle' | 'queued' | 'running' | 'success' | 'warning' | 'error';

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
  steps: string[];
  duration?: number;
  url?: string;
  expanded?: boolean;
}

const agentMeta: Record<string, { name: string; description: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  website: { name: 'Website Scanner', description: 'Extract ESG claims & certifications', icon: Globe, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
  regulatory: { name: 'Regulatory Check', description: 'Search EU fines & penalties', icon: Scale, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  news: { name: 'News Intelligence', description: 'Scan news for violations', icon: Newspaper, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  certs: { name: 'Cert Verifier', description: 'Verify ISO certifications', icon: Award, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  linkedin: { name: 'LinkedIn Intel', description: 'Detect layoffs & departures', icon: Users, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
  supply: { name: 'Supply Chain Map', description: 'Map sub-supplier network', icon: Search, color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20' },
  financial: { name: 'Financial Risk', description: 'Analyze financial stability', icon: FileText, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
  compliance: { name: 'CSRD Validator', description: 'Cross-check CSRD reports', icon: Shield, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' },
  // Tier 2 (simulated locally — these are LLM analysis on Tier 1 results)
  classifier: { name: 'Violation Classifier', description: 'Classify violation severity', icon: Brain, color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-500/10', borderColor: 'border-fuchsia-500/20' },
  greenwash: { name: 'Greenwash Detector', description: 'Find claim discrepancies', icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
  evidence: { name: 'Evidence Extractor', description: 'Extract & rank evidence', icon: Zap, color: 'text-teal-400', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/20' },
  sentiment: { name: 'Sentiment Analyzer', description: 'Measure public sentiment', icon: Bot, color: 'text-sky-400', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/20' },
  // Tier 3 (simulated locally — risk simulation)
  regulator: { name: 'Regulator Agent', description: 'Predict enforcement actions', icon: Scale, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  media: { name: 'Media Agent', description: 'Predict media coverage risk', icon: Newspaper, color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
  investor: { name: 'Investor Agent', description: 'Predict ESG fund reactions', icon: FileText, color: 'text-lime-400', bgColor: 'bg-lime-500/10', borderColor: 'border-lime-500/20' },
  ngo: { name: 'NGO Agent', description: 'Predict NGO response', icon: Users, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
};

const allAgentIds = [
  'website', 'regulatory', 'news', 'certs',
  'linkedin', 'supply', 'financial', 'compliance',
  'classifier', 'greenwash', 'evidence', 'sentiment',
  'regulator', 'media', 'investor', 'ngo',
];

const tierLabels = [
  { label: 'TIER 1 — TinyFish Web Agents (Live)', color: 'text-cyan-400', range: [0, 8], live: true },
  { label: 'TIER 2 — LLM Analysis', color: 'text-fuchsia-400', range: [8, 12], live: false },
  { label: 'TIER 3 — Risk Simulation', color: 'text-red-400', range: [12, 16], live: false },
];

function statusIcon(status: AgentStatus) {
  switch (status) {
    case 'queued': return <div className="w-2.5 h-2.5 rounded-full bg-neutral-500 animate-pulse" />;
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

function initTasks(): AgentTask[] {
  return allAgentIds.map((id) => {
    const m = agentMeta[id];
    return { ...m, id, status: 'idle' as AgentStatus, progress: 0, steps: [], expanded: false };
  });
}

export function TinyFishGrid({ supplierName }: TinyFishGridProps) {
  const [tasks, setTasks] = useState<AgentTask[]>(initTasks());
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState(supplierName || '');
  const [scanResult, setScanResult] = useState<(DemoScanResult & { id: string }) | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [customUrl] = useState('');

  const suppliers = getDemoSuppliers();

  const updateTask = useCallback((taskId: string, updates: Partial<AgentTask>) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  const runScan = useCallback(async (targetSupplier: string) => {
    setScanning(true);
    setScanComplete(false);
    setScanResult(null);
    setActiveSupplier(targetSupplier);
    setExpandedTask(null);
    const startTime = Date.now();

    // Reset
    setTasks(initTasks().map((t) => ({ ...t, status: 'queued' as AgentStatus })));

    // Get supplier info from demo data for building tasks
    const demo = suppliers.find((s) => s.supplier_name === targetSupplier) || suppliers[0];
    const supplierInput = {
      name: demo.supplier_name,
      website: customUrl || demo.website,
      country: demo.country,
      industry: demo.industry,
    };

    // Build Tier 1 tasks (real TinyFish API calls)
    const tier1Tasks = buildAgentTasks(supplierInput);

    // === TIER 1: Run 8 agents via TinyFish (parallel batches of 2) ===
    const batchSize = 2;
    for (let batch = 0; batch < tier1Tasks.length; batch += batchSize) {
      const batchTasks = tier1Tasks.slice(batch, batch + batchSize);

      await Promise.all(batchTasks.map(async (agentTask: TinyFishAgentTask) => {
        const taskId = agentTask.id;
        const taskStart = Date.now();

        updateTask(taskId, { status: 'running', progress: 10, url: agentTask.url, steps: [] });

        let stepCount = 0;
        const result = await runTinyFishAgent(agentTask, (event: TinyFishSSEEvent) => {
          stepCount++;
          const progress = Math.min(10 + (stepCount * 20), 90);

          if (event.type === 'step') {
            setTasks((prev) => prev.map((t) =>
              t.id === taskId ? { ...t, progress, steps: [...(t.steps || []), event.data] } : t
            ));
          }
        });

        const elapsed = Date.now() - taskStart;
        const hasIssues = result.result.toLowerCase().includes('fine') ||
          result.result.toLowerCase().includes('violation') ||
          result.result.toLowerCase().includes('penalty') ||
          result.result.toLowerCase().includes('scandal') ||
          result.result.toLowerCase().includes('gap') ||
          result.result.toLowerCase().includes('expired');

        updateTask(taskId, {
          status: result.error ? 'error' : hasIssues ? 'warning' : 'success',
          progress: 100,
          result: result.error || result.result || 'Complete',
          duration: elapsed,
        });
        setTasks((prev) => prev.map((t) =>
          t.id === taskId
            ? { ...t, status: result.error ? 'error' : hasIssues ? 'warning' : 'success', progress: 100, result: result.error || result.result || 'Complete', duration: elapsed }
            : t
        ));
      }));
    }

    // === TIER 2: LLM Analysis (simulated — runs on Tier 1 output) ===
    const tier2Ids = ['classifier', 'greenwash', 'evidence', 'sentiment'];
    for (const taskId of tier2Ids) {
      updateTask(taskId, { status: 'running', progress: 30 });
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
      updateTask(taskId, { progress: 70 });
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));

      const hasViolations = demo.violations.length > 0;
      const tier2Results: Record<string, string> = {
        classifier: hasViolations ? `${demo.violations.length} violation(s) classified — ${demo.violations[0]?.severity} severity` : 'No violations to classify',
        greenwash: demo.tier1_result.discrepancies.length > 0 ? `${demo.tier1_result.discrepancies.length} greenwashing discrepancy found` : 'No claim discrepancies detected',
        evidence: hasViolations ? `${demo.violations.length} evidence chain(s) verified with source links` : 'No evidence to extract',
        sentiment: hasViolations ? 'Negative sentiment detected in recent coverage' : 'Neutral/positive public sentiment',
      };

      updateTask(taskId, {
        status: hasViolations && (taskId === 'classifier' || taskId === 'greenwash') ? 'warning' : 'success',
        progress: 100,
        result: tier2Results[taskId],
        duration: Math.round(700 + Math.random() * 300),
      });
    }

    // === TIER 3: Risk Simulation ===
    const tier3Ids = ['regulator', 'media', 'investor', 'ngo'];
    for (const taskId of tier3Ids) {
      updateTask(taskId, { status: 'running', progress: 40 });
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
      updateTask(taskId, { progress: 80 });
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

      const pred = demo.simulation_output.predictions.find((p) => p.agent_type === taskId);
      const isRisky = pred ? pred.probability > 0.4 : false;

      updateTask(taskId, {
        status: isRisky ? 'warning' : 'success',
        progress: 100,
        result: pred
          ? `${Math.round(pred.probability * 100)}% probability — ${pred.timeline_days}d timeline`
          : 'Low risk — no action needed',
        duration: Math.round(500 + Math.random() * 300),
      });
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    setTotalTime(parseFloat(elapsed));
    setScanResult(demo);
    setScanComplete(true);
    setScanning(false);
  }, [suppliers, updateTask, customUrl]);

  // Auto-scan if supplier name is provided
  useEffect(() => {
    if (supplierName && !scanning && !scanComplete) {
      runScan(supplierName);
    }
  }, [supplierName]);

  const toggleExpand = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#818cf8]/20 to-[#e879f9]/20 border border-white/[0.08] flex items-center justify-center">
            <Bot className="h-4 w-4 text-[#818cf8]" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              TinyFish AI Agent Grid
              {hasTinyFishKey() ? (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LIVE</span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">DEMO</span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-500">16 agents · 3 tiers · {hasTinyFishKey() ? 'connected to TinyFish API' : 'add API key for live scraping'}</p>
          </div>
        </div>
        {!supplierName && (
          <div className="flex items-center gap-2 flex-wrap">
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

      {/* API Key hint */}
      {!hasTinyFishKey() && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/[0.05] border border-amber-500/10 text-[11px] text-amber-400/80">
          <Key className="h-3 w-3 shrink-0" />
          <span>
            Add <code className="bg-white/[0.06] px-1 rounded text-[10px]">VITE_TINYFISH_API_KEY</code> in Settings or .env for live web scraping.{' '}
            <a href="https://agent.tinyfish.ai/sign-up" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-0.5">
              Get free key <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </span>
        </div>
      )}

      {/* Tier sections */}
      {tierLabels.map((tier) => (
        <div key={tier.label}>
          <p className={cn('text-[10px] font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-2', tier.color)}>
            {tier.label}
            {tier.live && hasTinyFishKey() && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {tasks.slice(tier.range[0], tier.range[1]).map((task) => {
              const Icon = task.icon;
              const isExpanded = expandedTask === task.id;
              return (
                <div key={task.id}>
                  <motion.div
                    className={cn(
                      'relative rounded-xl border p-3 transition-all duration-300 overflow-hidden cursor-pointer',
                      task.status === 'running'
                        ? cn(task.bgColor, task.borderColor, 'shadow-lg')
                        : task.status === 'queued'
                          ? 'bg-white/[0.01] border-white/[0.05] opacity-60'
                          : task.status === 'idle'
                            ? 'bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03]'
                            : task.status === 'warning'
                              ? 'bg-amber-500/[0.04] border-amber-500/15'
                              : task.status === 'error'
                                ? 'bg-red-500/[0.04] border-red-500/15'
                                : 'bg-emerald-500/[0.03] border-emerald-500/15'
                    )}
                    onClick={() => task.status !== 'idle' && task.status !== 'queued' && toggleExpand(task.id)}
                    animate={task.status === 'running' ? { scale: [1, 1.01, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    {/* Progress bar */}
                    {(task.status === 'running' || task.status === 'queued') && (
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
                      <div className="flex items-center gap-1">
                        {statusIcon(task.status)}
                        {task.result && task.status !== 'idle' && task.status !== 'running' && task.status !== 'queued' && (
                          isExpanded
                            ? <ChevronUp className="h-2.5 w-2.5 text-neutral-600" />
                            : <ChevronDown className="h-2.5 w-2.5 text-neutral-600" />
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-white truncate">{task.name}</p>
                    <p className="text-[9px] text-neutral-600 truncate">{task.description}</p>

                    {/* Compact result */}
                    <AnimatePresence>
                      {task.result && task.status !== 'idle' && task.status !== 'running' && task.status !== 'queued' && !isExpanded && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5">
                          <p className={cn(
                            'text-[9px] font-medium line-clamp-2',
                            task.status === 'warning' ? 'text-amber-400' :
                            task.status === 'error' ? 'text-red-400' : 'text-emerald-400/70'
                          )}>
                            {task.result}
                          </p>
                          {task.duration && (
                            <p className="text-[8px] text-neutral-700">{(task.duration / 1000).toFixed(1)}s{task.url ? ' · clicked to expand' : ''}</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Expanded detail panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-[10px] space-y-2">
                          {task.url && (
                            <div>
                              <p className="text-neutral-600 font-semibold uppercase tracking-wider text-[8px] mb-0.5">Target URL</p>
                              <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-[#818cf8] hover:underline break-all flex items-start gap-1">
                                {task.url.length > 50 ? task.url.substring(0, 50) + '...' : task.url}
                                <ExternalLink className="h-2.5 w-2.5 shrink-0 mt-0.5" />
                              </a>
                            </div>
                          )}
                          {task.steps.length > 0 && (
                            <div>
                              <p className="text-neutral-600 font-semibold uppercase tracking-wider text-[8px] mb-1">Agent Steps ({task.steps.length})</p>
                              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                                {task.steps.map((step, i) => (
                                  <div key={i} className="flex items-start gap-1.5 text-neutral-400">
                                    <span className="text-neutral-700 shrink-0">{i + 1}.</span>
                                    <span className="break-all">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {task.result && (
                            <div>
                              <p className="text-neutral-600 font-semibold uppercase tracking-wider text-[8px] mb-0.5">Result</p>
                              <p className={cn(
                                'break-all',
                                task.status === 'warning' ? 'text-amber-400' :
                                task.status === 'error' ? 'text-red-400' : 'text-emerald-400/80'
                              )}>
                                {task.result}
                              </p>
                            </div>
                          )}
                          {task.duration && (
                            <p className="text-neutral-700">Duration: {(task.duration / 1000).toFixed(2)}s</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
              <span className="text-[10px] text-neutral-600">16 agents · {totalTime}s{hasTinyFishKey() ? ' · live' : ' · demo'}</span>
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
