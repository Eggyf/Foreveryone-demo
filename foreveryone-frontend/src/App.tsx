import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { decodeUserSession } from './auth/session';
import { Auth } from './components/Auth';
import { GameLayout } from './components/GameLayout';
import { HeroPage } from './pages/HeroPage';
import { CastlePage } from './pages/CastlePage';
import { ShopPage } from './pages/ShopPage';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => decodeUserSession(localStorage.getItem('token')));

  const handleAuthSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(decodeUserSession(newToken));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(decodeUserSession(null));
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <h1>ForEveryone</h1>
        <p>Bienvenido al reino de Eldoria</p>
        
        {!token ? (
          <Auth onSuccess={handleAuthSuccess} />
        ) : (
          <Routes>
            <Route path="/" element={<GameLayout user={user} onLogout={handleLogout} />}>
              <Route index element={<Navigate to="/hero" replace />} />
              <Route path="hero" element={<HeroPage />} />
              <Route path="castle" element={<CastlePage />} />
              <Route path="shop" element={<ShopPage />} />
            </Route>
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;