import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { decodeUserSession, isTokenExpired } from './auth/session';
import { clearToken, readToken, writeToken } from './auth/token';
import { Auth } from './components/Auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GameGate } from './components/GameGate';
import { GameLayout } from './components/GameLayout';
import { SettingsBar } from './components/SettingsBar';
import { HeroPage } from './pages/HeroPage';
import { MapPage } from './pages/MapPage';
import { CastlePage } from './pages/CastlePage';
import { ShopPage } from './pages/ShopPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useTranslation } from './i18n/useI18n';
import './App.css';

/** Un token caducado se descarta al arrancar en vez de dejar el juego a medias. */
const initialToken = (): string | null => {
  const stored = readToken();
  return isTokenExpired(stored) ? null : stored;
};

function App() {
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState(() => decodeUserSession(initialToken()));
  const { t } = useTranslation();

  const handleAuthSuccess = (newToken: string) => {
    writeToken(newToken);
    setToken(newToken);
    setUser(decodeUserSession(newToken));
  };

  const handleLogout = () => {
    clearToken();
    setToken(null);
    setUser(decodeUserSession(null));
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <SettingsBar />
        <h1>Foreveryone</h1>
        {!token && <p>{t('app.welcome')}</p>}

        <ErrorBoundary onSessionExpired={handleLogout}>
          {!token ? (
            <Auth onSuccess={handleAuthSuccess} />
          ) : (
            <GameGate user={user} onSessionExpired={handleLogout}>
              <Routes>
                <Route path="/" element={<GameLayout user={user} onLogout={handleLogout} />}>
                  <Route index element={<Navigate to="/hero" replace />} />
                  <Route path="hero" element={<HeroPage />} />
                  <Route path="map" element={<MapPage />} />
                  <Route path="castle" element={<CastlePage />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </GameGate>
          )}
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default App;