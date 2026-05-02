// Scripted demo scenarios for the Milan pitch.
// Deterministic, no real API calls — bypasses TinyFish/Gemini entirely.
// One scenario per European SME on the dashboard.

import type { ExecutiveSummaryMetrics } from '@/components/dashboard/ExecutiveSummary';

export interface ScenarioStep {
  agentId: 'website' | 'regulatory' | 'news' | 'certs';
  steps: string[]; // sub-step lines shown in the agent card timeline
  finalResult: string;
  hasIssues: boolean;
}

export interface ScenarioContradiction {
  agent: string;
  claim: string;
  evidence: string;
  sourceUrl: string;
  confidence: number; // 0..1
  severity: 'critical' | 'high';
  financialExposureEur?: number;
  timelineImpactDays?: number;
}

export interface ScriptedScenario {
  id: string;
  smeId: string;
  smeName: string;
  smeCountry: string;
  smeIndustry: string;
  supplierName: string;
  supplierCountry: string;
  prewarmMs: number;
  tier1: ScenarioStep[];
  contradiction: ScenarioContradiction | null;
  executive: ExecutiveSummaryMetrics;
  recommendedAction: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export const DEMO_SCENARIOS: Record<string, ScriptedScenario> = {
  'bavarian-motors': {
    id: 'bavarian-motors',
    smeId: 'sme-bavarian-motors',
    smeName: 'Bavarian Motors GmbH',
    smeCountry: 'Germany',
    smeIndustry: 'Automotive Components',
    supplierName: 'Carpathian Components SRL',
    supplierCountry: 'Romania',
    prewarmMs: 1000,
    tier1: [
      {
        agentId: 'website',
        steps: [
          'Navigating to carpathian-components.ro/sustainability',
          'Extracting supplier compliance claims...',
          'Found claim: "100% verified low Scope 3 emissions"',
          'Found claim: "Full CSRD Article 29a compliance"',
          'Found claim: "ISO 14001 certified, Bureau Veritas audited"',
        ],
        finalResult: '3 ESG claims extracted. Supplier asserts low-carbon manufacturing and full CSRD readiness.',
        hasIssues: false,
      },
      {
        agentId: 'regulatory',
        steps: [
          'Querying EU ETS registry for installation records...',
          'Cross-referencing Romanian APM filings...',
          'Pulling 2024 freight manifests from BAFG and ANAF...',
          'Computing implied Scope 3 from shipping volumes...',
          'Implied Scope 3 emissions ~3.2x reported figure',
        ],
        finalResult: 'FOUND: shipping volume implies emissions ~3.2× the supplier-reported figure. EU ETS records show no green-tariff offset claimed.',
        hasIssues: true,
      },
      {
        agentId: 'news',
        steps: [
          'Searching Reuters, Handelsblatt, Profit.ro coverage...',
          'Article: "Romanian auto suppliers under scrutiny on Scope 3" — Profit.ro 2026-02-14',
          'Article: "German OEMs tighten supplier carbon attestation" — Handelsblatt 2026-03-02',
          'Sentiment analysis: elevated regulatory attention',
        ],
        finalResult: 'Two recent articles flag Romanian-tier-2 supplier emissions reporting gaps. Coverage is independent and post-dated to claim.',
        hasIssues: true,
      },
      {
        agentId: 'certs',
        steps: [
          'Verifying ISO 14001 certificate via Bureau Veritas registry...',
          'Certificate located: certificate-no FR-2023-014821',
          'Status check: certificate scope covers HQ only, NOT manufacturing site',
          'CLAIM-EVIDENCE MISMATCH: "ISO 14001 certified" claim is partial',
        ],
        finalResult: 'CLAIM-EVIDENCE MISMATCH: ISO 14001 certificate covers headquarters only. Manufacturing facility (the relevant scope for Scope 3) is uncertified.',
        hasIssues: true,
      },
    ],
    contradiction: {
      agent: 'Compliance Verifier',
      claim: '100% verified low Scope 3 emissions and full CSRD Article 29a compliance',
      evidence: 'EU ETS shipping records imply Scope 3 emissions ~3.2× the supplier-reported figure. ISO 14001 certificate covers headquarters only — manufacturing facility is uncertified.',
      sourceUrl: 'https://www.eea.europa.eu/data-and-maps/dashboards/emissions-trading-viewer-1',
      confidence: 0.93,
      severity: 'critical',
      financialExposureEur: 2_400_000,
      timelineImpactDays: 45,
    },
    executive: {
      financialExposureEur: 2_400_000,
      suppliersAtRisk: 3,
      csrdViolations: 7,
      timeToImpactDays: 45,
    },
    recommendedAction: 'Suspend new orders. Request third-party Scope 3 audit within 14 days. Initiate alternative-supplier qualification.',
    riskLevel: 'critical',
  },

  'lombardia-tessile': {
    id: 'lombardia-tessile',
    smeId: 'sme-lombardia-tessile',
    smeName: 'Lombardia Tessile SRL',
    smeCountry: 'Italy',
    smeIndustry: 'Textile Manufacturing',
    supplierName: 'Dhaka Garments BD Ltd',
    supplierCountry: 'Bangladesh',
    prewarmMs: 1000,
    tier1: [
      {
        agentId: 'website',
        steps: [
          'Loading dhaka-garments-bd.com/sustainability...',
          'Extracting labour compliance claims...',
          'Found claim: "Living wage paid to all factory workers"',
          'Found claim: "100% renewable electricity by 2025"',
          'Found claim: "BSCI / SA8000 audited every 12 months"',
        ],
        finalResult: '3 social and environmental compliance claims extracted.',
        hasIssues: false,
      },
      {
        agentId: 'regulatory',
        steps: [
          'Searching Asia Floor Wage Alliance audit database...',
          'Pulling Bangladeshi RMG sector wage benchmarks 2024...',
          'Cross-referencing factory utility records...',
          'Reported wages ~38% below Asia Floor Wage benchmark',
          'Renewable mix: grid only ~12% renewable in Dhaka 2024',
        ],
        finalResult: 'FOUND: reported wages 38% below Asia Floor Wage benchmark. Grid renewables ~12%, contradicting "100% renewable" claim.',
        hasIssues: true,
      },
      {
        agentId: 'news',
        steps: [
          'Searching Guardian, Sourcing Journal, Just-Style...',
          'Article: "European brands face fresh Bangladesh wage scrutiny" — Guardian 2026-01-22',
          'Sentiment: critical, post-dates supplier claim',
        ],
        finalResult: 'Independent press reports inconsistent with supplier statements on wages and energy mix.',
        hasIssues: true,
      },
      {
        agentId: 'certs',
        steps: [
          'Verifying SA8000 certificate via SAAS registry...',
          'Certificate found: SA8000 cert no SAAS-BD-2022-0334',
          'Status: EXPIRED 2024-08-15 — renewal not filed',
        ],
        finalResult: 'CLAIM-EVIDENCE MISMATCH: SA8000 certificate expired August 2024. No renewal on file.',
        hasIssues: true,
      },
    ],
    contradiction: {
      agent: 'Compliance Verifier',
      claim: 'Living wage paid to all workers and 100% renewable electricity by 2025',
      evidence: 'Asia Floor Wage Alliance benchmarks show reported wages 38% below the regional living wage threshold. Local grid renewable share is ~12%, with no on-site renewable installation on file. SA8000 certificate expired August 2024.',
      sourceUrl: 'https://asia.floorwage.org/',
      confidence: 0.89,
      severity: 'critical',
      financialExposureEur: 1_200_000,
      timelineImpactDays: 60,
    },
    executive: {
      financialExposureEur: 1_200_000,
      suppliersAtRisk: 2,
      csrdViolations: 4,
      timeToImpactDays: 60,
    },
    recommendedAction: 'Pause new POs pending third-party labour audit. Notify supplier of CSRD/CSDDD non-compliance and request remediation plan.',
    riskLevel: 'high',
  },

  'iberian-foods': {
    id: 'iberian-foods',
    smeId: 'sme-iberian-foods',
    smeName: 'Iberian Foods SL',
    smeCountry: 'Spain',
    smeIndustry: 'Food Processing',
    supplierName: 'Atlas Agritrade SARL',
    supplierCountry: 'Morocco',
    prewarmMs: 1000,
    tier1: [
      {
        agentId: 'website',
        steps: [
          'Loading atlas-agritrade.ma/quality...',
          'Extracting origin and traceability claims...',
          'Found claim: "100% Moroccan single-origin produce"',
          'Found claim: "Full chain-of-custody documentation"',
          'Found claim: "GLOBALG.A.P. certified across all sites"',
        ],
        finalResult: '3 origin and traceability claims extracted.',
        hasIssues: false,
      },
      {
        agentId: 'regulatory',
        steps: [
          'Querying Moroccan ONSSA export declarations...',
          'Cross-referencing EU TRACES NT animal- and plant-health records...',
          'Spot-checking 2024 Q4 customs manifests...',
          'Observation: ~22% of declared "Moroccan" volume re-exported via Algeciras with non-MA origin marks',
        ],
        finalResult: 'FOUND: ~22% of declared Moroccan-origin volume in 2024 Q4 carries non-MA origin documentation in EU customs. Chain-of-custody breaks at Algeciras.',
        hasIssues: true,
      },
      {
        agentId: 'news',
        steps: [
          'Searching El País, Reuters, ProductNews...',
          'Article: "Spanish food importers face origin-labelling tightening" — El País 2026-02-09',
        ],
        finalResult: 'Independent press confirms increased EU enforcement on origin labelling for Mediterranean produce.',
        hasIssues: true,
      },
      {
        agentId: 'certs',
        steps: [
          'Verifying GLOBALG.A.P. certificate via the audit hub...',
          'Certificates found: 3 sites in Morocco, all valid',
          'Coverage gap: certificates do not include the Algeciras handling site',
        ],
        finalResult: 'GLOBALG.A.P. certificates valid for 3 Moroccan sites only. Algeciras handling step is outside certified scope.',
        hasIssues: true,
      },
    ],
    contradiction: {
      agent: 'Compliance Verifier',
      claim: '100% Moroccan single-origin produce with full chain-of-custody',
      evidence: 'EU TRACES NT and 2024 Q4 customs records show ~22% of declared Moroccan-origin volume carries non-MA origin marks at Algeciras. GLOBALG.A.P. coverage does not extend to the handling site.',
      sourceUrl: 'https://ec.europa.eu/food/animals/traces_en',
      confidence: 0.86,
      severity: 'high',
      financialExposureEur: 680_000,
      timelineImpactDays: 90,
    },
    executive: {
      financialExposureEur: 680_000,
      suppliersAtRisk: 1,
      csrdViolations: 2,
      timeToImpactDays: 90,
    },
    recommendedAction: 'Request full chain-of-custody documentation for Algeciras flow. Hold imports flagged for re-export until origin-labelling resolved.',
    riskLevel: 'high',
  },

  'nordic-pack': {
    id: 'nordic-pack',
    smeId: 'sme-nordic-pack',
    smeName: 'Nordic Pack AB',
    smeCountry: 'Sweden',
    smeIndustry: 'Sustainable Packaging',
    supplierName: 'Skogen Fiber AB',
    supplierCountry: 'Sweden',
    prewarmMs: 1000,
    tier1: [
      {
        agentId: 'website',
        steps: [
          'Loading skogen-fiber.se/sustainability...',
          'Extracting compliance claims...',
          'Found claim: "FSC and PEFC dual-chain certified"',
          'Found claim: "Net-zero Scope 1+2 since 2022"',
          'Found claim: "EUDR-ready supplier with full traceability"',
        ],
        finalResult: '3 claims extracted. Supplier reports strong CSRD posture.',
        hasIssues: false,
      },
      {
        agentId: 'regulatory',
        steps: [
          'Querying Swedish Energy Agency emissions register...',
          'Cross-referencing FSC International chain-of-custody database...',
          'Pulling EUDR readiness self-attestations...',
          'All filings consistent with public claims',
        ],
        finalResult: 'No discrepancy detected. Filings consistent with claims.',
        hasIssues: false,
      },
      {
        agentId: 'news',
        steps: [
          'Searching Nordic press and trade publications...',
          'No adverse coverage in trailing 12 months',
        ],
        finalResult: 'No adverse media findings.',
        hasIssues: false,
      },
      {
        agentId: 'certs',
        steps: [
          'Verifying FSC and PEFC certificates via registries...',
          'FSC C-line valid through 2027-09-12',
          'PEFC chain valid through 2026-11-30',
          'Both certificates in good standing',
        ],
        finalResult: 'All certifications valid and in good standing.',
        hasIssues: false,
      },
    ],
    contradiction: null,
    executive: {
      financialExposureEur: 0,
      suppliersAtRisk: 0,
      csrdViolations: 0,
      timeToImpactDays: 0,
    },
    recommendedAction: 'No action required. Supplier is fully CSRD compliant. Schedule routine re-audit in 6 months.',
    riskLevel: 'low',
  },
};

export function getScenario(id: string): ScriptedScenario | null {
  return DEMO_SCENARIOS[id] ?? null;
}

export const DEFAULT_SCENARIO_ID = 'bavarian-motors';
