// Demo data for 5 realistic suppliers with full scan results
// Used when VITE_DEMO_MODE=true to showcase the platform without API keys

import type { Violation, SimulationOutput, Discrepancy, Supplier } from '@/types';

export interface DemoScanResult {
  supplier_name: string;
  country: string;
  industry: string;
  website: string;
  risk_score: number;
  risk_level: Supplier['risk_level'];
  status: Supplier['status'];
  tier1_result: {
    flag_severity: string;
    discrepancies: Discrepancy[];
  };
  violations: (Omit<Violation, 'supplier_id'> & { id: string })[];
  simulation_output: Omit<SimulationOutput, 'id' | 'supplier_id' | 'simulated_at'>;
}

export const DEMO_SCAN_RESULTS: Record<string, DemoScanResult> = {
  "SteelCorp GmbH": {
    supplier_name: "SteelCorp GmbH",
    country: "Germany",
    industry: "Steel Manufacturing",
    website: "https://www.google.com/search?q=SteelCorp+GmbH+Germany+steel+ESG",
    risk_score: 83,
    risk_level: "critical",
    status: "flagged",
    tier1_result: {
      flag_severity: "critical",
      discrepancies: [
        {
          claim: "ISO 14001 certified -zero violations on record",
          finding: "EPA fine €40,000 issued March 2026 for illegal water discharge",
          source_url: "https://umweltbundesamt.de/steelcorp-fine-2026",
          confidence: 0.94,
        },
        {
          claim: "Renewable energy commitment since 2023",
          finding: "Coal plant contract signed Q4 2025 -contradicts sustainability report",
          source_url: "https://reuters.com/steelcorp-coal-2025",
          confidence: 0.87,
        },
      ],
    },
    violations: [
      {
        id: "v1",
        type: "environmental",
        severity: "critical",
        description: "Illegal water discharge into Rhine river -untreated industrial wastewater detected",
        source_url: "https://umweltbundesamt.de/steelcorp-fine-2026",
        source_name: "German Federal Environment Agency (UBA)",
        source_excerpt: "SteelCorp GmbH fined €40,000 for illegal discharge of untreated wastewater into the Rhine river near Düsseldorf facility",
        fine_amount_eur: 40000,
        found_at: "2026-03-15",
      },
      {
        id: "v2",
        type: "environmental",
        severity: "high",
        description: "Active coal energy contract contradicts published green energy claims in 2024 sustainability report",
        source_url: "https://reuters.com/steelcorp-coal-2025",
        source_name: "Reuters Germany",
        source_excerpt: "SteelCorp signed a 3-year coal supply agreement in Q4 2025 despite publicly committing to 100% renewable energy",
        fine_amount_eur: 0,
        found_at: "2026-03-15",
      },
    ],
    simulation_output: {
      risk_score: 83,
      risk_level: "critical",
      predictions: [
        {
          agent_type: "regulator",
          prediction: "Enforcement review initiated based on EPA fine pattern",
          probability: 0.91,
          timeline_days: 45,
        },
        {
          agent_type: "media",
          prediction: "Regional environmental coverage likely given Rhine proximity",
          probability: 0.67,
          timeline_days: 30,
        },
        {
          agent_type: "investor",
          prediction: "ESG fund divestment signal triggered by dual violations",
          probability: 0.45,
          timeline_days: 90,
        },
        {
          agent_type: "NGO",
          prediction: "Environmental NGO public statement expected",
          probability: 0.58,
          timeline_days: 60,
        },
      ],
      recommended_action: "Terminate supplier contract within 30 days. Initiate alternative supplier qualification process immediately.",
      financial_exposure_eur: 2300000,
      csrd_compliant: false,
    },
  },

  "TextilePro Bangladesh": {
    supplier_name: "TextilePro Bangladesh",
    country: "Bangladesh",
    industry: "Textile Manufacturing",
    website: "https://textilepro.com.bd",
    risk_score: 61,
    risk_level: "high",
    status: "flagged",
    tier1_result: {
      flag_severity: "high",
      discrepancies: [
        {
          claim: "Living wage employer -Fair Trade certified",
          finding: "2 labour strike reports in 2025 over unpaid wages",
          source_url: "https://thedailystar.net/textilpro-strike-2025",
          confidence: 0.81,
        },
      ],
    },
    violations: [
      {
        id: "v3",
        type: "labour",
        severity: "high",
        description: "Workers strike over unpaid wages -reported twice in 2025, affecting 400+ workers",
        source_url: "https://thedailystar.net/textilpro-strike-2025",
        source_name: "The Daily Star Bangladesh",
        source_excerpt: "Workers at TextilePro staged a two-day strike demanding unpaid wages from October and November 2025",
        fine_amount_eur: 0,
        found_at: "2026-03-15",
      },
    ],
    simulation_output: {
      risk_score: 61,
      risk_level: "high",
      predictions: [
        {
          agent_type: "regulator",
          prediction: "Supply chain due diligence audit likely under CSDDD",
          probability: 0.54,
          timeline_days: 90,
        },
        {
          agent_type: "media",
          prediction: "Brand reputation exposure if labour issues escalate",
          probability: 0.72,
          timeline_days: 45,
        },
      ],
      recommended_action: "Request immediate third-party labour audit. Suspend new orders pending audit results.",
      financial_exposure_eur: 850000,
      csrd_compliant: false,
    },
  },

  "PackagingPlus Romania": {
    supplier_name: "PackagingPlus Romania",
    country: "Romania",
    industry: "Packaging & Materials",
    website: "https://packagingplus.ro",
    risk_score: 58,
    risk_level: "high",
    status: "flagged",
    tier1_result: {
      flag_severity: "high",
      discrepancies: [
        {
          claim: "100% renewable energy since 2022",
          finding: "Active coal energy contract found in public tender records",
          source_url: "https://anap.gov.ro/packagingplus-tender-2025",
          confidence: 0.89,
        },
      ],
    },
    violations: [
      {
        id: "v4",
        type: "environmental",
        severity: "high",
        description: "Public tender records show active coal energy contract contradicting published green energy claims",
        source_url: "https://anap.gov.ro/packagingplus-tender-2025",
        source_name: "Romanian Public Procurement Agency (ANAP)",
        source_excerpt: "PackagingPlus SRL awarded coal energy supply contract January 2025 via public procurement portal",
        fine_amount_eur: 0,
        found_at: "2026-03-15",
      },
    ],
    simulation_output: {
      risk_score: 58,
      risk_level: "high",
      predictions: [
        {
          agent_type: "regulator",
          prediction: "CSRD reporting discrepancy likely flagged in next audit cycle",
          probability: 0.61,
          timeline_days: 120,
        },
      ],
      recommended_action: "Request updated energy usage documentation. Flag for CSRD reporting review.",
      financial_exposure_eur: 450000,
      csrd_compliant: false,
    },
  },

  "ChemBase France": {
    supplier_name: "ChemBase France",
    country: "France",
    industry: "Chemical Processing",
    website: "https://chembase.fr",
    risk_score: 18,
    risk_level: "low",
    status: "cleared",
    tier1_result: {
      flag_severity: "none",
      discrepancies: [],
    },
    violations: [],
    simulation_output: {
      risk_score: 18,
      risk_level: "low",
      predictions: [
        {
          agent_type: "regulator",
          prediction: "No enforcement risk identified in current scan cycle",
          probability: 0.08,
          timeline_days: 365,
        },
      ],
      recommended_action: "No immediate action required. Schedule routine review in 6 months.",
      financial_exposure_eur: 0,
      csrd_compliant: true,
    },
  },

  "LogiTrans Hungary": {
    supplier_name: "LogiTrans Hungary",
    country: "Hungary",
    industry: "Logistics & Transport",
    website: "https://logitrans.hu",
    risk_score: 12,
    risk_level: "low",
    status: "cleared",
    tier1_result: {
      flag_severity: "none",
      discrepancies: [],
    },
    violations: [],
    simulation_output: {
      risk_score: 12,
      risk_level: "low",
      predictions: [
        {
          agent_type: "regulator",
          prediction: "Fully compliant -no risk signals detected across all data sources",
          probability: 0.05,
          timeline_days: 365,
        },
      ],
      recommended_action: "Supplier is CSRD compliant. No action required.",
      financial_exposure_eur: 0,
      csrd_compliant: true,
    },
  },
};

// Helper: get all demo suppliers as an array
export function getDemoSuppliers(): (DemoScanResult & { id: string })[] {
  return Object.entries(DEMO_SCAN_RESULTS).map(([, result], index) => ({
    ...result,
    id: `demo-supplier-${index + 1}`,
  }));
}

// Helper: get a demo supplier by name (falls back to ChemBase)
export function getDemoScanResult(supplierName: string): DemoScanResult {
  return DEMO_SCAN_RESULTS[supplierName] || DEMO_SCAN_RESULTS["ChemBase France"];
}
