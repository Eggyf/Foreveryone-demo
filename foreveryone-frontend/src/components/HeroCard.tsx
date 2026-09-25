import { Link } from 'react-router-dom';
import heroAvatar from '../assets/hero-avatar.svg';
import type { HeroData } from '../types';
import './HeroCard.css';

const HERO_CLASS_DETAILS: Record<string, { label: string; icon: string; specialty: string }> = {
  warrior: {
    label: 'Guerrero',
    icon: '⚔️',
    specialty: 'Especialista en combate cuerpo a cuerpo.',
  },
  hunter: {
    label: 'Cazador',
    icon: '🏹',
    specialty: 'Experto en ataques a distancia.',
  },
  wizard: {
    label: 'Mago',
    icon: '🔮',
    specialty: 'Maestro de magia y poder arcano.',
  },
  rogue: {
    label: 'Pícaro',
    icon: '🗡️',
    specialty: 'Acero veloz y golpes certeros.',
  },
};

const RACE_DETAILS: Record<string, { label: string; icon: string }> = {
  humano: { label: 'Humano', icon: '🧑' },
  elfo: { label: 'Elfo', icon: '🧝' },
  enano: { label: 'Enano', icon: '🧔' },
  orco: { label: 'Orco', icon: '👹' },
};

interface HeroCardProps {
  hero: HeroData;
  displayName: string;
  onAdventure: () => void;
  onRest: () => void;
}

const getClassDetails = (heroClass: string) =>
  HERO_CLASS_DETAILS[heroClass.toLowerCase()] ?? {
    label: heroClass || 'Héroe',
    icon: '🛡️',
    specialty: 'Aventurero en servicio del reino.',
  };

const getRaceDetails = (race: string) => RACE_DETAILS[race.toLowerCase()] ?? null;

export const HeroCard = ({
  hero,
  displayName,
  onAdventure,
  onRest,
}: HeroCardProps) => {
  const safeDisplayName = displayName || 'Aventurero';

  const classDetails = getClassDetails(hero.class);
  const raceDetails = getRaceDetails(hero.race);
  const healthPercentage = hero.health === 0
    ? 0
    : Math.min(100, Math.max(0, Math.round((hero.currentHealth / hero.health) * 100)));
  const isDefeated = hero.currentHealth === 0;
  const isFullyRested = hero.currentHealth === hero.health;
  const statusLabel = isDefeated ? 'Derrotado' : isFullyRested ? 'Descansado' : 'Listo para aventurearse';

  return (
    <section className="hero-profile-card">
      <div className="hero-profile-header">
        <div className="hero-avatar-frame">
          <img src={heroAvatar} alt={`Retrato de ${safeDisplayName}, ${classDetails.label}`} />
          <span className="hero-level-badge">Nv. {hero.level}</span>
        </div>

        <div className="hero-profile-copy">
          <span className="hero-eyebrow">Héroe de Foreveryone</span>
          <h2>{safeDisplayName}</h2>
          <div className="hero-badges">
            {raceDetails && (
              <span className="hero-class-badge">
                <span aria-hidden="true">{raceDetails.icon}</span>
                {raceDetails.label}
              </span>
            )}
            <span className="hero-class-badge">
              <span aria-hidden="true">{classDetails.icon}</span>
              {classDetails.label}
            </span>
          </div>
          <p>{classDetails.specialty}</p>
          <span className={`hero-status ${isDefeated ? 'is-defeated' : ''}`}>
            <i aria-hidden="true" />
            {statusLabel}
          </span>
        </div>
      </div>

      <div className={`hero-health-panel ${isDefeated ? 'is-defeated' : ''}`}>
        <div className="hero-health-header">
          <span>❤️ Vida</span>
          <strong>{hero.currentHealth} / {hero.health}</strong>
        </div>
        <div
          className="hero-health-track"
          role="progressbar"
          aria-label="Vida del héroe"
          aria-valuemin={0}
          aria-valuemax={hero.health}
          aria-valuenow={hero.currentHealth}
        >
          <span style={{ width: `${healthPercentage}%` }} />
        </div>
      </div>

      <div className="hero-stats-grid" aria-label="Estadísticas del héroe">
        <div className="hero-stat">
          <span aria-hidden="true">💥</span>
          <div><small>Ataque</small><strong>{hero.attack}</strong></div>
        </div>
        <div className="hero-stat">
          <span aria-hidden="true">🛡️</span>
          <div><small>Defensa</small><strong>{hero.defense}</strong></div>
        </div>
        <div className="hero-stat">
          <span aria-hidden="true">🔮</span>
          <div><small>Maná</small><strong>{hero.mana}</strong></div>
        </div>
        <div className="hero-stat">
          <span aria-hidden="true">🪙</span>
          <div><small>Oro</small><strong>{hero.gold}</strong></div>
        </div>
      </div>

      <div className="hero-actions">
        <button
          type="button"
          className="adventure-btn"
          onClick={onAdventure}
          disabled={isDefeated}
        >
          🗡️ Aventura
        </button>
        <button
          type="button"
          className="rest-btn"
          onClick={onRest}
          disabled={isFullyRested}
        >
          🛏️ Descansar
        </button>
      </div>

      <Link className="shop-btn" to="/shop">
        🏪 Visitar la tienda
      </Link>
    </section>
  );
};

export const HeroLoadingCard = ({ displayName }: { displayName: string }) => (
  <section className="hero-loading-card" aria-label="Cargando información del héroe">
    <div className="hero-loading-avatar">
      <img src={heroAvatar} alt="" />
    </div>
    <div className="hero-loading-copy">
      <span className="hero-loading-line hero-loading-line-short" />
      <strong>{displayName || 'Aventurero'}</strong>
      <span className="hero-loading-line" />
      <span className="hero-loading-line hero-loading-line-medium" />
    </div>
  </section>
);
