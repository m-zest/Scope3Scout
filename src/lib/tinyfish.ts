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

  // Claim Extractor - interactive Google search with clicks and navigation
  tasks.push({
    id: 'website',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' sustainability report ESG certifications ' + country)}`,
    goal: `Do these steps in order for "${name}":
1. Look at the Google search results on this page
2. Click on the FIRST search result link that mentions "${name}" or sustainability
3. On that page, scroll down and look for ESG claims, ISO certifications, or sustainability commitments
4. Take a screenshot of any claims you find
5. Go back to Google results
6. Click on the SECOND result
7. Extract any environmental policies, carbon targets, or certification mentions
8. Take a screenshot
9. Summarize ALL claims found as a numbered list
If any claim seems contradicted by other information, write "CLAIM-EVIDENCE MISMATCH" followed by the details.`,
  });

  // Regulatory - search for fines and click through results
  tasks.push({
    id: 'regulatory',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' environmental fine penalty violation ' + country + ' 2024 2025 2026')}`,
    goal: `Do these steps in order for "${name}":
1. Read the Google search results on this page
2. Click on the first result that mentions a fine, penalty, or violation
3. On that page, find the specific fine amount, date, and reason
4. Take a screenshot of the evidence
5. Go back and click on another relevant result
6. Extract any additional regulatory actions or sanctions
7. Summarize findings with: company name, fine amount in EUR, date, reason, source URL
If a fine or violation is found, start your summary with "FOUND:" followed by details.`,
  });

  // News Scanner - browse Google News for controversies
  tasks.push({
    id: 'news',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' controversy OR scandal OR violation OR fine news ' + country)}&tbm=nws`,
    goal: `Do these steps in order for "${name}":
1. Read the news search results on this page
2. Click on the first news article about "${name}"
3. Read the article and extract: headline, date, key issue, source name
4. Take a screenshot of the article
5. Go back and click on a second news article
6. Extract the same details
7. Summarize all articles found with: title, source, date, and relevance to ESG compliance
If negative news is found, include the severity (critical/high/medium).`,
  });

  // Certification Verifier - check ISO registries
  tasks.push({
    id: 'certs',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' ISO 14001 certificate valid OR expired OR suspended')}`,
    goal: `Do these steps in order for "${name}":
1. Search results show ISO certification information
2. Click on the first result about ISO certification for "${name}"
3. Look for: certificate number, issue date, expiry date, certification body
4. Take a screenshot of certificate details
5. Check if the certification is VALID, EXPIRED, or SUSPENDED
6. Go back and check a second source for verification
7. If the company claims ISO 14001 but the certificate is expired, write "CLAIM-EVIDENCE MISMATCH: ISO 14001 certificate expired"
Summarize: certification name, status (valid/expired), dates, certificate number if found.`,
  });

  // LinkedIn - check workforce changes
  tasks.push({
    id: 'linkedin',
    url: `https://www.google.com/search?q=${encodeURIComponent('site:linkedin.com "' + name + '" company')}`,
    goal: `Do these steps for "${name}":
1. Click on the LinkedIn company page result
2. Look for recent posts, employee count changes, and key departures
3. Check if any sustainability or compliance officers recently left
4. Take a screenshot of the company page
5. Summarize: employee count, recent changes, any red flags in leadership or ESG team.`,
  });

  // Supply Chain Mapper
  tasks.push({
    id: 'supply',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' suppliers sub-suppliers supply chain partners ' + country)}`,
    goal: `Do these steps for "${name}":
1. Click on search results about "${name}" supply chain
2. Find any named sub-suppliers, contractors, or partners
3. Check if any suppliers are in high-risk regions
4. Take screenshots of supply chain information
5. Summarize: list of known suppliers, their countries, and any risk flags.`,
  });

  // Financial Analyst
  tasks.push({
    id: 'financial',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' annual report revenue financial statements ' + country)}`,
    goal: `Do these steps for "${name}":
1. Click on financial information results
2. Find: revenue, debt levels, credit rating, profitability
3. Check for any financial distress signals (losses, downgrades, defaults)
4. Take a screenshot of financial data
5. Summarize: revenue, debt-to-equity ratio, credit rating, any risk signals.`,
  });

  // CSRD Compliance Validator
  tasks.push({
    id: 'compliance',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' CSRD sustainability report 2024 2025 ESG disclosure ' + country)}`,
    goal: `Do these steps for "${name}":
1. Click on results about their sustainability or CSRD report
2. Check if a CSRD-compliant report exists and when it was published
3. Look for: Scope 1/2/3 emissions, double materiality assessment, ESRS compliance
4. Take a screenshot of the report or disclosure page
5. Flag any gaps: missing emissions data, no double materiality, incomplete ESRS
6. If claims on website contradict the report, write "CLAIM-EVIDENCE MISMATCH"
Summarize: report exists (yes/no), year, key disclosures found, gaps identified.`,
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

// Semantic per-agent demo steps -each agent has specific, realistic actions
export function getDemoStepsForTask(taskId: string, url: string): string[] {
  const host = shortenUrl(url);
  const stepsMap: Record<string, string[]> = {
    website: [
      `Navigating to ${host}`,
      'Found "About Us" page -clicking...',
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
      'Extracting fine details -EUR 40,000 for water discharge',
      'Cross-referencing with EPA equivalent records...',
      'Evidence captured from official registry',
    ],
    news: [
      `Navigating to news.google.com...`,
      'Entering search query with violation keywords...',
      'Scanning headlines from last 12 months...',
      'Found article: "SteelCorp fined for water pollution" -Reuters',
      'Found article: "Coal contract contradicts green claims" -DW News',
      'Extracting publication dates and sentiment...',
      'Analyzing article sentiment -negative coverage detected',
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
export function getDemoResultForTask(taskId: string): string {
  const results: Record<string, string> = {
    website: 'Found 3 ESG claims: ISO 14001 certified, carbon neutral by 2030, zero waste policy. CLAIM-EVIDENCE MISMATCH: ISO certificate expired Dec 2025.',
    regulatory: 'FOUND: Environmental fine €40,000 issued March 2026 for illegal water discharge into Rhine river. Source: German Federal Environment Agency (UBA).',
    news: 'Found 2 relevant articles: (1) "SteelCorp fined for water pollution" - Reuters, Mar 2026. (2) "Coal contract contradicts green claims" - DW News, Jan 2026.',
    certs: 'CLAIM-EVIDENCE MISMATCH: ISO 14001:2015 certificate EXPIRED Dec 2025. Company still claims "ISO 14001 certified" on website. Certificate #DE-2022-14001-0847.',
    linkedin: 'Red flag: Chief Sustainability Officer departed Feb 2026. No replacement hired. ESG team reduced from 8 to 3 members.',
    supply: 'Mapped 4 sub-suppliers across 3 countries. WARNING: 2 suppliers in high-risk regions (Bangladesh, Myanmar). Sub-supplier TierB-Chem flagged for chemical violations.',
    financial: 'Revenue: €240M (2025). Debt-to-equity: 1.8 (elevated). Credit rating downgraded to BB- by S&P. Working capital negative for 2 quarters.',
    compliance: 'CLAIM-EVIDENCE MISMATCH: CSRD report published Q4 2025 but Scope 3 emissions disclosure missing entirely. Double materiality assessment incomplete. ESRS E1 non-compliant.',
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
