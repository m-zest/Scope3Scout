// Demo data for 5 suppliers with full scan results
// Mix of real companies (for LIVE mode) and realistic scenarios (for DEMO mode)
// Real companies chosen because they have documented, public ESG issues

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
  // Real company - ThyssenKrupp has documented environmental fines and ESG issues
  "ThyssenKrupp Steel": {
    supplier_name: "ThyssenKrupp Steel",
    country: "Germany",
    industry: "Steel Manufacturing",
    website: "https://www.thyssenkrupp-steel.com",
    risk_score: 83,
    risk_level: "critical",
    status: "flagged",
    tier1_result: {
      flag_severity: "critical",
      discrepancies: [
        {
          claim: "Committed to climate-neutral steel production by 2045",
          finding: "Multiple environmental fines for emissions violations at Duisburg plant",
          source_url: "https://www.thyssenkrupp-steel.com/en/company/sustainability/",
          confidence: 0.94,
        },
        {
          claim: "Leading green steel transformation with hydrogen technology",
          finding: "Still operating blast furnaces with high CO2 output, hydrogen plant delayed",
          source_url: "https://www.reuters.com/business/thyssenkrupp",
          confidence: 0.87,
        },
      ],
    },
    violations: [
      {
        id: "v1",
        type: "environmental",
        severity: "critical",
        description: "Emissions violations at Duisburg-Bruckhausen steel plant - exceeded EU ETS carbon allowances",
        source_url: "https://www.thyssenkrupp-steel.com/en/company/sustainability/",
        source_name: "EU Emissions Trading System Records",
        source_excerpt: "ThyssenKrupp Steel Europe exceeded allocated carbon emission credits, facing penalty charges under EU ETS regulation",
        fine_amount_eur: 45000,
        found_at: "2026-03-15",
      },
      {
        id: "v2",
        type: "environmental",
        severity: "high",
        description: "Delayed hydrogen steel transition contradicts public net-zero commitment timeline",
        source_url: "https://www.reuters.com/business/thyssenkrupp",
        source_name: "Reuters",
        source_excerpt: "ThyssenKrupp's green steel transition faces delays as hydrogen direct reduction plant commissioning pushed to 2028",
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
          prediction: "EU ETS enforcement review likely based on emissions pattern",
          probability: 0.91,
          timeline_days: 45,
        },
        {
          agent_type: "media",
          prediction: "German media coverage of green steel delays expected",
          probability: 0.67,
          timeline_days: 30,
        },
        {
          agent_type: "investor",
          prediction: "ESG fund divestment signal triggered by emissions overshoot",
          probability: 0.45,
          timeline_days: 90,
        },
        {
          agent_type: "NGO",
          prediction: "Environmental NGO campaign targeting greenwashing claims",
          probability: 0.58,
          timeline_days: 60,
        },
      ],
      recommended_action: "Terminate supplier contract within 30 days. Initiate alternative supplier qualification process immediately.",
      financial_exposure_eur: 2300000,
      csrd_compliant: false,
    },
  },

  // Real company - H&M has documented labour issues in Bangladesh supply chain
  "H&M Supply Chain Bangladesh": {
    supplier_name: "H&M Supply Chain Bangladesh",
    country: "Bangladesh",
    industry: "Textile Manufacturing",
    website: "https://hmgroup.com/sustainability",
    risk_score: 61,
    risk_level: "high",
    status: "flagged",
    tier1_result: {
      flag_severity: "high",
      discrepancies: [
        {
          claim: "Fair living wage commitment across supply chain",
          finding: "Worker protests over wages at key Bangladesh supplier factories",
          source_url: "https://hmgroup.com/sustainability/fair-and-equal/wages/",
          confidence: 0.81,
        },
      ],
    },
    violations: [
      {
        id: "v3",
        type: "labour",
        severity: "high",
        description: "Multiple supplier factory worker protests over wages in Dhaka and Gazipur",
        source_url: "https://www.theguardian.com/fashion/hm",
        source_name: "The Guardian",
        source_excerpt: "Workers at H&M supplier factories in Bangladesh reported wages below living wage standards despite corporate commitments",
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
          prediction: "EU CSDDD due diligence audit likely for supply chain labour practices",
          probability: 0.54,
          timeline_days: 90,
        },
        {
          agent_type: "media",
          prediction: "Brand reputation exposure if labour disputes continue",
          probability: 0.72,
          timeline_days: 45,
        },
      ],
      recommended_action: "Request immediate third-party labour audit. Suspend new orders pending audit results.",
      financial_exposure_eur: 850000,
      csrd_compliant: false,
    },
  },

  // Real company - Nestlé has documented packaging and environmental issues
  "Nestle Packaging EU": {
    supplier_name: "Nestle Packaging EU",
    country: "Switzerland",
    industry: "Packaging & Food",
    website: "https://www.nestle.com/sustainability",
    risk_score: 58,
    risk_level: "high",
    status: "flagged",
    tier1_result: {
      flag_severity: "high",
      discrepancies: [
        {
          claim: "100% recyclable or reusable packaging by 2025",
          finding: "Only 82% of packaging recyclable as of 2024 report - target missed",
          source_url: "https://www.nestle.com/sustainability/waste-reduction",
          confidence: 0.89,
        },
      ],
    },
    violations: [
      {
        id: "v4",
        type: "environmental",
        severity: "high",
        description: "Missed 2025 recyclable packaging target - 82% achieved vs 100% claimed",
        source_url: "https://www.nestle.com/sustainability/waste-reduction",
        source_name: "Nestle Sustainability Report 2024",
        source_excerpt: "82.5% of total packaging is designed to be recyclable or reusable, falling short of the 100% target",
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
          prediction: "EU Packaging Regulation compliance gap likely flagged",
          probability: 0.61,
          timeline_days: 120,
        },
      ],
      recommended_action: "Request updated packaging compliance documentation. Flag for CSRD reporting review.",
      financial_exposure_eur: 450000,
      csrd_compliant: false,
    },
  },

  // Real company - BASF is generally well-rated for ESG
  "BASF SE": {
    supplier_name: "BASF SE",
    country: "Germany",
    industry: "Chemical Processing",
    website: "https://www.basf.com/global/en/who-we-are/sustainability.html",
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
          prediction: "No enforcement risk identified - strong CSRD compliance record",
          probability: 0.08,
          timeline_days: 365,
        },
      ],
      recommended_action: "No immediate action required. Schedule routine review in 6 months.",
      financial_exposure_eur: 0,
      csrd_compliant: true,
    },
  },

  // Real company - Maersk is well-regarded for logistics sustainability
  "Maersk Logistics": {
    supplier_name: "Maersk Logistics",
    country: "Denmark",
    industry: "Logistics & Transport",
    website: "https://www.maersk.com/sustainability",
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
          prediction: "Fully compliant - no risk signals detected across all data sources",
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

// Helper: get a demo supplier by name (falls back to BASF)
export function getDemoScanResult(supplierName: string): DemoScanResult {
  return DEMO_SCAN_RESULTS[supplierName] || DEMO_SCAN_RESULTS["BASF SE"];
}
