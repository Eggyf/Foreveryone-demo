import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { I18nProvider } from './i18n/I18nProvider';
import { ThemeProvider } from './i18n/ThemeProvider';
import { applyInitialTheme } from './i18n/theme';

// El tema se aplica antes de montar React para que el primer pintado ya tenga los
// tokens correctos. Si se hiciera dentro del provider, el navegador pintaria
// primero el tema por defecto y el jugador veria un destello al recargar.
applyInitialTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);