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
      goal: `Extract all ESG claims, sustainability commitments, certifications (ISO 14001, etc), and environmental policies from this company website for "${name}". List each claim with a direct quote.`,
    });
  } else {
    tasks.push({
      id: 'website',
      url: `https://www.google.com/search?q=${encodeURIComponent(name + ' company website ESG sustainability')}`,
      goal: `Find the official website of "${name}" and extract any ESG claims, certifications, or sustainability commitments they make.`,
    });
  }

  tasks.push({
    id: 'regulatory',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' environmental fine penalty violation ' + country)}`,
    goal: `Search for any environmental fines, penalties, regulatory violations, or sanctions related to "${name}" in ${country}. Find government enforcement actions, court records, or EPA-equivalent penalties. Return specific amounts and dates.`,
  });

  tasks.push({
    id: 'news',
    url: `https://news.google.com/search?q=${encodeURIComponent('"' + name + '" environment OR violation OR labour OR scandal OR fine')}`,
    goal: `Find recent news articles (last 12 months) about "${name}" related to environmental issues, labour disputes, legal problems, ESG controversies, or regulatory actions. Summarize each article with source and date.`,
  });

  tasks.push({
    id: 'certs',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' ISO 14001 certification verification')}`,
    goal: `Verify if "${name}" holds valid ISO 14001, ISO 45001, or other environmental/safety certifications. Check if certifications are current, expired, or suspended. Return certificate numbers and validity dates if found.`,
  });

  tasks.push({
    id: 'linkedin',
    url: `https://www.google.com/search?q=${encodeURIComponent('site:linkedin.com/company ' + name)}`,
    goal: `Find "${name}" on LinkedIn. Check for recent layoffs, restructuring, ESG/compliance officer departures, or significant hiring changes. Look for any red flags in recent activity.`,
  });

  tasks.push({
    id: 'supply',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' supply chain suppliers sub-contractors')}`,
    goal: `Map the known supply chain of "${name}". Find any sub-suppliers, contractors, or business partners. Look for supply chain risks, dependency on high-risk regions, or known issues with their suppliers.`,
  });

  tasks.push({
    id: 'financial',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' financial report annual revenue debt risk')}`,
    goal: `Find financial information about "${name}". Look for annual reports, revenue figures, debt levels, credit ratings, or any financial instability signals. Check for bankruptcy risk or payment defaults.`,
  });

  tasks.push({
    id: 'compliance',
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' CSRD sustainability report ESG disclosure ' + country)}`,
    goal: `Check if "${name}" has published a CSRD-compliant sustainability report. Verify their ESG disclosures against EU CSRD requirements. Flag any gaps in reporting or potential greenwashing.`,
  });

  return tasks;
}

// Parse TinyFish SSE events into human-readable text
function parseTinyFishEvent(event: Record<string, unknown>): string {
  const type = (event.type as string) || '';

  switch (type) {
    case 'STREAMING_URL':
      return `Agent started — streaming live`;
    case 'PROGRESS':
    case 'STEP': {
      const step = (event.step as string) || (event.message as string) || '';
      const action = (event.action as string) || '';
      if (step) return step;
      if (action) return `Action: ${action}`;
      return 'Processing...';
    }
    case 'ACTION': {
      const actionType = (event.action_type as string) || (event.action as string) || '';
      const url = (event.url as string) || (event.target_url as string) || '';
      if (actionType === 'navigate' || actionType === 'goto') return `Navigating to ${url ? shortenUrl(url) : 'page'}`;
      if (actionType === 'click') return `Clicking element on page`;
      if (actionType === 'extract' || actionType === 'scrape') return `Extracting content from page`;
      if (actionType === 'scroll') return `Scrolling page`;
      if (actionType === 'type' || actionType === 'input') return `Entering search query`;
      if (actionType) return `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`;
      return 'Performing action...';
    }
    case 'NAVIGATION':
      return `Navigating to ${shortenUrl((event.url as string) || '')}`;
    case 'EXTRACTION':
    case 'CONTENT':
      return 'Extracting page content...';
    case 'RESULT':
    case 'COMPLETED':
    case 'FINAL_RESULT': {
      const result = (event.result as string) || (event.extracted_content as string) || (event.output as string) || '';
      return result ? (result.length > 100 ? result.substring(0, 100) + '...' : result) : 'Analysis complete';
    }
    case 'ERROR':
    case 'FAILED':
      return (event.error as string) || (event.message as string) || 'Error occurred';
    default: {
      // Try to extract meaningful text from unknown events
      const msg = (event.message as string) || (event.step as string) || (event.action as string) || '';
      if (msg) return msg;
      // For truly unknown events, show type
      if (type) return `${type.toLowerCase().replace(/_/g, ' ')}`;
      return 'Processing...';
    }
  }
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
): Promise<{ result: string; steps: string[]; error?: string }> {
  // Demo mode fallback
  if (DEMO_MODE || !hasTinyFishKey()) {
    const delay = 1500 + Math.random() * 2000;
    const steps = ['Navigating to page...', 'Extracting content...', 'Analyzing data...'];
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, delay / steps.length));
      onEvent?.({ type: 'step', data: step });
    }
    const demoResult = getDemoResultForTask(task.id);
    onEvent?.({ type: 'done', data: demoResult });
    return { result: demoResult, steps };
  }

  // Real TinyFish SSE call
  const steps: string[] = [];
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
      onEvent?.({ type: 'error', data: `API ${response.status}: ${errText}` });
      return { result: '', steps, error: `API ${response.status}` };
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
            const stepText = parseTinyFishEvent(parsed);

            if (parsed.type === 'RESULT' || parsed.type === 'COMPLETED' || parsed.type === 'FINAL_RESULT') {
              finalResult = parsed.result || parsed.output || parsed.extracted_content || stepText;
              onEvent?.({ type: 'result', data: finalResult });
            } else if (parsed.type === 'ERROR' || parsed.type === 'FAILED') {
              const errMsg = parsed.error || parsed.message || stepText;
              onEvent?.({ type: 'error', data: errMsg });
              return { result: '', steps, error: errMsg };
            } else {
              // All other events (STREAMING_URL, PROGRESS, ACTION, STEP, etc.)
              if (stepText) {
                steps.push(stepText);
                onEvent?.({ type: 'step', data: stepText });
              }
              // Keep updating finalResult with latest meaningful content
              if (parsed.extracted_content || parsed.result || parsed.output) {
                finalResult = parsed.extracted_content || parsed.result || parsed.output;
              }
            }
          } catch {
            // Plain text SSE data
            if (data && data.length > 0) {
              steps.push(data);
              onEvent?.({ type: 'step', data });
              finalResult = data;
            }
          }
        }
      }
    }

    onEvent?.({ type: 'done', data: finalResult });
    return { result: finalResult, steps };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    onEvent?.({ type: 'error', data: msg });
    return { result: '', steps, error: msg };
  }
}

// Demo fallback results per agent type
function getDemoResultForTask(taskId: string): string {
  const results: Record<string, string> = {
    website: 'Found 3 ESG claims: ISO 14001 certified, carbon neutral by 2030, zero waste policy',
    regulatory: 'No environmental fines found in public records for this entity',
    news: 'Found 2 relevant articles in last 90 days, analyzing sentiment...',
    certs: 'ISO 14001:2015 certificate found — valid until Dec 2026',
    linkedin: 'No recent layoffs detected. ESG officer position active since 2024',
    supply: 'Mapped 4 sub-suppliers across 3 countries. No high-risk regions flagged',
    financial: 'Revenue stable, no debt warnings. Credit rating: BBB+',
    compliance: 'Partial CSRD report published Q4 2025. Gaps found in Scope 3 emissions disclosure',
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
