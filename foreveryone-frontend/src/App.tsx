import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './components/Auth';
import { GameLayout } from './components/GameLayout';
import { HeroPage } from './pages/HeroPage';
import { CastlePage } from './pages/CastlePage';
import { ShopPage } from './pages/ShopPage';
import './App.css';

const extractUserId = (token: string | null): string => {
  if (!token) return '';
  try {
    const decoded: any = jwtDecode(token);
    return decoded.sub || decoded.nameid || '';
  } catch {
    return '';
  }
};

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [userId, setUserId] = useState<string>(() => extractUserId(localStorage.getItem('token')));

  const handleAuthSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUserId(extractUserId(newToken));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserId('');
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
            <Route path="/" element={<GameLayout userId={userId} onLogout={handleLogout} />}>
              <Route index element={<Navigate to="/hero" replace />} />
              <Route path="hero" element={<HeroPage userId={userId} />} />
              <Route path="castle" element={<CastlePage userId={userId} />} />
              <Route path="shop" element={<ShopPage userId={userId} />} />
            </Route>
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;