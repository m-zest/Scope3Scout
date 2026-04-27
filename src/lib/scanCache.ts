// In-memory cache for LIVE AUDIT scan results.
// Used to avoid re-running expensive TinyFish + Gemini scans during a demo.
// Module-scoped Map; not persisted. 30-minute TTL.

import type { AgentTask } from '@/components/dashboard/CCTVGrid';
import type { Contradiction } from '@/components/dashboard/ContradictionPanel';
import type { TimelineEntry } from '@/components/dashboard/TimelineFeed';
import type { DemoScanResult } from '@/data/demoSuppliers';

export interface CachedLiveScan {
  tasks: AgentTask[];
  contradictions: Contradiction[];
  timeline: TimelineEntry[];
  scanResult: DemoScanResult & { id: string };
  totalTime: number;
  cachedAt: number;
}

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const cache = new Map<string, CachedLiveScan>();

function keyFor(supplierName: string): string {
  return supplierName.trim().toLowerCase();
}

export function getCachedLiveScan(supplierName: string): CachedLiveScan | null {
  const entry = cache.get(keyFor(supplierName));
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > TTL_MS) {
    cache.delete(keyFor(supplierName));
    return null;
  }
  return entry;
}

export function setCachedLiveScan(supplierName: string, payload: Omit<CachedLiveScan, 'cachedAt'>): void {
  cache.set(keyFor(supplierName), { ...payload, cachedAt: Date.now() });
}

export function clearCachedLiveScan(supplierName?: string): void {
  if (supplierName) cache.delete(keyFor(supplierName));
  else cache.clear();
}
