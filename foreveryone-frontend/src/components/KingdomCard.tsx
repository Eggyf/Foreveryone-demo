import { useTranslation } from '../i18n/useI18n';
import type { BuildingData, KingdomData } from '../types';
import { BuildingCard } from './BuildingCard';
import { BARRACKS_TYPE, CASTLE_TYPE, getBuildingDetails } from './buildings';
import './KingdomCard.css';

interface KingdomCardProps {
  kingdom: KingdomData | null;
  isBusy: boolean;
  onCreate: () => void;
  onBuild: (type: number) => void;
  onUpgrade: (type: number) => void;
  onTrain: (amount: number) => void;
}

/** Cantidades ofrecidas al entrenar. El coste por soldado lo fija el dominio. */
const TROOP_OPTIONS = [1, 5, 10] as const;

/** Tipos que aparecen en el menu de construccion, en el orden en que se pintan. */
const MENU_TYPES = [2, 3, 4, 5] as const;

export const KingdomCard = ({
  kingdom,
  isBusy,
  onCreate,
  onBuild,
  onUpgrade,
  onTrain,
}: KingdomCardProps) => {
  const { t } = useTranslation();

  if (!kingdom) {
    return (
      <div className="kingdom-empty">
        <span className="kingdom-empty-emblem" aria-hidden="true">♜</span>
        <p>{t('kingdom.notCreated')}</p>
        <button type="button" className="castle-action" onClick={onCreate} disabled={isBusy}>
          {isBusy ? t('kingdom.creating') : t('kingdom.create')}
        </button>
      </div>
    );
  }

  const built = new Map(kingdom.buildings.map((building) => [building.type, building.level]));
  const castleLevel = built.get(CASTLE_TYPE) ?? kingdom.castleLevel;
  const hasBarracks = built.has(BARRACKS_TYPE);
  const barracksLabel = t(getBuildingDetails(BARRACKS_TYPE)?.nameKey ?? 'building.barracks.name');

  const shownBuildings: BuildingData[] = kingdom.buildings.filter(
    (building) => building.type !== CASTLE_TYPE,
  );

  return (
    <div className="kingdom-view">
      <section className="castle-card">
        <header className="castle-heading">
          <span className="castle-emblem" aria-hidden="true">♜</span>
          <div className="castle-titles">
            <strong>{t('building.castle.name')}</strong>
            <small>{t('kingdom.level', { level: castleLevel })}</small>
          </div>
        </header>

        <dl className="castle-stats">
          <div>
            <dt>🪵</dt>
            <dd>{kingdom.wood}</dd>
            <span className="castle-stat-label">{t('kingdom.wood')}</span>
          </div>
          <div>
            <dt>🪨</dt>
            <dd>{kingdom.stone}</dd>
            <span className="castle-stat-label">{t('kingdom.stone')}</span>
          </div>
          <div>
            <dt>🪙</dt>
            <dd>{kingdom.gold}</dd>
            <span className="castle-stat-label">{t('hero.gold')}</span>
          </div>
          <div>
            <dt>🌾</dt>
            <dd>{kingdom.food}</dd>
            <span className="castle-stat-label">{t('kingdom.food')}</span>
          </div>
        </dl>

        <div className="castle-army">
          <span className="castle-army-label">{t('kingdom.armyLabel')}</span>
          <strong>⚔️ {kingdom.armySize}</strong>
          <small>{t('kingdom.militaryPower', { power: kingdom.militaryPower })}</small>
        </div>

        {shownBuildings.length === 0 ? (
          <p className="castle-empty">{t('kingdom.emptyTitle')}</p>
        ) : (
          <div className="castle-buildings">
            {shownBuildings.map((building) => (
              <BuildingCard key={building.type} building={building} />
            ))}
          </div>
        )}
      </section>

      <section className="kingdom-section">
        <span className="section-kicker">{t('kingdom.buildMenu')}</span>

        <div className="castle-actions">
          {MENU_TYPES.map((type) => {
            const details = getBuildingDetails(type);

            if (!details) return null;

            const level = built.get(type);

            return (
              <button
                key={type}
                type="button"
                className={level === undefined ? 'castle-action' : 'castle-action is-upgrade'}
                onClick={() => (level === undefined ? onBuild(type) : onUpgrade(type))}
                disabled={isBusy}
                title={t(details.descriptionKey)}
              >
                <span aria-hidden="true">{details.icon}</span>
                <span className="castle-action-name">
                  {level === undefined ? t(details.nameKey) : t('kingdom.upgrade', { level })}
                </span>
                <span className="castle-action-sub">
                  {level === undefined ? t('kingdom.build') : t(details.nameKey)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="kingdom-section">
        <span className="section-kicker">{t('kingdom.training')}</span>

        {!hasBarracks ? (
          <p className="castle-hint">{t('kingdom.needsBarracks', { barracks: barracksLabel })}</p>
        ) : (
          <div className="castle-actions">
            {TROOP_OPTIONS.map((amount) => (
              <button
                key={amount}
                type="button"
                className="castle-action is-train"
                onClick={() => onTrain(amount)}
                disabled={isBusy}
              >
                <span aria-hidden="true">⚔️</span>
                <span className="castle-action-name">{amount}</span>
                <span className="castle-action-sub">{t('kingdom.soldiers')}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};