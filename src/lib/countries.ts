// Country lookup for SME Network and supplier surfaces.
// Limited to countries that actually appear in demo data + scenario suppliers.
// Expanded as new countries enter the data — not pre-populated to all 27 EU members.

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2
  flag: string; // Unicode flag emoji
}

const COUNTRIES: Record<string, CountryInfo> = {
  Germany: { code: 'DE', flag: '🇩🇪' },
  Italy: { code: 'IT', flag: '🇮🇹' },
  Spain: { code: 'ES', flag: '🇪🇸' },
  Sweden: { code: 'SE', flag: '🇸🇪' },
  Romania: { code: 'RO', flag: '🇷🇴' },
  Bangladesh: { code: 'BD', flag: '🇧🇩' },
  Morocco: { code: 'MA', flag: '🇲🇦' },
  Switzerland: { code: 'CH', flag: '🇨🇭' },
  Denmark: { code: 'DK', flag: '🇩🇰' },
};

export function getCountryInfo(country: string | null | undefined): CountryInfo | null {
  if (!country) return null;
  return COUNTRIES[country] ?? null;
}
