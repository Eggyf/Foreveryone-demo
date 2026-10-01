import { Link } from 'react-router-dom';
import heroAvatar from '../assets/hero-avatar.svg';
import { useTranslation } from '../i18n/useI18n';
import type { HeroData } from '../types';
import './HeroCard.css';

/**
 * Iconos y claves de nombre de las clases y las razas.
 *
 * El servidor devuelve el nombre del enum (`Warrior`, `Humano`), asi que aqui se
 * busca por esa clave en minusculas y se traduce. La tabla es de presentacion: el
 * balance de cada clase vive en el dominio y no se duplica.
 */
const HERO_CLASS_META: Record<string, { key: string; icon: string; specialtyKey: string }> = {
  warrior: { key: 'warrior', icon: '⚔️', specialtyKey: 'hero.specialty.warrior' },
  hunter: { key: 'hunter', icon: '🏹', specialtyKey: 'hero.specialty.hunter' },
  wizard: { key: 'wizard', icon: '🔮', specialtyKey: 'hero.specialty.wizard' },
  rogue: { key: 'rogue', icon: '🗡️', specialtyKey: 'hero.specialty.rogue' },
};

const RACE_META: Record<string, { key: string; icon: string }> = {
  humano: { key: 'humano', icon: '🧑' },
  elfo: { key: 'elfo', icon: '🧝' },
  enano: { key: 'enano', icon: '🧔' },
  orco: { key: 'orco', icon: '👹' },
};

interface HeroCardProps {
  hero: HeroData;
  displayName: string;
  isResting?: boolean;
  onRest: () => void;
}

export const HeroCard = ({
  hero,
  displayName,
  isResting = false,
  onRest,
}: HeroCardProps) => {
  const { t } = useTranslation();

  const safeDisplayName = displayName || t('hero.adventurer');

  const classMeta = HERO_CLASS_META[hero.class.toLowerCase()];
  const classLabel = t(`hero.class.${classMeta?.key ?? ''}`, {}) || t('hero.heroFallback');
  const classIcon = classMeta?.icon ?? '🛡️';
  const specialtyKey = classMeta?.specialtyKey ?? 'hero.specialty.fallback';

  const raceMeta = RACE_META[hero.race.toLowerCase()];
  const raceLabel = raceMeta ? t(`hero.race.${raceMeta.key}`, {}) : null;

  const healthPercentage = hero.health === 0
    ? 0
    : Math.min(100, Math.max(0, Math.round((hero.currentHealth / hero.health) * 100)));
  const isDefeated = hero.currentHealth === 0;
  const isFullyRested = hero.currentHealth === hero.health;
  const statusKey = isDefeated
    ? 'hero.statusDefeated'
    : isFullyRested
      ? 'hero.statusRested'
      : 'hero.statusReady';

  return (
    <section className="hero-profile-card">
      <div className="hero-profile-header">
        <div className="hero-avatar-frame">
          <img
            src={heroAvatar}
            alt={t('hero.portraitAlt', { name: safeDisplayName, class: classLabel })}
          />
          <span className="hero-level-badge">{t('hero.level', { level: hero.level })}</span>
        </div>

        <div className="hero-profile-copy">
          <span className="hero-eyebrow">{t('hero.cardLabel')}</span>
          <h2>{safeDisplayName}</h2>
          <div className="hero-badges">
            {raceLabel && (
              <span className="hero-class-badge">
                <span aria-hidden="true">{raceMeta?.icon}</span>
                {raceLabel}
              </span>
            )}
            <span className="hero-class-badge">
              <span aria-hidden="true">{classIcon}</span>
              {classLabel}
            </span>
          </div>
          <p>{t(specialtyKey)}</p>
          <span className={`hero-status ${isDefeated ? 'is-defeated' : ''}`}>
            <i aria-hidden="true" />
            {t(statusKey)}
          </span>
        </div>
      </div>

      <div className={`hero-health-panel ${isDefeated ? 'is-defeated' : ''}`}>
        <div className="hero-health-header">
          <span>❤️ {t('hero.health')}</span>
          <strong>{hero.currentHealth} / {hero.health}</strong>
        </div>
        <div
          className="hero-health-track"
          role="progressbar"
          aria-label={t('hero.healthLabel')}
          aria-valuemin={0}
          aria-valuemax={hero.health}
          aria-valuenow={hero.currentHealth}
        >
          <span style={{ width: `${healthPercentage}%` }} />
        </div>
      </div>

      <div className="hero-stats-grid" aria-label={t('hero.statsLabel')}>
        <div className="hero-stat">
          <span aria-hidden="true">💥</span>
          <div><small>{t('hero.attack')}</small><strong>{hero.attack}</strong></div>
        </div>
        <div className="hero-stat">
          <span aria-hidden="true">🛡️</span>
          <div><small>{t('hero.defense')}</small><strong>{hero.defense}</strong></div>
        </div>
        <div className="hero-stat">
          <span aria-hidden="true">🔮</span>
          <div><small>{t('hero.manaLabel')}</small><strong>{hero.mana}</strong></div>
        </div>
        <div className="hero-stat">
          <span aria-hidden="true">🪙</span>
          <div><small>{t('hero.gold')}</small><strong>{hero.gold}</strong></div>
        </div>
      </div>

      <div className="hero-actions">
        <button
          type="button"
          className="rest-btn"
          onClick={onRest}
          disabled={isFullyRested || isResting}
        >
          {isResting ? `🛏️ ${t('hero.resting')}` : `🛏️ ${t('hero.rest')}`}
        </button>
      </div>

      <Link className="shop-btn" to="/shop">
        🏪 {t('hero.visitShop')}
      </Link>
    </section>
  );
};

export const HeroLoadingCard = ({ displayName }: { displayName: string }) => {
  const { t } = useTranslation();

  return (
    <section className="hero-loading-card" aria-label={t('hero.loadingLabel')}>
      <div className="hero-loading-avatar">
        <img src={heroAvatar} alt="" />
      </div>
      <div className="hero-loading-copy">
        <span className="hero-loading-line hero-loading-line-short" />
        <strong>{displayName || t('hero.adventurer')}</strong>
        <span className="hero-loading-line" />
        <span className="hero-loading-line hero-loading-line-medium" />
      </div>
    </section>
  );
};