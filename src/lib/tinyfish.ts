// TinyFish Web Agent API integration
// Real API: https://agent.tinyfish.ai/v1/automation/run-sse (SSE streaming)

import { getDemoScanResult, getDemoSuppliers, type DemoScanResult } from '@/data/demoSuppliers';
import type { RealSupplier } from '@/data/realSuppliers';
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

  // Claim Extractor - simple clear goal for TinyFish
  tasks.push({
    id: 'website',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' sustainability ESG certifications ' + country)}`,
    goal: `Search for "${name}" ESG and sustainability information. Click the first relevant result. Extract any environmental claims, ISO certifications, carbon targets, or sustainability commitments. Take a screenshot. Return a summary of all claims found.`,
  });

  tasks.push({
    id: 'regulatory',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' fine penalty violation ' + country)}`,
    goal: `Search for "${name}" environmental fines or regulatory violations. Click the first relevant result. Find fine amounts, dates, and reasons. Take a screenshot. If found, start summary with "FOUND:".`,
  });

  tasks.push({
    id: 'news',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' ESG controversy scandal violation news')}&tbm=nws`,
    goal: `Search for recent news about "${name}" related to ESG issues, violations, or controversies. Click the first article. Extract headline, date, and key issue. Take a screenshot. Summarize findings.`,
  });

  tasks.push({
    id: 'certs',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' ISO 14001 certification status')}`,
    goal: `Search for "${name}" ISO 14001 certification status. Click the first result. Check if certificate is valid or expired. Take a screenshot. If expired but company claims certified, write "CLAIM-EVIDENCE MISMATCH".`,
  });

  tasks.push({
    id: 'linkedin',
    url: `https://www.google.com/search?q=${encodeURIComponent('site:linkedin.com "' + name + '"')}`,
    goal: `Find "${name}" LinkedIn company page. Click the result. Check employee count and recent leadership changes. Take a screenshot. Summarize key findings.`,
  });

  tasks.push({
    id: 'supply',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' supply chain suppliers partners')}`,
    goal: `Search for "${name}" supply chain information. Click the first result. Find sub-suppliers, partners, or high-risk dependencies. Take a screenshot. Summarize findings.`,
  });

  tasks.push({
    id: 'financial',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' annual report revenue financial')}`,
    goal: `Search for "${name}" financial information. Click the first result. Find revenue, debt, and credit rating. Take a screenshot. Summarize financial health.`,
  });

  tasks.push({
    id: 'compliance',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' CSRD sustainability report ESG disclosure')}`,
    goal: `Search for "${name}" CSRD sustainability report. Click the first result. Check for Scope 1/2/3 emissions and ESRS compliance. Take a screenshot. Flag any gaps.`,
  });

  return tasks;
}

// Build the Tier 1 agent tasks for a LIVE AUDIT against a real supplier.
// Unlike buildAgentTasks (demo path), each prompt explicitly asks the agent
// to extract a {claim, evidence, source} pair so downstream Gemini analysis
// has structured input. No hardcoded contradiction hints.
export function buildLiveSupplierScanPrompts(supplier: RealSupplier): TinyFishAgentTask[] {
  const { name, primaryUrl, expectedClaimKeywords, newsSearchQueries, regulatorySearchQueries } = supplier;
  const keywordHint = expectedClaimKeywords.slice(0, 4).join(', ');

  const tasks: TinyFishAgentTask[] = [];

  // 1. Sustainability page claim extraction (hits the supplier's own page)
  tasks.push({
    id: 'website',
    url: primaryUrl,
    goal: `Open ${primaryUrl}. Extract verbatim ESG and sustainability claims this company publishes about itself. Focus on commitments related to: ${keywordHint}. For each claim, capture the exact wording, the specific page section it appears in, and the URL. Take a screenshot. Return a list of claims as plain text, one per line, prefixed with "CLAIM:".`,
  });

  // 2. News evidence search
  const newsQuery = newsSearchQueries[0] || `${name} ESG news`;
  tasks.push({
    id: 'news',
    url: `https://www.google.com/search?q=${encodeURIComponent(newsQuery)}&tbm=nws`,
    goal: `Search for: "${newsQuery}". Open the most relevant recent news article from a credible outlet (Reuters, FT, Guardian, Bloomberg, Handelsblatt, etc.). Extract the headline, publication date, outlet name, and the specific factual claim made about ${name}'s actual performance, delays, or shortfalls. Take a screenshot. Return as plain text starting with "EVIDENCE:" followed by the source URL on the next line as "SOURCE:".`,
  });

  // 3. Regulatory / progress-report evidence
  const regQuery = regulatorySearchQueries[0] || `${name} regulatory filing`;
  tasks.push({
    id: 'regulatory',
    url: `https://www.google.com/search?q=${encodeURIComponent(regQuery)}`,
    goal: `Search for: "${regQuery}". Open the first authoritative result (regulator site, official registry, or the company's own progress report). Extract any documented compliance gap, missed target, fine, or formal admission of underperformance for ${name}. Take a screenshot. Return as plain text starting with "EVIDENCE:" and include the source URL on a line starting with "SOURCE:".`,
  });

  // 4. Certification verification (independent of demo cleanPairs)
  tasks.push({
    id: 'certs',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' ISO 14001 OR B Corp OR Science Based Targets certification status')}`,
    goal: `Search for "${name}" third-party certifications (ISO 14001, B Corp, Science Based Targets, Fair Wear, etc.). Open the first authoritative result. Determine which certifications are currently active vs. expired vs. under review. Take a screenshot. Return findings as plain text starting with "EVIDENCE:" and include the source URL on a line starting with "SOURCE:".`,
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
      text = `Agent started -streaming live`;
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

  // Clean up JSON-like strings to human-readable text
  if (text.startsWith('{') && text.includes('"action"')) {
    try {
      const parsed = JSON.parse(text);
      const action = parsed.action || parsed.step || parsed.message || '';
      const purpose = parsed.purpose || parsed.goal || parsed.description || '';
      text = purpose ? `${action} - ${purpose}` : action || 'Processing...';
      // Capitalize first letter
      text = text.charAt(0).toUpperCase() + text.slice(1);
    } catch { /* keep original text */ }
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

// Run a single TinyFish agent via SSE -returns parsed events in real-time via callback
export async function runTinyFishAgent(
  task: TinyFishAgentTask,
  onEvent?: (event: TinyFishSSEEvent) => void,
): Promise<{ result: string; steps: string[]; screenshots: string[]; error?: string }> {
  // Use real API if TinyFish key exists, regardless of DEMO_MODE
  // Only fall back to demo if no key is configured
  if (!hasTinyFishKey()) {
    const delay = 8000 + Math.random() * 4000; // 8-12 seconds total per agent
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
              // Filter out noise events (heartbeat, started, complete, empty)
              const skipPatterns = ['heartbeat', 'started', 'complete', 'processing...', 'ping'];
              const isNoise = !stepText || skipPatterns.some(p => stepText.toLowerCase().trim() === p);

              if (stepText && !isNoise) {
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

// Semantic per-agent demo steps -each agent has specific, realistic actions
export function getDemoStepsForTask(taskId: string, url: string): string[] {
  const host = shortenUrl(url);
  const stepsMap: Record<string, string[]> = {
    website: [
      `Navigating to ${host}`,
      'Clicking on company sustainability page...',
      'Scrolling through ESG commitments section...',
      'Found claim: "Climate-neutral production by 2045"',
      'Found claim: "ISO 14001 Environmental Management certified"',
      'Found claim: "100% renewable electricity target"',
      'Taking screenshot of sustainability claims...',
      'Extracting certification badges from page...',
    ],
    regulatory: [
      `Opening Google search for regulatory records...`,
      `Clicking first result - government enforcement database...`,
      'Entering company name in registry search field...',
      'Filtering by environmental violations 2024-2026...',
      'Found record: EU ETS emissions violation',
      'Extracting fine details - EUR 45,000 for emissions overshoot',
      'Clicking second result - Reuters regulatory report...',
      'Taking screenshot of enforcement record...',
    ],
    news: [
      `Opening Google News search...`,
      'Clicking first news article about ESG issues...',
      'Reading article: "Steel giant faces green transition delays"',
      'Taking screenshot of article...',
      'Going back to search results...',
      'Clicking second article: "Emissions targets missed"',
      'Extracting publication date and key findings...',
      'Negative sentiment detected across coverage',
    ],
    certs: [
      `Opening Google search for ISO certification status...`,
      'Clicking on certification registry result...',
      'Entering company name in verification search...',
      'Found ISO 14001:2015 certificate record',
      'Checking certificate validity dates...',
      'ALERT: Certificate status shows issues',
      'Taking screenshot of certificate details...',
      'Comparing against website claims...',
    ],
    linkedin: [
      `Opening Google search for LinkedIn company profile...`,
      'Clicking LinkedIn company page result...',
      'Scanning employee count and recent changes...',
      'Checking ESG and sustainability department...',
      'Found: recent restructuring in sustainability team',
      'Taking screenshot of company profile...',
    ],
    supply: [
      `Opening Google search for supply chain information...`,
      'Clicking on supply chain report result...',
      'Mapping known sub-suppliers and contractors...',
      'Found 4 sub-suppliers across 3 countries',
      'Checking for high-risk region dependencies...',
      'Cross-referencing sub-supplier compliance status...',
    ],
    financial: [
      `Opening Google search for financial reports...`,
      'Clicking on annual report result...',
      'Extracting annual revenue and debt figures...',
      'Found revenue and financial metrics...',
      'Checking credit rating agencies...',
      'Taking screenshot of financial summary...',
    ],
    compliance: [
      `Opening Google search for CSRD sustainability report...`,
      'Clicking on sustainability report PDF link...',
      'Extracting ESRS disclosure data points...',
      'Checking ESRS E1 Climate change requirements...',
      'Checking Scope 1, 2, 3 emissions disclosures...',
      'Analyzing double materiality assessment...',
      'Identifying CSRD compliance gaps...',
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
export function getDemoResultForTask(taskId: string): string {
  const results: Record<string, string> = {
    website: 'Found 3 ESG claims: "Climate-neutral steel by 2045", "ISO 14001 certified", "Green hydrogen transition underway". CLAIM-EVIDENCE MISMATCH: hydrogen plant delayed to 2028, contradicts 2026 timeline on website.',
    regulatory: 'FOUND: EU ETS emissions violation - exceeded carbon allowances at Duisburg plant. Fine EUR 45,000 issued. Source: EU Emissions Trading System Registry.',
    news: 'Found 2 relevant articles: (1) "Green steel transition faces delays" - Reuters, 2025. (2) "Emissions targets missed at major steel plant" - Financial Times, 2025.',
    certs: 'CLAIM-EVIDENCE MISMATCH: ISO 14001:2015 certification under review following emissions violations. Company website still displays "ISO 14001 Certified" badge.',
    linkedin: 'Red flag: Head of Sustainability departed Q1 2026. ESG reporting team restructured. 2 senior compliance officers left in past 6 months.',
    supply: 'Mapped 6 sub-suppliers across 4 countries. WARNING: iron ore suppliers in Brazil flagged for deforestation risk. Coal supplier dependency noted.',
    financial: 'Revenue: EUR 34B (FY2025). Significant debt from green steel transition investment. S&P rating: BBB-. Green bond issuance of EUR 1.5B.',
    compliance: 'CLAIM-EVIDENCE MISMATCH: CSRD sustainability report published but Scope 3 emissions significantly underreported. Double materiality assessment gaps in climate transition risk.',
  };
  return results[taskId] || 'Analysis complete -no issues detected';
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
