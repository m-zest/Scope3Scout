// Core domain types for Scope3Scout

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  org_id: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  created_at: string;
}

export interface Supplier {
  id: string;
  org_id: string;
  name: string;
  website: string | null;
  country: string | null;
  industry: string | null;
  status: 'pending' | 'scanning' | 'scanned' | 'flagged' | 'cleared';
  risk_score: number;
  risk_level: 'unknown' | 'low' | 'medium' | 'high' | 'critical';
  last_scanned_at: string | null;
  created_at: string;
}

export interface Scan {
  id: string;
  org_id: string;
  status: 'running' | 'completed' | 'failed';
  total_suppliers: number;
  completed_suppliers: number;
  started_at: string;
  completed_at: string | null;
}

export interface Tier1Result {
  id: string;
  supplier_id: string;
  scan_id: string;
  raw_findings: Record<string, unknown> | null;
  flag_severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  discrepancies: Discrepancy[] | null;
  scanned_at: string;
}

export interface Violation {
  id: string;
  supplier_id: string;
  type: 'environmental' | 'labour' | 'legal' | 'financial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source_url: string | null;
  source_name: string | null;
  source_excerpt: string | null;
  fine_amount_eur: number;
  found_at: string;
}

export interface SimulationOutput {
  id: string;
  supplier_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  predictions: Prediction[];
  recommended_action: string;
  financial_exposure_eur: number;
  csrd_compliant: boolean;
  simulated_at: string;
}

export interface Alert {
  id: string;
  org_id: string;
  supplier_id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  created_at: string;
}

// Data contracts between tiers

export interface Discrepancy {
  claim: string;
  finding: string;
  source_url: string;
  confidence: number;
}

export interface Prediction {
  agent_type: string;
  prediction: string;
  probability: number;
  timeline_days: number;
}

// Tier 1 → Tier 2 data contract
export interface Tier1JSON {
  supplier_id: string;
  supplier_name: string;
  supplier_website: string;
  flag_severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  discrepancies: Discrepancy[];
  raw_sources: string[];
}

// Tier 2 → Tier 3 data contract
export interface Tier2JSON {
  supplier_id: string;
  supplier_name: string;
  country: string;
  industry: string;
  violations: {
    type: 'environmental' | 'labour' | 'legal' | 'financial';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    date_found: string;
    source_url: string;
    fine_amount_eur: number | null;
  }[];
  trigger_reason: string;
}

// Tier 3 → Dashboard data contract
export interface Tier3JSON {
  supplier_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  predictions: Prediction[];
  recommended_action: string;
  csrd_compliant: boolean;
  financial_exposure_eur: number;
}
