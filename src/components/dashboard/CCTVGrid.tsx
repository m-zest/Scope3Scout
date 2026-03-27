import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Scale,
  Newspaper,
  Award,
  Users,
  Play,
  Loader2,
  Search,
  FileText,
  Shield,
  Brain,
  AlertTriangle,
  Zap,
  Bot,
  Key,
  ExternalLink,
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
import { LiveAgentCard } from './LiveAgentCard';
import { MissionControl } from './MissionControl';
import { TimelineFeed, type TimelineEntry } from './TimelineFeed';
import { ContradictionPanel, type Contradiction } from './ContradictionPanel';
import { ActionPanel } from './ActionPanel';

export type AgentStatus = 'idle' | 'queued' | 'running' | 'success' | 'warning' | 'error';

export interface AgentTask {
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
  screenshots: string[];
  duration?: number;
  url?: string;
  currentUrl?: string;
  expanded?: boolean;
}

const agentMeta: Record<string, { name: string; description: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  website: { name: 'Website Scanner', description: 'Extract ESG claims', icon: Globe, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
  regulatory: { name: 'Regulatory Check', description: 'Search fines & penalties', icon: Scale, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  news: { name: 'News Intel', description: 'Scan news coverage', icon: Newspaper, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  certs: { name: 'Cert Verifier', description: 'Verify ISO certs', icon: Award, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  linkedin: { name: 'LinkedIn Intel', description: 'Detect departures', icon: Users, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
  supply: { name: 'Supply Chain Map', description: 'Map sub-suppliers', icon: Search, color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20' },
  financial: { name: 'Financial Risk', description: 'Analyze finances', icon: FileText, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
  compliance: { name: 'CSRD Validator', description: 'Check CSRD reports', icon: Shield, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' },
  classifier: { name: 'Violation Classifier', description: 'Classify severity', icon: Brain, color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-500/10', borderColor: 'border-fuchsia-500/20' },
  greenwash: { name: 'Greenwash Detector', description: 'Find discrepancies', icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
  evidence: { name: 'Evidence Extractor', description: 'Rank evidence', icon: Zap, color: 'text-teal-400', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/20' },
  sentiment: { name: 'Sentiment Analyzer', description: 'Public sentiment', icon: Bot, color: 'text-sky-400', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/20' },
  regulator: { name: 'Regulator Agent', description: 'Predict enforcement', icon: Scale, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  media: { name: 'Media Agent', description: 'Predict coverage', icon: Newspaper, color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
  investor: { name: 'Investor Agent', description: 'Predict ESG funds', icon: FileText, color: 'text-lime-400', bgColor: 'bg-lime-500/10', borderColor: 'border-lime-500/20' },
  ngo: { name: 'NGO Agent', description: 'Predict NGO response', icon: Users, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
};

const allAgentIds = [
  'website', 'regulatory', 'news', 'certs',
  'linkedin', 'supply', 'financial', 'compliance',
  'classifier', 'greenwash', 'evidence', 'sentiment',
  'regulator', 'media', 'investor', 'ngo',
];

const tierLabels = [
  { label: 'TIER 1 — TinyFish Web Scraping Agents', color: 'text-cyan-400', range: [0, 8] as const, live: true },
  { label: 'TIER 2 — LLM Analysis Agents', color: 'text-fuchsia-400', range: [8, 12] as const, live: false },
  { label: 'TIER 3 — Risk Simulation Agents', color: 'text-red-400', range: [12, 16] as const, live: false },
];

function initTasks(): AgentTask[] {
  return allAgentIds.map((id) => {
    const m = agentMeta[id];
    return { ...m, id, status: 'idle' as AgentStatus, progress: 0, steps: [], screenshots: [], expanded: false };
  });
}

interface CCTVGridProps {
  supplierName?: string;
  onScanComplete?: (result: DemoScanResult & { id: string }) => void;
}

export function CCTVGrid({ supplierName, onScanComplete }: CCTVGridProps) {
  const [tasks, setTasks] = useState<AgentTask[]>(initTasks());
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState(supplierName || '');
  const [scanResult, setScanResult] = useState<(DemoScanResult & { id: string }) | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [agentsComplete, setAgentsComplete] = useState(0);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [elapsed, setElapsed] = useState(0);

  const suppliers = getDemoSuppliers();
  const isLive = hasTinyFishKey();

  const addTimelineEntry = useCallback((entry: Omit<TimelineEntry, 'id' | 'timestamp'>) => {
    setTimeline((prev) => [...prev, { ...entry, id: `t-${Date.now()}-${Math.random()}`, timestamp: Date.now() }]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<AgentTask>) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  const runScan = useCallback(async (targetSupplier: string) => {
    setScanning(true);
    setScanComplete(false);
    setScanResult(null);
    setActiveSupplier(targetSupplier);
    setExpandedTask(null);
    setTimeline([]);
    setContradictions([]);
    setAgentsComplete(0);
    setScanStatus('scanning');
    setElapsed(0);
    const startTime = Date.now();

    // Elapsed timer
    const elapsedInterval = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 100);

    // Reset all tasks
    setTasks(initTasks().map((t) => ({ ...t, status: 'queued' as AgentStatus })));

    addTimelineEntry({ agent: 'System', message: `Starting compliance audit for ${targetSupplier}`, type: 'info' });

    const demo = suppliers.find((s) => s.supplier_name === targetSupplier) || suppliers[0];
    const supplierInput = {
      name: demo.supplier_name,
      website: demo.website,
      country: demo.country,
      industry: demo.industry,
    };

    const tier1Tasks = buildAgentTasks(supplierInput);
    let completedCount = 0;

    // === TIER 1: Run 8 agents via TinyFish (parallel batches of 2) ===
    const batchSize = 2;
    for (let batch = 0; batch < tier1Tasks.length; batch += batchSize) {
      const batchTasks = tier1Tasks.slice(batch, batch + batchSize);

      await Promise.all(batchTasks.map(async (agentTask: TinyFishAgentTask) => {
        const taskId = agentTask.id;
        const taskStart = Date.now();
        const meta = agentMeta[taskId];

        updateTask(taskId, { status: 'running', progress: 10, url: agentTask.url, steps: [], screenshots: [], currentUrl: agentTask.url });
        addTimelineEntry({ agent: meta.name, message: `Navigating to target`, type: 'action', url: agentTask.url });

        let stepCount = 0;
        const result = await runTinyFishAgent(agentTask, (event: TinyFishSSEEvent) => {
          stepCount++;
          const progress = Math.min(10 + (stepCount * 15), 90);

          if (event.type === 'step') {
            setTasks((prev) => prev.map((t) =>
              t.id === taskId ? {
                ...t,
                progress,
                steps: [...(t.steps || []), event.data],
                screenshots: event.screenshot ? [...(t.screenshots || []), event.screenshot] : (t.screenshots || []),
                currentUrl: event.url || t.currentUrl,
              } : t
            ));
            addTimelineEntry({ agent: meta.name, message: event.data, type: 'step', url: event.url });
          }
        });

        const taskElapsed = Date.now() - taskStart;
        const hasIssues = result.result.includes('MISMATCH') ||
          result.result.toLowerCase().includes('fine') ||
          result.result.toLowerCase().includes('violation') ||
          result.result.toLowerCase().includes('penalty') ||
          result.result.toLowerCase().includes('expired') ||
          result.result.toLowerCase().includes('found:');

        // Detect contradictions
        if (result.result.includes('MISMATCH') || result.result.includes('FOUND:')) {
          const lines = result.result.split('. ');
          const claimLine = lines.find(l => l.includes('claims') || l.includes('certified') || l.includes('claim')) || lines[0];
          const evidenceLine = lines.find(l => l.includes('MISMATCH') || l.includes('expired') || l.includes('FOUND')) || lines[1] || lines[0];

          setContradictions((prev) => [...prev, {
            id: `c-${taskId}-${Date.now()}`,
            agent: meta.name,
            claim: claimLine.trim(),
            evidence: evidenceLine.trim(),
            confidence: 0.85 + Math.random() * 0.12,
            sourceUrl: agentTask.url,
            severity: result.result.includes('MISMATCH') ? 'critical' : 'high',
          }]);

          addTimelineEntry({ agent: meta.name, message: `CONTRADICTION DETECTED: ${evidenceLine.trim().substring(0, 80)}`, type: 'contradiction' });
        }

        updateTask(taskId, {
          status: result.error ? 'error' : hasIssues ? 'warning' : 'success',
          progress: 100,
          result: result.error || result.result || 'Complete',
          duration: taskElapsed,
          screenshots: result.screenshots || [],
        });

        completedCount++;
        setAgentsComplete(completedCount);

        addTimelineEntry({
          agent: meta.name,
          message: hasIssues
            ? `Issues found: ${(result.result || '').substring(0, 60)}...`
            : 'Scan complete — no issues',
          type: hasIssues ? 'warning' : 'success',
        });
      }));
    }

    // === TIER 2: LLM Analysis ===
    addTimelineEntry({ agent: 'System', message: 'Starting Tier 2 — LLM analysis on scraped data', type: 'info' });
    const tier2Ids = ['classifier', 'greenwash', 'evidence', 'sentiment'];
    for (const taskId of tier2Ids) {
      const meta = agentMeta[taskId];
      updateTask(taskId, { status: 'running', progress: 30, steps: ['Analyzing Tier 1 results...'] });
      addTimelineEntry({ agent: meta.name, message: 'Analyzing Tier 1 data...', type: 'step' });

      await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
      updateTask(taskId, { progress: 70, steps: ['Analyzing Tier 1 results...', 'Cross-referencing claims vs evidence...'] });

      await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));

      const hasViolations = demo.violations.length > 0;
      const tier2Results: Record<string, string> = {
        classifier: hasViolations ? `${demo.violations.length} violation(s) classified — ${demo.violations[0]?.severity} severity` : 'No violations to classify',
        greenwash: demo.tier1_result.discrepancies.length > 0
          ? `CLAIM–EVIDENCE MISMATCH: ${demo.tier1_result.discrepancies.length} greenwashing discrepancy found — "${demo.tier1_result.discrepancies[0].claim}" contradicted by evidence`
          : 'No claim discrepancies detected',
        evidence: hasViolations ? `${demo.violations.length} evidence chain(s) verified with source links` : 'No evidence to extract',
        sentiment: hasViolations ? 'Negative sentiment detected in recent coverage — risk elevated' : 'Neutral/positive public sentiment',
      };

      const isWarn = hasViolations && (taskId === 'classifier' || taskId === 'greenwash');
      const taskResult = tier2Results[taskId];

      // Detect greenwash contradiction
      if (taskId === 'greenwash' && demo.tier1_result.discrepancies.length > 0) {
        const d = demo.tier1_result.discrepancies[0];
        setContradictions((prev) => [...prev, {
          id: `c-greenwash-${Date.now()}`,
          agent: 'Greenwash Detector',
          claim: d.claim,
          evidence: d.finding,
          confidence: d.confidence,
          sourceUrl: d.source_url,
          severity: 'critical',
        }]);
        addTimelineEntry({ agent: meta.name, message: `GREENWASH DETECTED: "${d.claim}" contradicted`, type: 'contradiction' });
      }

      updateTask(taskId, {
        status: isWarn ? 'warning' : 'success',
        progress: 100,
        result: taskResult,
        duration: Math.round(700 + Math.random() * 300),
        steps: ['Analyzing Tier 1 results...', 'Cross-referencing claims vs evidence...', 'Generating report...'],
      });

      completedCount++;
      setAgentsComplete(completedCount);
      addTimelineEntry({ agent: meta.name, message: taskResult.substring(0, 80), type: isWarn ? 'warning' : 'success' });
    }

    // === TIER 3: Risk Simulation ===
    addTimelineEntry({ agent: 'System', message: 'Starting Tier 3 — Risk simulation', type: 'info' });
    const tier3Ids = ['regulator', 'media', 'investor', 'ngo'];
    for (const taskId of tier3Ids) {
      const meta = agentMeta[taskId];
      updateTask(taskId, { status: 'running', progress: 40, steps: ['Running Monte Carlo simulation...'] });
      addTimelineEntry({ agent: meta.name, message: 'Running simulation...', type: 'step' });

      await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
      updateTask(taskId, { progress: 80, steps: ['Running Monte Carlo simulation...', 'Computing probability distributions...'] });

      await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

      const pred = demo.simulation_output.predictions.find((p) => p.agent_type === taskId);
      const isRisky = pred ? pred.probability > 0.4 : false;
      const taskResult = pred
        ? `${Math.round(pred.probability * 100)}% probability — ${pred.timeline_days}d timeline — ${pred.prediction}`
        : 'Low risk — no action needed';

      updateTask(taskId, {
        status: isRisky ? 'warning' : 'success',
        progress: 100,
        result: taskResult,
        duration: Math.round(500 + Math.random() * 300),
        steps: ['Running Monte Carlo simulation...', 'Computing probability distributions...', 'Finalizing prediction...'],
      });

      completedCount++;
      setAgentsComplete(completedCount);
      addTimelineEntry({ agent: meta.name, message: taskResult.substring(0, 80), type: isRisky ? 'warning' : 'success' });
    }

    clearInterval(elapsedInterval);
    const finalElapsed = (Date.now() - startTime) / 1000;
    setElapsed(finalElapsed);
    setTotalTime(parseFloat(finalElapsed.toFixed(1)));
    setScanResult(demo);
    setScanComplete(true);
    setScanning(false);
    setScanStatus('complete');

    addTimelineEntry({
      agent: 'System',
      message: `Audit complete — ${contradictions.length} contradictions found in ${finalElapsed.toFixed(1)}s`,
      type: contradictions.length > 0 ? 'warning' : 'success',
    });

    onScanComplete?.(demo);
  }, [suppliers, updateTask, addTimelineEntry, onScanComplete]);

  const toggleExpand = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <div className="space-y-5">
      {/* Mission Control Header */}
      <MissionControl
        supplierName={activeSupplier}
        status={scanStatus}
        progress={allAgentIds.length > 0 ? (agentsComplete / allAgentIds.length) * 100 : 0}
        agentsComplete={agentsComplete}
        totalAgents={allAgentIds.length}
        elapsed={elapsed}
        contradictions={contradictions.length}
      />

      {/* Supplier selector + Run button */}
      {!supplierName && (
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={activeSupplier}
            onChange={(e) => setActiveSupplier(e.target.value)}
            disabled={scanning}
            className="flex-1 max-w-xs px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
          >
            <option value="">Select supplier to audit...</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.supplier_name}>{s.supplier_name} — {s.country}</option>
            ))}
          </select>
          <button
            onClick={() => activeSupplier && runScan(activeSupplier)}
            disabled={scanning || !activeSupplier}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all',
              scanning
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-40'
            )}
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Audit
              </>
            )}
          </button>
          {!isLive && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/[0.05] border border-amber-500/10 text-[11px] text-amber-400/80">
              <Key className="h-3 w-3 shrink-0" />
              <span>
                Add API key in <strong>Settings</strong> for live scraping.{' '}
                <a href="https://agent.tinyfish.ai/sign-up" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-0.5">
                  Get key <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid Layout: CCTV + Timeline side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Left: CCTV Agent Grid */}
        <div className="space-y-4">
          {tierLabels.map((tier) => (
            <div key={tier.label}>
              <p className={cn('text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 flex items-center gap-2', tier.color)}>
                {tier.label}
                {tier.live && isLive && (
                  <span className="relative flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[8px] text-red-400">LIVE</span>
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {tasks.slice(tier.range[0], tier.range[1]).map((task) => (
                  <LiveAgentCard
                    key={task.id}
                    {...task}
                    isLive={isLive && tier.live}
                    onClick={() => task.status !== 'idle' && task.status !== 'queued' && toggleExpand(task.id)}
                    isExpanded={expandedTask === task.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Timeline Feed */}
        {(scanning || scanComplete) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:sticky xl:top-4 xl:self-start"
          >
            <TimelineFeed entries={timeline} />
          </motion.div>
        )}
      </div>

      {/* Contradiction Panel */}
      {contradictions.length > 0 && (
        <ContradictionPanel contradictions={contradictions} />
      )}

      {/* Action Panel */}
      {scanComplete && scanResult && (
        <ActionPanel
          supplierName={activeSupplier}
          scanResult={scanResult}
          contradictions={contradictions}
          totalTime={totalTime}
          isLive={isLive}
        />
      )}
    </div>
  );
}
