import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import type { UserSession } from '../types';
import './GameLayout.css';

interface GameLayoutProps {
  user: UserSession;
  onLogout: () => void;
}

export const GameLayout = ({ user, onLogout }: GameLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="game-layout">
      <nav className="navbar" aria-label="Navegación principal">
        <NavLink to="/hero" className="nav-link">⚔️ Héroe</NavLink>
        <NavLink to="/castle" className="nav-link">🏰 Castillo</NavLink>
        <NavLink to="/shop" className="nav-link">🏪 Tienda</NavLink>
        <button type="button" className="logout-btn-nav" onClick={handleLogout}>Salir</button>
      </nav>

      <main className="page-content">
        {/* Outlet renderiza la página activa (HeroPage, CastlePage, etc.) y
            comparte la sesión con ella por contexto, sin props duplicadas. */}
        <Outlet context={user} />
      </main>
    </div>
  );
};
