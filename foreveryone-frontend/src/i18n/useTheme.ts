import { useContext } from 'react';
import { ThemeContext } from './context';

/**
 * Acceso al tema activo. Vive aparte de `ThemeProvider.tsx` por la misma razón
 * que `useI18n`: `react-refresh` exige que un archivo de componente exporte solo
 * componentes.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>.');
  }

  return context;
};