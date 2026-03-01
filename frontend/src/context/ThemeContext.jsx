import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import { applyTheme, getStoredTheme, setStoredTheme } from '../utils/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Default is always LIGHT unless the user has explicitly chosen dark.
  // We intentionally do NOT follow system preference — light is the product default.
  const [theme, setThemeState] = useState(() => {
    const stored = getStoredTheme();
    return stored === 'dark' ? 'dark' : 'light';
  });

  // Apply theme class to <html> before the browser paints — eliminates flicker.
  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setStoredTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
