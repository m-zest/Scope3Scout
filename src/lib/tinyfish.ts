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
