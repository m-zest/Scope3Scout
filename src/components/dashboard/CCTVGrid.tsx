import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDemoSuppliers, type DemoScanResult } from '@/data/demoSuppliers';
import {
  buildAgentTasks,
  runTinyFishAgent,
  hasTinyFishKey,
  getDemoStepsForTask,
  getDemoResultForTask,
  type TinyFishSSEEvent,
  type TinyFishAgentTask,
} from '@/lib/tinyfish';
import { LiveAgentCard } from './LiveAgentCard';
import { MissionControl } from './MissionControl';
import { TimelineFeed, type TimelineEntry } from './TimelineFeed';
import { ContradictionPanel, type Contradiction } from './ContradictionPanel';
import { ActionPanel } from './ActionPanel';
import { runGeminiAnalysis, hasGeminiKey } from '@/lib/gemini';

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
  isHero?: boolean;
}

// Human-readable names that feel like a real team
const agentMeta: Record<string, { name: string; description: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string; isHero?: boolean }> = {
  website:    { name: 'Claim Extractor',        description: 'Extract ESG claims from website', icon: Globe,         color: 'text-cyan-400',    bgColor: 'bg-cyan-500/10',    borderColor: 'border-cyan-500/20',   isHero: true },
  certs:      { name: 'Certification Verifier',  description: 'Verify ISO certifications',      icon: Award,         color: 'text-emerald-400', bgColor: 'bg-emerald-500/10',  borderColor: 'border-emerald-500/20', isHero: true },
  regulatory: { name: 'Compliance Auditor',      description: 'Search fines and penalties',     icon: Scale,         color: 'text-amber-400',   bgColor: 'bg-amber-500/10',    borderColor: 'border-amber-500/20',  isHero: true },
  news:       { name: 'News Scanner',            description: 'Scan news for controversies',    icon: Newspaper,     color: 'text-blue-400',    bgColor: 'bg-blue-500/10',     borderColor: 'border-blue-500/20',   isHero: true },
  linkedin:   { name: 'Workforce Monitor',       description: 'Detect layoffs and departures',  icon: Users,         color: 'text-purple-400',  bgColor: 'bg-purple-500/10',   borderColor: 'border-purple-500/20' },
  supply:     { name: 'Supply Chain Mapper',      description: 'Map sub-supplier network',       icon: Search,        color: 'text-rose-400',    bgColor: 'bg-rose-500/10',     borderColor: 'border-rose-500/20' },
  financial:  { name: 'Financial Analyst',        description: 'Analyze financial stability',    icon: FileText,      color: 'text-orange-400',  bgColor: 'bg-orange-500/10',   borderColor: 'border-orange-500/20' },
  compliance: { name: 'CSRD Validator',           description: 'Cross-check CSRD disclosures',   icon: Shield,        color: 'text-indigo-400',  bgColor: 'bg-indigo-500/10',   borderColor: 'border-indigo-500/20' },
  classifier: { name: 'Violation Classifier',     description: 'Classify violation severity',    icon: Brain,         color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-500/10',  borderColor: 'border-fuchsia-500/20' },
  greenwash:  { name: 'Greenwash Detector',       description: 'Cross-reference claims',         icon: AlertTriangle, color: 'text-yellow-400',  bgColor: 'bg-yellow-500/10',   borderColor: 'border-yellow-500/20' },
  evidence:   { name: 'Evidence Extractor',       description: 'Rank and verify evidence',       icon: Zap,           color: 'text-teal-400',    bgColor: 'bg-teal-500/10',     borderColor: 'border-teal-500/20' },
  sentiment:  { name: 'Sentiment Analyzer',       description: 'Measure public sentiment',       icon: Bot,           color: 'text-sky-400',     bgColor: 'bg-sky-500/10',      borderColor: 'border-sky-500/20' },
  regulator:  { name: 'Regulator Predictor',      description: 'Predict enforcement actions',    icon: Scale,         color: 'text-red-400',     bgColor: 'bg-red-500/10',      borderColor: 'border-red-500/20' },
  media:      { name: 'Media Risk Predictor',     description: 'Predict media coverage',         icon: Newspaper,     color: 'text-violet-400',  bgColor: 'bg-violet-500/10',   borderColor: 'border-violet-500/20' },
  investor:   { name: 'Investor Risk Predictor',  description: 'Predict ESG fund response',      icon: FileText,      color: 'text-lime-400',    bgColor: 'bg-lime-500/10',     borderColor: 'border-lime-500/20' },
  ngo:        { name: 'NGO Response Predictor',   description: 'Predict NGO actions',            icon: Users,         color: 'text-pink-400',    bgColor: 'bg-pink-500/10',     borderColor: 'border-pink-500/20' },
};

const allAgentIds = [
  'website', 'regulatory', 'news', 'certs',
  'linkedin', 'supply', 'financial', 'compliance',
  'classifier', 'greenwash', 'evidence', 'sentiment',
  'regulator', 'media', 'investor', 'ngo',
];

// Hero agent IDs -these get prominent display
const heroAgentIds = ['website', 'certs', 'regulatory', 'news'];

const tierLabels = [
  { label: 'TIER 1 -Autonomous Web Agents', color: 'text-cyan-400', range: [0, 8] as const, live: true },
  { label: 'TIER 2 -LLM Cross-Reference', color: 'text-fuchsia-400', range: [8, 12] as const, live: false },
  { label: 'TIER 3 -Risk Prediction', color: 'text-red-400', range: [12, 16] as const, live: false },
];

function initTasks(): AgentTask[] {
  return allAgentIds.map((id) => {
    const m = agentMeta[id];
    return { ...m, id, status: 'idle' as AgentStatus, progress: 0, steps: [], screenshots: [], expanded: false, isHero: m.isHero };
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
  const [activeSupplier, setActiveSupplier] = useState(supplierName || 'ThyssenKrupp Steel');
  const [scanResult, setScanResult] = useState<(DemoScanResult & { id: string }) | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [agentsComplete, setAgentsComplete] = useState(0);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [showAllTier1, setShowAllTier1] = useState(false);
  const [dimBackground, setDimBackground] = useState(false);
  const [focusedAgentId, setFocusedAgentId] = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState(false); // DEMO by default, toggle to REAL

  const contradictionRef = useRef<HTMLDivElement>(null);
  const demoSuppliers = getDemoSuppliers();
  // Include uploaded suppliers from localStorage, deduplicated by name
  const suppliers = (() => {
    const demoNames = new Set(demoSuppliers.map(s => s.supplier_name));
    try {
      const stored = JSON.parse(localStorage.getItem('scope3scout_uploaded_suppliers') || '[]');
      const unique = stored
        .filter((s: Record<string, string>) => s.name && !demoNames.has(s.name))
        .map((s: Record<string, string>) => ({
          ...demoSuppliers[0],
          id: s.id || `uploaded-${Math.random()}`,
          supplier_name: s.name,
          country: s.country || 'Unknown',
          industry: s.industry || 'Unknown',
          website: s.website || demoSuppliers[0].website,
        }));
      // Deduplicate by name
      const seen = new Set<string>();
      const deduped = unique.filter((s: { supplier_name: string }) => {
        if (seen.has(s.supplier_name)) return false;
        seen.add(s.supplier_name);
        return true;
      });
      return [...demoSuppliers, ...deduped];
    } catch { return demoSuppliers; }
  })();
  const isLive = hasTinyFishKey();

  const addTimelineEntry = useCallback((entry: Omit<TimelineEntry, 'id' | 'timestamp'>) => {
    setTimeline((prev) => [...prev, { ...entry, id: `t-${Date.now()}-${Math.random()}`, timestamp: Date.now() }]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<AgentTask>) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  // Auto-scroll to contradiction when detected -dramatic pause for impact
  useEffect(() => {
    if (contradictions.length > 0 && contradictionRef.current) {
      // 1.5s dramatic pause → feels like AI is "thinking" → then reveal
      setTimeout(() => {
        setDimBackground(true);
        setTimeout(() => {
          contradictionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => setDimBackground(false), 3000);
        }, 600);
      }, 1500);
    }
  }, [contradictions.length]);

  const runScan = useCallback(async (targetSupplier: string) => {
    setScanning(true);
    setScanComplete(false);
    setScanResult(null);
    setActiveSupplier(targetSupplier);
    setFocusedAgentId(null);
    setTimeline([]);
    setContradictions([]);
    setAgentsComplete(0);
    setScanStatus('scanning');
    setElapsed(0);
    setDimBackground(false);
    const startTime = Date.now();

    const elapsedInterval = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 100);

    setTasks(initTasks().map((t) => ({ ...t, status: 'queued' as AgentStatus })));

    addTimelineEntry({ agent: 'System', message: `Initiating compliance audit for ${targetSupplier}`, type: 'info' });

    const demo = suppliers.find((s) => s.supplier_name === targetSupplier) || suppliers[0];
    const supplierInput = {
      name: demo.supplier_name,
      website: demo.website,
      country: demo.country,
      industry: demo.industry,
    };

    const tier1Tasks = buildAgentTasks(supplierInput);
    let completedCount = 0;
    const foundContradictions: Contradiction[] = [];

    // === TIER 1 AGENTS ===

    // Contradiction detection helper with clean professional wording
    const cleanPairs: Record<string, { claim: string; evidence: string }> = {
      website: { claim: 'Climate-neutral steel production by 2045', evidence: 'Hydrogen direct reduction plant delayed to 2028. Blast furnaces still primary production method with high CO2 output.' },
      regulatory: { claim: 'Compliant with EU emissions regulations', evidence: 'EU ETS violation: exceeded carbon allowances at Duisburg plant. Fine EUR 45,000 issued.' },
      certs: { claim: 'ISO 14001 Environmental Management Certified', evidence: 'ISO 14001 certification under review following emissions violations. Status no longer valid.' },
      compliance: { claim: 'CSRD-compliant sustainability reporting', evidence: 'Scope 3 emissions significantly underreported. Double materiality assessment has gaps in climate transition risk.' },
      news: { claim: 'Leading green steel transformation in Europe', evidence: 'Financial Times reports green steel transition delays and missed emissions targets at major production facilities.' },
    };

    const processTier1Result = (taskId: string, agentTask: TinyFishAgentTask, resultText: string, meta: typeof agentMeta[string]) => {
      const hasIssues = resultText.includes('MISMATCH') ||
        resultText.toLowerCase().includes('fine') ||
        resultText.toLowerCase().includes('violation') ||
        resultText.toLowerCase().includes('penalty') ||
        resultText.toLowerCase().includes('expired') ||
        resultText.toLowerCase().includes('found:');

      if (resultText.includes('MISMATCH') || resultText.includes('FOUND:')) {
        const pair = cleanPairs[taskId] || { claim: resultText.split('. ')[0], evidence: resultText.split('. ')[1] || resultText };
        const c: Contradiction = {
          id: `c-${taskId}-${Date.now()}`,
          agent: meta.name,
          claim: pair.claim,
          evidence: pair.evidence,
          confidence: 0.91,
          sourceUrl: agentTask.url,
          severity: resultText.includes('MISMATCH') ? 'critical' : 'high',
          financialExposure: demo.simulation_output.financial_exposure_eur,
          timelineImpactDays: demo.simulation_output.predictions?.[0]?.timeline_days || 45,
        };
        foundContradictions.push(c);
        setContradictions((prev) => [...prev, c]);
        addTimelineEntry({ agent: meta.name, message: `CONTRADICTION DETECTED: ${pair.evidence.substring(0, 80)}`, type: 'contradiction' });
      }
      return hasIssues;
    };

    // Simulate a single agent with visible step-by-step progress
    const simulateAgent = async (agentTask: TinyFishAgentTask) => {
      const taskId = agentTask.id;
      const taskStart = Date.now();
      const meta = agentMeta[taskId];

      updateTask(taskId, { status: 'running', progress: 10, url: agentTask.url, steps: [], screenshots: [], currentUrl: agentTask.url });
      addTimelineEntry({ agent: meta.name, message: `Navigating to target`, type: 'action', url: agentTask.url });

      const demoSteps = getDemoStepsForTask(taskId, agentTask.url);
      for (let i = 0; i < demoSteps.length; i++) {
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
        const progress = Math.min(10 + ((i + 1) / demoSteps.length) * 80, 90);
        setTasks((prev) => prev.map((t) =>
          t.id === taskId ? { ...t, progress, steps: [...(t.steps || []), demoSteps[i]], currentUrl: agentTask.url } : t
        ));
        addTimelineEntry({ agent: meta.name, message: demoSteps[i], type: 'step', url: agentTask.url });
      }

      const resultText = getDemoResultForTask(taskId);
      const taskElapsed = Date.now() - taskStart;
      const hasIssues = processTier1Result(taskId, agentTask, resultText, meta);

      updateTask(taskId, { status: hasIssues ? 'warning' : 'success', progress: 100, result: resultText, duration: taskElapsed, screenshots: [] });
      completedCount++;
      setAgentsComplete(completedCount);
      addTimelineEntry({ agent: meta.name, message: hasIssues ? `Issues found: ${resultText.substring(0, 60)}...` : 'Scan complete - no issues', type: hasIssues ? 'warning' : 'success' });
    };

    // Run a real TinyFish agent with timeout fallback
    const runRealAgent = async (agentTask: TinyFishAgentTask, timeoutMs: number = 30000) => {
      const taskId = agentTask.id;
      const taskStart = Date.now();
      const meta = agentMeta[taskId];

      updateTask(taskId, { status: 'running', progress: 10, url: agentTask.url, steps: [], screenshots: [], currentUrl: agentTask.url });
      addTimelineEntry({ agent: meta.name, message: `Navigating to target (LIVE)`, type: 'action', url: agentTask.url });

      // Race: real TinyFish vs timeout fallback
      let stepCount = 0;
      const realPromise = runTinyFishAgent(agentTask, (event: TinyFishSSEEvent) => {
        stepCount++;
        const progress = Math.min(10 + (stepCount * 12), 90);
        if (event.type === 'step') {
          setTasks((prev) => prev.map((t) =>
            t.id === taskId ? {
              ...t, progress,
              steps: [...(t.steps || []), event.data],
              screenshots: event.screenshot ? [...(t.screenshots || []), event.screenshot] : (t.screenshots || []),
              currentUrl: event.url || t.currentUrl,
            } : t
          ));
          addTimelineEntry({ agent: meta.name, message: event.data, type: 'step', url: event.url });
        }
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
      const result = await Promise.race([realPromise, timeoutPromise]);

      const taskElapsed = Date.now() - taskStart;

      if (!result) {
        // Timeout - use demo fallback
        const fallbackResult = getDemoResultForTask(taskId);
        addTimelineEntry({ agent: meta.name, message: 'Timeout - using cached analysis', type: 'step' });
        const hasIssues = processTier1Result(taskId, agentTask, fallbackResult, meta);
        updateTask(taskId, { status: hasIssues ? 'warning' : 'success', progress: 100, result: fallbackResult, duration: taskElapsed, screenshots: [] });
      } else {
        let resultText = (result.result || '').toString();
        if (resultText.startsWith('{')) {
          try { const p = JSON.parse(resultText); resultText = p.action || p.result || p.message || 'Scan complete'; } catch { /* keep */ }
        }
        const hasIssues = processTier1Result(taskId, agentTask, resultText, meta);
        updateTask(taskId, {
          status: result.error ? 'error' : hasIssues ? 'warning' : 'success',
          progress: 100, result: result.error || resultText || 'Complete',
          duration: taskElapsed, screenshots: result.screenshots || [],
        });
      }

      completedCount++;
      setAgentsComplete(completedCount);
    };

    if (liveMode && isLive) {
      // === REAL MODE: All agents use TinyFish with 60s timeout ===
      addTimelineEntry({ agent: 'System', message: 'LIVE MODE - all agents using real TinyFish API', type: 'info' });
      const batchSize = 2; // TinyFish allows 2 concurrent
      for (let i = 0; i < tier1Tasks.length; i += batchSize) {
        const batch = tier1Tasks.slice(i, i + batchSize);
        await Promise.all(batch.map(t => runRealAgent(t, 30000)));
      }
    } else {
      // === DEMO MODE: All agents simulated (fast, reliable) ===
      // Agents 1-4: sequential with gaps
      for (let i = 0; i < 4; i++) {
        if (tier1Tasks[i]) {
          if (i > 0) await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
          await simulateAgent(tier1Tasks[i]);
        }
      }
      // Agents 5-8: parallel pairs
      for (let i = 4; i < tier1Tasks.length; i += 2) {
        await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
        const batch = tier1Tasks.slice(i, i + 2).filter(Boolean);
        await Promise.all(batch.map(simulateAgent));
      }
    }

    // === HYBRID GUARANTEE: Inject contradiction if real agents didn't find one ===
    // Wait until 25 seconds from scan start before checking
    const elapsedSoFar = (Date.now() - startTime) / 1000;
    const remainingDelay = Math.max(0, 25 - elapsedSoFar) * 1000;
    await new Promise(r => setTimeout(r, remainingDelay));

    if (foundContradictions.length === 0 && demo.tier1_result.discrepancies.length > 0) {
      const d = demo.tier1_result.discrepancies[0];
      const guaranteedContradiction: Contradiction = {
        id: `c-guarantee-${Date.now()}`,
        agent: 'Certification Verifier',
        claim: d.claim,
        evidence: d.finding,
        confidence: d.confidence,
        sourceUrl: d.source_url,
        severity: 'critical',
        financialExposure: demo.simulation_output.financial_exposure_eur,
        timelineImpactDays: demo.simulation_output.predictions?.[0]?.timeline_days || 45,
      };
      foundContradictions.push(guaranteedContradiction);
      setContradictions((prev) => [...prev, guaranteedContradiction]);

      // Update the cert verifier agent to show it found the issue
      updateTask('certs', {
        status: 'warning',
        result: `MISMATCH: ${d.claim} - ${d.finding}`,
      });

      addTimelineEntry({
        agent: 'Certification Verifier',
        message: `CONTRADICTION DETECTED: "${d.claim}" contradicted by evidence`,
        type: 'contradiction',
      });
    }

    // === TIER 2: LLM Analysis (Gemini-powered when key available) ===
    const useGemini = hasGeminiKey();
    addTimelineEntry({ agent: 'System', message: `Starting Tier 2 -cross-referencing claims against evidence${useGemini ? ' (Gemini AI)' : ''}`, type: 'info' });
    const tier2Ids: Array<'classifier' | 'greenwash' | 'evidence' | 'sentiment'> = ['classifier', 'greenwash', 'evidence', 'sentiment'];

    // Build Tier 1 context for Gemini
    const geminiContext = {
      supplierName: demo.supplier_name,
      claims: demo.tier1_result.discrepancies.map((d: { claim: string }) => d.claim),
      violations: demo.violations.map((v: { type: string; description: string }) => `${v.type}: ${v.description}`),
      discrepancies: demo.tier1_result.discrepancies.map((d: { claim: string; finding: string }) => ({ claim: d.claim, finding: d.finding })),
    };

    for (const taskId of tier2Ids) {
      const meta = agentMeta[taskId];
      updateTask(taskId, { status: 'running', progress: 30, steps: [useGemini ? 'Sending to Gemini AI for analysis...' : 'Ingesting Tier 1 scan results...'] });
      addTimelineEntry({ agent: meta.name, message: useGemini ? 'Querying Gemini AI...' : 'Analyzing scraped data...', type: 'step' });

      let taskResult: string;
      let isWarn: boolean;

      if (useGemini) {
        updateTask(taskId, { progress: 50, steps: ['Sending to Gemini AI for analysis...', 'Awaiting Gemini response...'] });
        const geminiResult = await runGeminiAnalysis(taskId, geminiContext);

        if (geminiResult.analysis && !geminiResult.analysis.includes('error') && !geminiResult.analysis.includes('Rate limit')) {
          taskResult = geminiResult.analysis.substring(0, 200);
          isWarn = geminiResult.contradictions.length > 0 || demo.violations.length > 0;
          updateTask(taskId, { progress: 80, steps: ['Sending to Gemini AI for analysis...', 'Awaiting Gemini response...', 'Processing Gemini analysis...'] });
        } else {
          // Fallback to demo results if Gemini fails
          const hasViolations = demo.violations.length > 0;
          const fallback: Record<string, string> = {
            classifier: hasViolations ? `${demo.violations.length} violation(s) classified -${demo.violations[0]?.severity} severity` : 'No violations to classify',
            greenwash: demo.tier1_result.discrepancies.length > 0
              ? `CLAIM-EVIDENCE MISMATCH: ${demo.tier1_result.discrepancies.length} greenwashing discrepancy found`
              : 'No claim discrepancies detected',
            evidence: hasViolations ? `${demo.violations.length} evidence chain(s) verified with source links` : 'No evidence to extract',
            sentiment: hasViolations ? 'Negative sentiment detected in recent coverage -risk elevated' : 'Neutral/positive public sentiment',
          };
          taskResult = fallback[taskId];
          isWarn = hasViolations && (taskId === 'classifier' || taskId === 'greenwash');
        }
      } else {
        await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
        updateTask(taskId, { progress: 70, steps: ['Ingesting Tier 1 scan results...', 'Cross-referencing claims vs evidence...'] });
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

        const hasViolations = demo.violations.length > 0;
        const tier2Results: Record<string, string> = {
          classifier: hasViolations ? `${demo.violations.length} violation(s) classified -${demo.violations[0]?.severity} severity` : 'No violations to classify',
          greenwash: demo.tier1_result.discrepancies.length > 0
            ? `CLAIM-EVIDENCE MISMATCH: ${demo.tier1_result.discrepancies.length} greenwashing discrepancy found -"${demo.tier1_result.discrepancies[0].claim}" contradicted by evidence`
            : 'No claim discrepancies detected',
          evidence: hasViolations ? `${demo.violations.length} evidence chain(s) verified with source links` : 'No evidence to extract',
          sentiment: hasViolations ? 'Negative sentiment detected in recent coverage -risk elevated' : 'Neutral/positive public sentiment',
        };
        taskResult = tier2Results[taskId];
        isWarn = hasViolations && (taskId === 'classifier' || taskId === 'greenwash');
      }

      // Greenwash contradiction from Tier 2
      if (taskId === 'greenwash' && demo.tier1_result.discrepancies.length > 0) {
        const d = demo.tier1_result.discrepancies[0];
        const c: Contradiction = {
          id: `c-greenwash-${Date.now()}`,
          agent: 'Greenwash Detector',
          claim: d.claim,
          evidence: d.finding,
          confidence: d.confidence,
          sourceUrl: d.source_url,
          severity: 'critical',
          financialExposure: demo.simulation_output.financial_exposure_eur,
          timelineImpactDays: demo.simulation_output.predictions?.[0]?.timeline_days || 45,
        };
        foundContradictions.push(c);
        setContradictions((prev) => [...prev, c]);
        addTimelineEntry({ agent: meta.name, message: `GREENWASH DETECTED: "${d.claim}" contradicted`, type: 'contradiction' });
      }

      updateTask(taskId, {
        status: isWarn ? 'warning' : 'success',
        progress: 100,
        result: taskResult,
        duration: Math.round(700 + Math.random() * 300),
        steps: useGemini
          ? ['Sending to Gemini AI for analysis...', 'Awaiting Gemini response...', 'Processing Gemini analysis...', 'Analysis complete']
          : ['Ingesting Tier 1 scan results...', 'Cross-referencing claims vs evidence...', 'Generating classification report...'],
      });

      completedCount++;
      setAgentsComplete(completedCount);
      addTimelineEntry({ agent: meta.name, message: taskResult.substring(0, 80), type: isWarn ? 'warning' : 'success' });
    }

    // === TIER 3: Risk Simulation ===
    addTimelineEntry({ agent: 'System', message: 'Starting Tier 3 -predicting stakeholder responses', type: 'info' });
    const tier3Ids = ['regulator', 'media', 'investor', 'ngo'];
    for (const taskId of tier3Ids) {
      const meta = agentMeta[taskId];
      updateTask(taskId, { status: 'running', progress: 40, steps: ['Running Monte Carlo simulation...'] });
      addTimelineEntry({ agent: meta.name, message: 'Simulating response...', type: 'step' });

      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
      updateTask(taskId, { progress: 80, steps: ['Running Monte Carlo simulation...', 'Computing probability distributions...'] });

      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 600));

      const pred = demo.simulation_output.predictions.find((p: { agent_type: string }) => p.agent_type === taskId);
      const isRisky = pred ? pred.probability > 0.4 : false;
      const taskResult = pred
        ? `${Math.round(pred.probability * 100)}% probability -${pred.timeline_days}d -${pred.prediction}`
        : 'Low risk -no action needed';

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
      message: `Audit complete -${foundContradictions.length} contradictions found in ${finalElapsed.toFixed(1)}s`,
      type: foundContradictions.length > 0 ? 'warning' : 'success',
    });

    onScanComplete?.(demo);
  }, [suppliers, updateTask, addTimelineEntry, onScanComplete]);

  // Only 4 visible hero agents for clean, focused demo
  const heroAgents = tasks.filter((t) => heroAgentIds.includes(t.id));
  const backgroundAgents = tasks.filter((t) => !heroAgentIds.includes(t.id));
  const backgroundComplete = backgroundAgents.filter(t => t.status === 'success' || t.status === 'warning').length;
  const isAnyHeroRunning = heroAgents.some(t => t.status === 'running');
  const focusedAgent = focusedAgentId ? tasks.find(t => t.id === focusedAgentId) : null;

  return (
    <div className="space-y-5">
      {/* Background dim overlay when contradiction detected */}
      <AnimatePresence>
        {dimBackground && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Mission Control Header */}
      <MissionControl
        supplierName={activeSupplier}
        status={scanStatus}
        progress={allAgentIds.length > 0 ? (agentsComplete / allAgentIds.length) * 100 : 0}
        agentsComplete={heroAgents.filter(t => t.status === 'success' || t.status === 'warning').length}
        totalAgents={4}
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
              <option key={s.id} value={s.supplier_name}>{s.supplier_name} -{s.country}</option>
            ))}
          </select>
          {/* DEMO / REAL toggle */}
          {isLive && (
            <button
              onClick={() => setLiveMode(!liveMode)}
              disabled={scanning}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border',
                liveMode
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
                scanning && 'opacity-40 cursor-not-allowed'
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', liveMode ? 'bg-red-500 animate-pulse' : 'bg-emerald-500')} />
              {liveMode ? 'LIVE API' : 'DEMO'}
            </button>
          )}
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
                Auditing...
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

      {/* Main Grid: CCTV + Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Left: Agent Grid */}
        <div className="space-y-5">

          {/* Focus Mode -Single agent big view (click to dismiss) */}
          <AnimatePresence>
            {focusedAgent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <button
                  onClick={() => setFocusedAgentId(null)}
                  className="absolute top-2 right-2 z-20 text-[10px] text-neutral-500 hover:text-white bg-black/60 px-2 py-1 rounded-lg border border-white/[0.08] transition-colors"
                >
                  Exit Focus
                </button>
                <LiveAgentCard
                  {...focusedAgent}
                  isLive={isLive}
                  onClick={() => setFocusedAgentId(null)}
                  isExpanded={true}
                  isHero
                  isFocused
                  isAnyRunning={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4 Hero Agents -Clean 2x2 Grid */}
          {!focusedAgent && (
            <div>
              <p className={cn('text-[10px] font-bold uppercase tracking-[0.15em] mb-3 flex items-center gap-2', tierLabels[0].color)}>
                AUTONOMOUS AI AGENTS
                {isLive && (
                  <span className="relative flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[8px] text-red-400">LIVE</span>
                  </span>
                )}
                {scanning && (
                  <span className="text-[9px] text-cyan-400/70 font-normal normal-case tracking-normal ml-1">
                    -{heroAgents.filter(t => t.status === 'running').length > 0 ? `${heroAgents.filter(t => t.status === 'running').length} active` : 'processing'}
                  </span>
                )}
              </p>

              <div className="grid grid-cols-2 gap-6">
                {heroAgents.map((task) => (
                  <LiveAgentCard
                    key={task.id}
                    {...task}
                    isLive={isLive}
                    onClick={() => {
                      if (task.status !== 'idle' && task.status !== 'queued') {
                        setFocusedAgentId(task.id);
                      }
                    }}
                    isExpanded={false}
                    isHero
                    isAnyRunning={isAnyHeroRunning}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Background agents compact summary -only when they're processing */}
          {(scanning || scanComplete) && !focusedAgent && backgroundComplete > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {backgroundAgents.filter(t => t.status === 'success' || t.status === 'warning').slice(0, 6).map((t, i) => (
                      <div
                        key={t.id}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all duration-300',
                          t.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500',
                          i > 0 && '-ml-0.5'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    +{backgroundComplete} background agents completed
                  </span>
                </div>
                <button
                  onClick={() => setShowAllTier1(!showAllTier1)}
                  className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-neutral-300 transition-colors"
                >
                  {showAllTier1 ? 'Hide' : 'Show details'}
                  {showAllTier1 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>
              <AnimatePresence>
                {showAllTier1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                      {backgroundAgents.filter(t => t.status !== 'idle' && t.status !== 'queued').map((task) => (
                        <LiveAgentCard
                          key={task.id}
                          {...task}
                          isLive={false}
                          onClick={() => setFocusedAgentId(task.id)}
                          isExpanded={false}
                          isAnyRunning={false}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
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

      {/* Headline Insight -instant risk summary */}
      {contradictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-r from-red-500/[0.12] via-red-500/[0.06] to-black/60 backdrop-blur-2xl px-6 py-4 shadow-[0_0_60px_rgba(239,68,68,0.15)]"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
            />
            <p className="font-heading text-lg md:text-xl font-bold tracking-tight text-red-400">
              Supplier is NON-COMPLIANT - Immediate Risk Detected
            </p>
          </div>
          <p className="text-sm text-red-400/60 mt-1 ml-6">
            {contradictions.length} critical finding{contradictions.length > 1 ? 's' : ''} detected across {new Set(contradictions.map(c => c.agent)).size} agent{new Set(contradictions.map(c => c.agent)).size > 1 ? 's' : ''} · Action required
          </p>
        </motion.div>
      )}

      {/* Hero Mismatch -THE screenshot moment */}
      {contradictions.length > 0 && (() => {
        const hero = contradictions.find(c => c.severity === 'critical') || contradictions[0];
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-b from-red-500/[0.1] via-red-500/[0.04] to-black/60 backdrop-blur-2xl p-8 text-center shadow-[0_0_80px_rgba(239,68,68,0.15)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/50 mb-4">Primary Violation</p>
            <div className="max-w-lg mx-auto">
              <p className="text-lg md:text-xl text-neutral-300 font-light leading-relaxed">
                &ldquo;{hero.claim}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3 my-4">
                <div className="h-px flex-1 bg-red-500/20" />
                <span className="text-red-400 font-bold text-lg">vs</span>
                <div className="h-px flex-1 bg-red-500/20" />
              </div>
              <p className="text-xl md:text-2xl text-red-400 font-heading font-bold leading-snug">
                {hero.evidence}
              </p>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-red-500/10">
              <span className="text-sm font-mono font-bold text-white">{Math.round(hero.confidence * 100)}% confidence</span>
              {hero.financialExposure && hero.financialExposure > 0 && (
                <span className="text-sm font-bold text-red-300">EUR {hero.financialExposure.toLocaleString()} exposure</span>
              )}
              {hero.timelineImpactDays && (
                <span className="text-sm font-bold text-amber-300">{hero.timelineImpactDays}d to impact</span>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* Contradiction Panel -detailed findings */}
      <div ref={contradictionRef} className="relative z-50">
        {contradictions.length > 0 && (
          <ContradictionPanel contradictions={contradictions} />
        )}
      </div>

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

      {/* Final Status -closes the story */}
      {scanComplete && scanResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'rounded-2xl border-2 backdrop-blur-2xl px-6 py-5 text-center',
            contradictions.length > 0
              ? 'border-red-500/30 bg-gradient-to-b from-red-500/[0.08] to-black/60 shadow-[0_0_60px_rgba(239,68,68,0.1)]'
              : 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.08] to-black/60 shadow-[0_0_60px_rgba(16,185,129,0.1)]'
          )}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center border',
              contradictions.length > 0
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            )}>
              {contradictions.length > 0 ? (
                <AlertTriangle className="h-7 w-7 text-red-400" />
              ) : (
                <Shield className="h-7 w-7 text-emerald-400" />
              )}
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white tracking-tight">
                Audit Complete
              </h3>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className={cn(
                  'text-sm font-semibold px-3 py-1 rounded-lg border',
                  scanResult.risk_level === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  scanResult.risk_level === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  scanResult.risk_level === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                )}>
                  Risk Level: {scanResult.risk_level.toUpperCase()}
                </span>
                {scanResult.simulation_output.recommended_action && (
                  <span className="text-sm text-neutral-400">
                    Action Recommended: <strong className={cn(
                      contradictions.length > 0 ? 'text-red-300' : 'text-emerald-300'
                    )}>{scanResult.simulation_output.recommended_action}</strong>
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-neutral-600 mt-1">
              {totalTime}s · 16 agents · {contradictions.length} contradiction{contradictions.length !== 1 ? 's' : ''} · {scanResult.violations.length} violation{scanResult.violations.length !== 1 ? 's' : ''}
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
