export type ThemeMode = 'default' | 'high-contrast';

const STORAGE_KEY = 'app_theme_mode';
const TOKENS_KEY = 'app_theme_tokens';

export function applyThemeMode(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem(STORAGE_KEY, mode);
}

export function getStoredThemeMode(): ThemeMode {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === 'high-contrast' ? 'high-contrast' : 'default';
}

export function applyCustomThemeTokens(tokens: Record<string, string>) {
  Object.entries(tokens).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function loadTheme() {
  const mode = getStoredThemeMode();
  applyThemeMode(mode);

  const raw = localStorage.getItem(TOKENS_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    applyCustomThemeTokens(parsed);
  } catch {
    localStorage.removeItem(TOKENS_KEY);
  }
}
