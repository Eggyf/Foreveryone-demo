import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import type { UserSession } from '../types';
import './GameLayout.css';

export const GameLayout = ({ user, onLogout }: { user: UserSession, onLogout: () => void }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="game-layout">
      <nav className="navbar">
        <NavLink to="/hero" className="nav-link">⚔️ Héroe</NavLink>
        <NavLink to="/castle" className="nav-link">🏰 Castillo</NavLink>
        <NavLink to="/shop" className="nav-link">🏪 Tienda</NavLink>
        <button className="logout-btn-nav" onClick={handleLogout}>Salir</button>
      </nav>
      
      <main className="page-content">
        {/* Outlet renderiza la página activa (HeroPage, CastlePage, etc.) */}
        <Outlet context={user} />
      </main>
    </div>
  );
};