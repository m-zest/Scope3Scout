// Real suppliers for LIVE AUDIT mode.
// These entries drive real TinyFish + Gemini scans against publicly verifiable
// pages. There are NO hardcoded contradictions here on purpose — any finding
// must come from Gemini's structured analysis at runtime.

export interface RealSupplier {
  id: string;
  name: string;
  primaryUrl: string;
  country: string;
  industry: string;
  expectedClaimKeywords: string[];
  newsSearchQueries: string[];
  regulatorySearchQueries: string[];
}

export const REAL_SUPPLIERS: RealSupplier[] = [
  {
    id: 'live-nestle',
    name: 'Nestlé Packaging',
    primaryUrl: 'https://www.nestle.com/sustainability/packaging',
    country: 'Switzerland',
    industry: 'Packaging & Food',
    expectedClaimKeywords: [
      '100% recyclable',
      'reusable packaging',
      '2025 target',
      'plastic reduction',
      'virgin plastic',
    ],
    newsSearchQueries: [
      'Nestlé packaging recyclable target miss 2025',
      'Nestlé sustainability progress report 2024 packaging',
      'Nestlé virgin plastic reduction commitment update',
    ],
    regulatorySearchQueries: [
      'Nestlé EU Packaging and Packaging Waste Regulation',
      'Nestlé extended producer responsibility filing',
    ],
  },
  {
    id: 'live-thyssenkrupp',
    name: 'ThyssenKrupp Steel Live',
    primaryUrl: 'https://www.thyssenkrupp-steel.com/en/company/sustainability/',
    country: 'Germany',
    industry: 'Steel Manufacturing',
    expectedClaimKeywords: [
      'climate-neutral steel',
      '2045',
      'hydrogen direct reduction',
      'green steel',
      'Scope 1 emissions',
    ],
    newsSearchQueries: [
      'ThyssenKrupp hydrogen direct reduction plant delay',
      'ThyssenKrupp green steel transition timeline 2026 2028',
      'ThyssenKrupp Duisburg blast furnace emissions',
    ],
    regulatorySearchQueries: [
      'ThyssenKrupp EU ETS carbon allowance violation',
      'ThyssenKrupp German environmental enforcement',
    ],
  },
  {
    id: 'live-hm',
    name: 'H&M Group Sustainability Live',
    primaryUrl: 'https://hmgroup.com/sustainability/',
    country: 'Sweden',
    industry: 'Apparel & Textile',
    expectedClaimKeywords: [
      'fair living wage',
      'supplier code of conduct',
      'human rights due diligence',
      'circular fashion',
      '100% recycled or sustainably sourced',
    ],
    newsSearchQueries: [
      'H&M Bangladesh supplier factory wage protest',
      'H&M Asia Floor Wage Alliance audit findings',
      'H&M supplier code of conduct enforcement gap',
    ],
    regulatorySearchQueries: [
      'H&M EU CSDDD due diligence supply chain',
      'H&M Norwegian Transparency Act disclosure',
    ],
  },
];

export function getRealSupplierByName(name: string): RealSupplier | undefined {
  return REAL_SUPPLIERS.find((s) => s.name === name);
}

export function getRealSupplierById(id: string): RealSupplier | undefined {
  return REAL_SUPPLIERS.find((s) => s.id === id);
}
