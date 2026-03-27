// Centralized API key management
// Keys can come from: localStorage (Settings page) > env vars (Vercel) > empty

const STORAGE_PREFIX = 'scope3scout_';

function getKey(name: string, envVar: string): string {
  // Priority: localStorage (user-entered in Settings) > env var (Vercel)
  const stored = localStorage.getItem(`${STORAGE_PREFIX}${name}`);
  if (stored) return stored;
  return import.meta.env[envVar] || '';
}

function setKey(name: string, value: string) {
  if (value) {
    localStorage.setItem(`${STORAGE_PREFIX}${name}`, value);
  } else {
    localStorage.removeItem(`${STORAGE_PREFIX}${name}`);
  }
}

// TinyFish
export function getTinyFishKey(): string {
  return getKey('tinyfish_key', 'VITE_TINYFISH_API_KEY');
}
export function setTinyFishKey(key: string) {
  setKey('tinyfish_key', key);
}

// Gemini
export function getGeminiKey(): string {
  return getKey('gemini_key', 'VITE_GEMINI_API_KEY');
}
export function setGeminiKey(key: string) {
  setKey('gemini_key', key);
}

// OpenAI
export function getOpenAIKey(): string {
  return getKey('openai_key', 'VITE_OPENAI_API_KEY');
}
export function setOpenAIKey(key: string) {
  setKey('openai_key', key);
}

// Organization name
export function getOrgName(): string {
  return localStorage.getItem(`${STORAGE_PREFIX}org_name`) || 'My Organization';
}
export function setOrgName(name: string) {
  localStorage.setItem(`${STORAGE_PREFIX}org_name`, name);
}

// Notification preferences
export function getNotifPrefs(): { email: boolean; critical: boolean; high: boolean; medium: boolean } {
  const stored = localStorage.getItem(`${STORAGE_PREFIX}notif_prefs`);
  if (stored) return JSON.parse(stored);
  return { email: true, critical: true, high: true, medium: false };
}
export function setNotifPrefs(prefs: { email: boolean; critical: boolean; high: boolean; medium: boolean }) {
  localStorage.setItem(`${STORAGE_PREFIX}notif_prefs`, JSON.stringify(prefs));
}
