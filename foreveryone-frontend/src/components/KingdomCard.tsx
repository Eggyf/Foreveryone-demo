import type { KingdomData } from '../types';
import { BuildingCard } from './BuildingCard';
import './GameCard.css';
import './KingdomCard.css';

export const KingdomCard = ({ kingdom, onCreate, onBuild, onUpgrade, onTrain }: { 
    kingdom: KingdomData | null, 
    onCreate: () => void,
    onBuild: (type: number) => void,
    onUpgrade: (type: number) => void,
    onTrain: (amount: number) => void
}) => {
  if (!kingdom) {
    return (
      <div className="action-box">
        <p>Aún no tienes un reino.</p>
        <button onClick={onCreate}>Crear Reino</button>
      </div>
    );
  }

  const constructedBuildings = kingdom.buildings.filter((building) => building.type !== 1);
  const hasBarracks = constructedBuildings.some((building) => building.type === 6);

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
            <button type="button" onClick={() => onTrain(5)}>
              Entrenar 5 · 250🪙 125🍖
            </button>
            <button type="button" onClick={() => onTrain(10)}>
              Entrenar 10 · 500🪙 250🍖
            </button>
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
                key={`${building.type}-${building.name}`}
                building={building}
                onUpgrade={onUpgrade}
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
          <button type="button" onClick={() => onBuild(2)}>🌾 Granja</button>
          <button type="button" onClick={() => onBuild(3)}>🪚 Aserradero</button>
          <button type="button" onClick={() => onBuild(6)}>🛡️ Cuartel</button>
        </div>
      </section>
    </div>
  );
};
