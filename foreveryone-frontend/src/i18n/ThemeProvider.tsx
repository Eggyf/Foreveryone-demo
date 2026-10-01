import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { applyTheme, readTheme, writeTheme, type Theme } from './theme';
import { ThemeContext } from './context';
import type { ThemeContextValue } from './context';

/**
 * Provee el tema activo. El hook vive en `useTheme.ts` por la misma razón que el
 * de i18n: `react-refresh` exige que un archivo de componente exporte solo
 * componentes.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  const setTheme = useCallback((next: Theme) => {
    writeTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    [theme, setTheme],
  );

  applyTheme(theme);

  // Sigue al sistema mientras el jugador no haya elegido. Si ya eligio, su
  // preferencia manda sobre cualquier cambio posterior del sistema operativo.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const query = window.matchMedia('(prefers-color-scheme: light)');

    const onChange = (event: MediaQueryListEvent) => {
      // `writeTheme` solo se llama desde `setTheme`, asi que la clave presente en
      // `localStorage` significa que el jugador eligio explicitamente.
      if (localStorage.getItem('foreveryone:theme')) return;

      const next: Theme = event.matches ? 'light' : 'dark';

      setThemeState(next);
      applyTheme(next);
    };

    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};