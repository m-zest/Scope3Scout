// TinyFish Web Agent API integration
// Real API: https://agent.tinyfish.ai/v1/automation/run-sse (SSE streaming)

import { getDemoScanResult, getDemoSuppliers, type DemoScanResult } from '@/data/demoSuppliers';
import { getTinyFishKey } from '@/lib/keys';

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

export function hasTinyFishKey(): boolean {
  return getTinyFishKey().length > 0;
}

export interface TinyFishAgentTask {
  id: string;
  url: string;
  goal: string;
}

export interface TinyFishSSEEvent {
  type: 'step' | 'result' | 'error' | 'done';
  data: string;
  timestamp?: number;
  screenshot?: string;
  url?: string;
}

export interface AgentEvent {
  agent: string;
  step: string;
  status: 'running' | 'completed' | 'error';
  message: string;
  screenshot?: string;
  url?: string;
  timestamp: number;
}

export interface SupplierInput {
  name: string;
  website?: string;
  country?: string;
  industry?: string;
}

// Build the 8 Tier 1 agent tasks for a supplier
export function buildAgentTasks(supplier: SupplierInput): TinyFishAgentTask[] {
  const name = supplier.name;
  const country = supplier.country || 'EU';
  const tasks: TinyFishAgentTask[] = [];

  if (supplier.website) {
    tasks.push({
      id: 'website',
      url: supplier.website,
      goal: `You are an autonomous compliance audit agent. Act step-by-step like a human browsing. Extract all ESG claims, sustainability commitments, certifications (ISO 14001, etc), and environmental policies from this company website for "${name}". List each claim with a direct quote. Always describe your action before executing it. When evidence is found include: claim, evidence, source URL, confidence. If mismatch is found output: "CLAIM–EVIDENCE MISMATCH". Always capture a screenshot when a result or contradiction is found.`,
    });
  } else {
    tasks.push({
      id: 'website',
      url: `https://www.google.com/search?q=${encodeURIComponent(name + ' company website ESG sustainability')}`,
      goal: `You are an autonomous compliance audit agent. Find the official website of "${name}" and extract any ESG claims, certifications, or sustainability commitments they make. Click buttons, fill search fields, and navigate pages. Do not stop at the first page — explore until evidence is found. Always capture a screenshot when a result or contradiction is found.`,
    });
  }

  tasks.push({
    id: 'regulatory',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' environmental fine penalty violation ' + country)}`,
    goal: `You are an autonomous compliance audit agent. Search for any environmental fines, penalties, regulatory violations, or sanctions related to "${name}" in ${country}. Find government enforcement actions, court records, or EPA-equivalent penalties. Return specific amounts and dates. When evidence is found include: claim, evidence, source URL, confidence. If mismatch is found output: "CLAIM–EVIDENCE MISMATCH". Always capture a screenshot when a result is found.`,
  });

  tasks.push({
    id: 'news',
    url: `https://news.google.com/search?q=${encodeURIComponent('"' + name + '" environment OR violation OR labour OR scandal OR fine')}`,
    goal: `You are an autonomous compliance audit agent. Find recent news articles (last 12 months) about "${name}" related to environmental issues, labour disputes, legal problems, ESG controversies, or regulatory actions. Summarize each article with source and date. Always capture a screenshot when a result is found.`,
  });

  tasks.push({
    id: 'certs',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' ISO 14001 certification verification')}`,
    goal: `You are an autonomous compliance audit agent. Verify if "${name}" holds valid ISO 14001, ISO 45001, or other environmental/safety certifications. Check if certifications are current, expired, or suspended. Return certificate numbers and validity dates if found. If mismatch is found output: "CLAIM–EVIDENCE MISMATCH". Always capture a screenshot when a result is found.`,
  });

  tasks.push({
    id: 'linkedin',
    url: `https://www.google.com/search?q=${encodeURIComponent('site:linkedin.com/company ' + name)}`,
    goal: `You are an autonomous compliance audit agent. Find "${name}" on LinkedIn. Check for recent layoffs, restructuring, ESG/compliance officer departures, or significant hiring changes. Look for any red flags in recent activity. Always capture a screenshot when a result is found.`,
  });

  tasks.push({
    id: 'supply',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' supply chain suppliers sub-contractors')}`,
    goal: `You are an autonomous compliance audit agent. Map the known supply chain of "${name}". Find any sub-suppliers, contractors, or business partners. Look for supply chain risks, dependency on high-risk regions, or known issues with their suppliers. Always capture a screenshot when a result is found.`,
  });

  tasks.push({
    id: 'financial',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' financial report annual revenue debt risk')}`,
    goal: `You are an autonomous compliance audit agent. Find financial information about "${name}". Look for annual reports, revenue figures, debt levels, credit ratings, or any financial instability signals. Check for bankruptcy risk or payment defaults. Always capture a screenshot when a result is found.`,
  });

  tasks.push({
    id: 'compliance',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' CSRD sustainability report ESG disclosure ' + country)}`,
    goal: `You are an autonomous compliance audit agent. Check if "${name}" has published a CSRD-compliant sustainability report. Verify their ESG disclosures against EU CSRD requirements. Flag any gaps in reporting or potential greenwashing. If mismatch is found output: "CLAIM–EVIDENCE MISMATCH". Always capture a screenshot when a result is found.`,
  });

  return tasks;
}

// Parse TinyFish SSE events into human-readable text + extract metadata
function parseTinyFishEvent(event: Record<string, unknown>): { text: string; screenshot?: string; url?: string } {
  const type = (event.type as string) || '';
  const screenshot = (event.screenshot as string) || (event.image as string) || undefined;
  const url = (event.url as string) || (event.target_url as string) || (event.current_url as string) || undefined;

  let text = '';

  switch (type) {
    case 'STREAMING_URL':
      text = `Agent started — streaming live`;
      break;
    case 'PROGRESS':
    case 'STEP': {
      const step = (event.step as string) || (event.message as string) || '';
      const action = (event.action as string) || '';
      if (step) text = step;
      else if (action) text = `Action: ${action}`;
      else text = 'Processing...';
      break;
    }
    case 'ACTION': {
      const actionType = (event.action_type as string) || (event.action as string) || '';
      if (actionType === 'navigate' || actionType === 'goto') text = `Navigating to ${url ? shortenUrl(url) : 'page'}`;
      else if (actionType === 'click') text = `Clicking element on page`;
      else if (actionType === 'extract' || actionType === 'scrape') text = `Extracting content from page`;
      else if (actionType === 'scroll') text = `Scrolling page`;
      else if (actionType === 'type' || actionType === 'input') text = `Entering search query`;
      else if (actionType === 'screenshot') text = `Capturing screenshot`;
      else if (actionType) text = `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`;
      else text = 'Performing action...';
      break;
    }
    case 'NAVIGATION':
      text = `Navigating to ${shortenUrl(url || '')}`;
      break;
    case 'SCREENSHOT':
      text = 'Captured screenshot';
      break;
    case 'EXTRACTION':
    case 'CONTENT':
      text = 'Extracting page content...';
      break;
    case 'RESULT':
    case 'COMPLETED':
    case 'FINAL_RESULT': {
      const result = (event.result as string) || (event.extracted_content as string) || (event.output as string) || '';
      text = result ? (result.length > 200 ? result.substring(0, 200) + '...' : result) : 'Analysis complete';
      break;
    }
    case 'ERROR':
    case 'FAILED':
      text = (event.error as string) || (event.message as string) || 'Error occurred';
      break;
    default: {
      const msg = (event.message as string) || (event.step as string) || (event.action as string) || '';
      if (msg) text = msg;
      else if (type) text = `${type.toLowerCase().replace(/_/g, ' ')}`;
      else text = 'Processing...';
    }
  }

  return { text, screenshot, url };
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname.length > 30 ? u.pathname.substring(0, 30) + '...' : u.pathname);
  } catch {
    return url.length > 40 ? url.substring(0, 40) + '...' : url;
  }
}

// Run a single TinyFish agent via SSE — returns parsed events in real-time via callback
export async function runTinyFishAgent(
  task: TinyFishAgentTask,
  onEvent?: (event: TinyFishSSEEvent) => void,
): Promise<{ result: string; steps: string[]; screenshots: string[]; error?: string }> {
  // Demo mode fallback with semantic per-agent steps
  if (DEMO_MODE || !hasTinyFishKey()) {
    const delay = 2000 + Math.random() * 2000;
    const demoSteps = getDemoStepsForTask(task.id, task.url);
    const screenshots: string[] = [];
    for (let i = 0; i < demoSteps.length; i++) {
      await new Promise((r) => setTimeout(r, delay / demoSteps.length));
      onEvent?.({ type: 'step', data: demoSteps[i], url: task.url, timestamp: Date.now() });
    }
    const demoResult = getDemoResultForTask(task.id);
    onEvent?.({ type: 'done', data: demoResult, timestamp: Date.now() });
    return { result: demoResult, steps: demoSteps, screenshots };
  }

  // Real TinyFish SSE call
  const steps: string[] = [];
  const screenshots: string[] = [];
  let finalResult = '';

  try {
    const response = await fetch('https://agent.tinyfish.ai/v1/automation/run-sse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getTinyFishKey(),
      },
      body: JSON.stringify({
        url: task.url,
        goal: task.goal,
        proxy_config: { enabled: false },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      onEvent?.({ type: 'error', data: `API ${response.status}: ${errText}`, timestamp: Date.now() });
      return { result: '', steps, screenshots, error: `API ${response.status}` };
    }

    // Parse SSE stream
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data:')) {
          const data = trimmed.slice(5).trim();
          try {
            const parsed = JSON.parse(data);
            const { text: stepText, screenshot, url } = parseTinyFishEvent(parsed);

            // Collect screenshots
            if (screenshot) {
              const imgSrc = screenshot.startsWith('data:') ? screenshot : `data:image/jpeg;base64,${screenshot}`;
              screenshots.push(imgSrc);
            }

            if (parsed.type === 'RESULT' || parsed.type === 'COMPLETED' || parsed.type === 'FINAL_RESULT') {
              const rawResult = parsed.result || parsed.output || parsed.extracted_content || stepText;
              finalResult = typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult);
              onEvent?.({ type: 'result', data: finalResult, screenshot: screenshot ? (screenshot.startsWith('data:') ? screenshot : `data:image/jpeg;base64,${screenshot}`) : undefined, url, timestamp: Date.now() });
            } else if (parsed.type === 'ERROR' || parsed.type === 'FAILED') {
              const errMsg = parsed.error || parsed.message || stepText;
              onEvent?.({ type: 'error', data: errMsg, timestamp: Date.now() });
              return { result: '', steps, screenshots, error: errMsg };
            } else {
              if (stepText) {
                steps.push(stepText);
                onEvent?.({ type: 'step', data: stepText, screenshot: screenshot ? (screenshot.startsWith('data:') ? screenshot : `data:image/jpeg;base64,${screenshot}`) : undefined, url, timestamp: Date.now() });
              }
              if (parsed.extracted_content || parsed.result || parsed.output) {
                const raw = parsed.extracted_content || parsed.result || parsed.output;
                finalResult = typeof raw === 'string' ? raw : JSON.stringify(raw);
              }
            }
          } catch {
            if (data && data.length > 0) {
              steps.push(data);
              onEvent?.({ type: 'step', data, timestamp: Date.now() });
              finalResult = data;
            }
          }
        }
      }
    }

    onEvent?.({ type: 'done', data: finalResult, timestamp: Date.now() });
    return { result: finalResult, steps, screenshots };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    onEvent?.({ type: 'error', data: msg, timestamp: Date.now() });
    return { result: '', steps, screenshots, error: msg };
  }
}

// Semantic per-agent demo steps — each agent has specific, realistic actions
function getDemoStepsForTask(taskId: string, url: string): string[] {
  const host = shortenUrl(url);
  const stepsMap: Record<string, string[]> = {
    website: [
      `Navigating to ${host}`,
      'Found "About Us" page — clicking...',
      'Extracting ESG claims from sustainability section...',
      'Found claim: "ISO 14001 Certified since 2022"',
      'Found claim: "Carbon neutral by 2030"',
      'Found claim: "Zero waste policy across all facilities"',
      'Comparing claims against known certifications...',
      'Capturing page evidence...',
    ],
    regulatory: [
      `Searching government enforcement databases...`,
      `Navigating to ${host}`,
      'Entering company name in search field...',
      'Filtering results by environmental violations...',
      'Found record: Environmental fine issued March 2026',
      'Extracting fine details — EUR 40,000 for water discharge',
      'Cross-referencing with EPA equivalent records...',
      'Evidence captured from official registry',
    ],
    news: [
      `Navigating to news.google.com...`,
      'Entering search query with violation keywords...',
      'Scanning headlines from last 12 months...',
      'Found article: "SteelCorp fined for water pollution" — Reuters',
      'Found article: "Coal contract contradicts green claims" — DW News',
      'Extracting publication dates and sentiment...',
      'Analyzing article sentiment — negative coverage detected',
    ],
    certs: [
      `Navigating to ISO certification registry...`,
      'Entering company name in verification search...',
      'Found ISO 14001:2015 certificate #DE-2022-14001-0847',
      'Checking certificate validity period...',
      'ALERT: Certificate expired December 2025',
      'Company website still claims "ISO 14001 Certified"',
      'CLAIM-EVIDENCE MISMATCH DETECTED',
    ],
    linkedin: [
      `Navigating to linkedin.com/company search...`,
      'Locating company profile...',
      'Scanning recent employee changes...',
      'Checking C-suite and ESG department...',
      'Found: Chief Sustainability Officer departed Feb 2026',
      'ESG team reduced from 8 to 3 members',
    ],
    supply: [
      `Searching supply chain databases...`,
      'Mapping known sub-suppliers and contractors...',
      'Found 4 sub-suppliers across 3 countries',
      'Checking for high-risk regions...',
      'WARNING: 2 suppliers in high-risk regions detected',
      'Cross-referencing sub-supplier compliance status...',
    ],
    financial: [
      `Searching financial databases...`,
      'Extracting annual revenue and debt figures...',
      'Found revenue: EUR 240M (2025)',
      'Checking credit rating agencies...',
      'Credit rating downgraded to BB- by S&P',
      'Working capital negative for 2 consecutive quarters',
    ],
    compliance: [
      `Searching for CSRD sustainability report...`,
      'Found Q4 2025 sustainability report (PDF)...',
      'Extracting disclosure data points...',
      'Checking ESRS E1 Climate requirements...',
      'ALERT: Scope 3 emissions disclosure missing entirely',
      'Double materiality assessment incomplete',
      'CSRD compliance gaps identified in 3 areas',
    ],
  };
  return stepsMap[taskId] || [
    `Navigating to ${host}`,
    'Extracting page content...',
    'Analyzing extracted data...',
    'Processing results...',
  ];
}

// Demo fallback results per agent type
function getDemoResultForTask(taskId: string): string {
  const results: Record<string, string> = {
    website: 'Found 3 ESG claims: ISO 14001 certified, carbon neutral by 2030, zero waste policy. CLAIM–EVIDENCE MISMATCH: ISO certificate expired Dec 2025.',
    regulatory: 'FOUND: Environmental fine €40,000 issued March 2026 for illegal water discharge into Rhine river. Source: German Federal Environment Agency (UBA).',
    news: 'Found 2 relevant articles: (1) "SteelCorp fined for water pollution" - Reuters, Mar 2026. (2) "Coal contract contradicts green claims" - DW News, Jan 2026.',
    certs: 'CLAIM–EVIDENCE MISMATCH: ISO 14001:2015 certificate EXPIRED Dec 2025. Company still claims "ISO 14001 certified" on website. Certificate #DE-2022-14001-0847.',
    linkedin: 'Red flag: Chief Sustainability Officer departed Feb 2026. No replacement hired. ESG team reduced from 8 to 3 members.',
    supply: 'Mapped 4 sub-suppliers across 3 countries. WARNING: 2 suppliers in high-risk regions (Bangladesh, Myanmar). Sub-supplier TierB-Chem flagged for chemical violations.',
    financial: 'Revenue: €240M (2025). Debt-to-equity: 1.8 (elevated). Credit rating downgraded to BB- by S&P. Working capital negative for 2 quarters.',
    compliance: 'CLAIM–EVIDENCE MISMATCH: CSRD report published Q4 2025 but Scope 3 emissions disclosure missing entirely. Double materiality assessment incomplete. ESRS E1 non-compliant.',
  };
  return results[taskId] || 'Analysis complete — no issues detected';
}

// Legacy exports for compatibility
export function scanSupplier(supplier: SupplierInput): Promise<DemoScanResult> {
  return new Promise(async (resolve) => {
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500));
    resolve(getDemoScanResult(supplier.name));
  });
}

export function getDemoSuppliersCompat() {
  return getDemoSuppliers();
}
