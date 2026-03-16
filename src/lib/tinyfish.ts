// TinyFish Web Agent API integration
// Used for Tier 1 and Tier 2 web scraping

import { getDemoScanResult, getDemoSuppliers, type DemoScanResult } from '@/data/demoSuppliers';

const TINYFISH_API_KEY = import.meta.env.VITE_TINYFISH_API_KEY || '';
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export interface TinyFishTask {
  url: string;
  instructions: string;
  extract_fields?: string[];
}

export interface SupplierInput {
  name: string;
  website?: string;
  country?: string;
  industry?: string;
}

// Simulate a realistic scan delay (1.5–3s per supplier)
function simulateDelay(): Promise<void> {
  const ms = 1500 + Math.random() * 1500;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Scan a single supplier — returns demo data or real TinyFish result
export async function scanSupplier(supplier: SupplierInput): Promise<DemoScanResult> {
  if (DEMO_MODE) {
    await simulateDelay();
    return getDemoScanResult(supplier.name);
  }

  // Real TinyFish API call
  const response = await fetch('https://api.tinyfish.ai/v1/agent/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TINYFISH_API_KEY}`,
    },
    body: JSON.stringify({
      tasks: buildScanTasks(supplier),
    }),
  });

  if (!response.ok) {
    throw new Error(`TinyFish API error: ${response.status}`);
  }

  return response.json();
}

// Scan all suppliers — returns array of results with progress callback
export async function scanAllSuppliers(
  suppliers: SupplierInput[],
  onProgress?: (completed: number, total: number, supplierName: string) => void
): Promise<DemoScanResult[]> {
  if (DEMO_MODE) {
    const demoSuppliers = getDemoSuppliers();
    const results: DemoScanResult[] = [];

    for (let i = 0; i < demoSuppliers.length; i++) {
      await simulateDelay();
      results.push(demoSuppliers[i]);
      onProgress?.(i + 1, demoSuppliers.length, demoSuppliers[i].supplier_name);
    }

    return results;
  }

  // Real mode: scan all suppliers in parallel
  const results: DemoScanResult[] = [];
  for (let i = 0; i < suppliers.length; i++) {
    const result = await scanSupplier(suppliers[i]);
    results.push(result);
    onProgress?.(i + 1, suppliers.length, suppliers[i].name);
  }

  return results;
}

// Build the 5 parallel agent tasks for a supplier (Tier 1)
function buildScanTasks(supplier: SupplierInput): TinyFishTask[] {
  const tasks: TinyFishTask[] = [];

  if (supplier.website) {
    tasks.push({
      url: supplier.website,
      instructions: 'Extract all ESG claims, certifications, sustainability commitments, and environmental policies from this company website.',
      extract_fields: ['esg_claims', 'certifications', 'policies'],
    });
  }

  tasks.push({
    url: `https://ec.europa.eu/environment`,
    instructions: `Search for environmental fines, violations, or penalties related to "${supplier.name}" in ${supplier.country || 'EU'}.`,
    extract_fields: ['violations', 'fines', 'penalties'],
  });

  tasks.push({
    url: `https://news.google.com/search?q="${supplier.name}" environment labour violation`,
    instructions: `Find news articles from the last 90 days about "${supplier.name}" related to environmental issues, labour disputes, court cases, or controversies.`,
    extract_fields: ['articles', 'incidents', 'controversies'],
  });

  tasks.push({
    url: 'https://www.iso.org/certification.html',
    instructions: `Verify ISO 14001 and other environmental certifications for "${supplier.name}". Check validity and expiry dates.`,
    extract_fields: ['certifications', 'validity', 'expiry_dates'],
  });

  tasks.push({
    url: `https://www.linkedin.com/company/${supplier.name?.toLowerCase().replace(/\s+/g, '-')}`,
    instructions: `Check "${supplier.name}" LinkedIn for recent layoffs, key ESG officer departures, or hiring pattern changes.`,
    extract_fields: ['layoffs', 'departures', 'hiring_patterns'],
  });

  return tasks;
}

export async function runTinyFishAgent(task: TinyFishTask): Promise<Record<string, unknown>> {
  if (DEMO_MODE) {
    await simulateDelay();
    return { demo: true, task: task.instructions };
  }

  const response = await fetch('https://api.tinyfish.ai/v1/agent/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TINYFISH_API_KEY}`,
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error(`TinyFish API error: ${response.status}`);
  }

  return response.json();
}

export async function runParallelAgents(tasks: TinyFishTask[]): Promise<Record<string, unknown>[]> {
  if (DEMO_MODE) {
    await simulateDelay();
    return tasks.map((t) => ({ demo: true, task: t.instructions }));
  }

  return Promise.all(tasks.map(runTinyFishAgent));
}
