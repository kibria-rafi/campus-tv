const STORAGE_KEY = 'theme';

/** Read persisted user preference (or null if never set). */
export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY); // "dark" | "light" | null
  } catch {
    return null;
  }
}

/** Detect OS / browser preference. */
export function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Apply a theme by toggling the `dark` class on <html>.
 * This is the single place that touches the DOM.
 */
export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

/** Persist the user's explicit choice. */
export function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // private-browsing / storage full — silently ignore
  }
}
