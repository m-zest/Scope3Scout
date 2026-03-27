// Centralized API key management
// API keys come from environment variables only (Vercel / .env)
// Non-sensitive settings (org name, prefs) use localStorage

// TinyFish
export function getTinyFishKey(): string {
  return import.meta.env.VITE_TINYFISH_API_KEY || '';
}

// Gemini
export function getGeminiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

// OpenAI
export function getOpenAIKey(): string {
  return import.meta.env.VITE_OPENAI_API_KEY || '';
}

// Organization name (non-sensitive, stored in localStorage)
export function getOrgName(): string {
  return localStorage.getItem('scope3scout_org_name') || 'My Organization';
}
export function setOrgName(name: string) {
  localStorage.setItem('scope3scout_org_name', name);
}

// Notification preferences (non-sensitive, stored in localStorage)
export function getNotifPrefs(): { email: boolean; critical: boolean; high: boolean; medium: boolean } {
  const stored = localStorage.getItem('scope3scout_notif_prefs');
  if (stored) return JSON.parse(stored);
  return { email: true, critical: true, high: true, medium: false };
}
export function setNotifPrefs(prefs: { email: boolean; critical: boolean; high: boolean; medium: boolean }) {
  localStorage.setItem('scope3scout_notif_prefs', JSON.stringify(prefs));
}
