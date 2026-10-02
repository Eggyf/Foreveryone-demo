import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/useI18n';
import type { UserSession } from '../types';
import './GameLayout.css';

interface GameLayoutProps {
  user: UserSession;
  onLogout: () => void;
}

export const GameLayout = ({ user, onLogout }: GameLayoutProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="game-layout">
      <nav className="navbar" aria-label={t('nav.label')}>
        <NavLink to="/hero" className="nav-link">⚔️ {t('nav.hero')}</NavLink>
        <NavLink to="/map" className="nav-link">🗺️ {t('nav.map')}</NavLink>
        <NavLink to="/castle" className="nav-link">🏰 {t('nav.castle')}</NavLink>
        <NavLink to="/shop" className="nav-link">🏪 {t('nav.shop')}</NavLink>
        <button type="button" className="logout-btn-nav" onClick={handleLogout}>
          {t('nav.logout')}
        </button>
      </nav>

      <main className="page-content">
        {/* Outlet renderiza la página activa (HeroPage, CastlePage, etc.) y
            comparte la sesión con ella por contexto, sin props duplicadas. */}
        <Outlet context={user} />
      </main>
    </div>
  );
};