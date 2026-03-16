// Proprietary Simulation Engine (Tier 3)
// Multi-agent predictive risk scoring

import type { Tier2JSON, Tier3JSON } from '@/types';

const SIMULATION_URL = import.meta.env.VITE_SIMULATION_ENGINE_URL || 'http://localhost:8001';
const SIMULATION_KEY = import.meta.env.VITE_SIMULATION_ENGINE_KEY || '';

export async function runSimulation(input: Tier2JSON): Promise<Tier3JSON> {
  const response = await fetch(`${SIMULATION_URL}/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SIMULATION_KEY ? { Authorization: `Bearer ${SIMULATION_KEY}` } : {}),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Simulation engine error: ${response.status}`);
  }

  return response.json();
}
