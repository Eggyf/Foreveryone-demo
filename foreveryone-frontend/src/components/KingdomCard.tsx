import type { KingdomData } from '../types';
import { BuildingCard } from './BuildingCard';
import { BARRACKS_TYPE, BUILDABLE_BUILDINGS, CASTLE_TYPE, getBuildingDetails } from './buildings';
import './GameCard.css';
import './KingdomCard.css';

const TRAIN_OPTIONS = [
  { amount: 5, gold: 250, food: 125 },
  { amount: 10, gold: 500, food: 250 },
] as const;

interface KingdomCardProps {
  kingdom: KingdomData | null;
  isBusy: boolean;
  onCreate: () => void;
  onBuild: (type: number) => void;
  onUpgrade: (type: number) => void;
  onTrain: (amount: number) => void;
}

export const KingdomCard = ({
  kingdom,
  isBusy,
  onCreate,
  onBuild,
  onUpgrade,
  onTrain,
}: KingdomCardProps) => {
  if (!kingdom) {
    return (
      <div className="action-box">
        <p>Aún no tienes un reino.</p>
        <button type="button" onClick={onCreate} disabled={isBusy}>
          {isBusy ? 'Fundando tu reino…' : 'Crear Reino'}
        </button>
      </div>
    );
  }

  // El castillo ya existe desde la fundacion: la seccion de edificios muestra
  // solo lo que el jugador ha construido despues.
  const constructedBuildings = kingdom.buildings.filter((building) => building.type !== CASTLE_TYPE);
  const hasBarracks = constructedBuildings.some((building) => building.type === BARRACKS_TYPE);
  const builtTypes = new Set(constructedBuildings.map((building) => building.type));

  return (
    <div className="kingdom-view">
      <section className="castle-card" aria-labelledby="castle-title">
        <div className="castle-heading">
          <div className="castle-emblem" aria-hidden="true">🏰</div>
          <div>
            <span className="section-kicker">Tu fortaleza principal</span>
            <h3 id="castle-title">Castillo de Foreveryone</h3>
            <span className="castle-level">Nivel {kingdom.castleLevel}</span>
          </div>
        </div>

        <div className="resources" aria-label="Recursos del reino">
          <span>
            <span className="resource-icon" aria-hidden="true">🪵</span>
            <span className="resource-name">Madera</span>
            <strong>{kingdom.wood}</strong>
          </span>
          <span>
            <span className="resource-icon" aria-hidden="true">🪨</span>
            <span className="resource-name">Piedra</span>
            <strong>{kingdom.stone}</strong>
          </span>
          <span>
            <span className="resource-icon" aria-hidden="true">🪙</span>
            <span className="resource-name">Oro</span>
            <strong>{kingdom.gold}</strong>
          </span>
          <span>
            <span className="resource-icon" aria-hidden="true">🍖</span>
            <span className="resource-name">Comida</span>
            <strong>{kingdom.food}</strong>
          </span>
        </div>

        <div className="military-info">
          <span>⚔️ Ejército: {kingdom.armySize}</span>
          <span>🛡️ Poder: {kingdom.militaryPower}</span>
        </div>

        {hasBarracks && (
          <div className="army-actions">
            {TRAIN_OPTIONS.map(({ amount, gold, food }) => (
              <button
                type="button"
                key={amount}
                onClick={() => onTrain(amount)}
                disabled={isBusy}
              >
                Entrenar {amount} · {gold}🪙 {food}🍖
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="kingdom-section" aria-labelledby="buildings-title">
        <div className="section-header">
          <div>
            <span className="section-kicker">Estructuras del reino</span>
            <h3 id="buildings-title">Edificios</h3>
          </div>
          <span className="building-count">
            {constructedBuildings.length} {constructedBuildings.length === 1 ? 'construido' : 'construidos'}
          </span>
        </div>

        {constructedBuildings.length > 0 ? (
          <div className="building-grid">
            {constructedBuildings.map((building) => (
              <BuildingCard
                key={building.type}
                building={building}
                onUpgrade={onUpgrade}
                disabled={isBusy}
              />
            ))}
          </div>
        ) : (
          <div className="buildings-empty">
            <strong>Todavía no hay edificios</strong>
            Construye tu primer edificio usando las opciones de abajo.
          </div>
        )}
      </section>

      <section className="kingdom-section" aria-labelledby="construction-title">
        <div className="section-header">
          <div>
            <span className="section-kicker">Amplía tu reino</span>
            <h3 id="construction-title">Construir</h3>
          </div>
        </div>
        <div className="build-menu">
          {BUILDABLE_BUILDINGS.map((building) => (
            <button
              type="button"
              key={building.type}
              onClick={() => onBuild(building.type)}
              // Un tipo solo se construye una vez: el backend responde 400 si se
              // repite, asi que es mejor no ofrecerlo.
              disabled={isBusy || builtTypes.has(building.type)}
              title={building.description}
            >
              {building.icon} {building.label}
            </button>
          ))}
        </div>
        {!hasBarracks && (
          <p className="build-hint">
            Construye un {getBuildingDetails(BARRACKS_TYPE)?.label.toLowerCase()} para poder entrenar tropas.
          </p>
        )}
      </section>
    </div>
  );
};
