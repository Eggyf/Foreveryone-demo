import type { KingdomData } from '../types';
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

  const hasBarracks = kingdom.buildings.some(b => b.type === 6); // 6 = Barracks

  return (
    <div className="stats-card">
      <h3>🏰 Reino (Castillo Nv.{kingdom.castleLevel})</h3>
      <div className="resources">
        <span>🪵 Madera: {kingdom.wood}</span>
        <span>🪨 Piedra: {kingdom.stone}</span>
        <span>🪙 Oro: {kingdom.gold}</span>
        <span>🍖 Comida: {kingdom.food}</span>
      </div>
      
      {/* SECCIÓN MILITAR */}
      <div className="military-info">
        <span>⚔️ Ejército: {kingdom.armySize}</span>
        <span>🛡️ Poder: {kingdom.militaryPower}</span>
      </div>

      {hasBarracks && (
        <div className="army-actions">
          <button onClick={() => onTrain(5)}>Entrenar 5 Soldados (250🪙 125🍖)</button>
          <button onClick={() => onTrain(10)}>Entrenar 10 (500🪙 250🍖)</button>
        </div>
      )}

      <h4>Edificios:</h4>
      <ul>
        {kingdom.buildings.map((b, i) => (
          <li key={i} className="building-item">
            <span>{b.name} (Nivel {b.level})</span>
            <button className="upgrade-btn" onClick={() => onUpgrade(b.type)}>⬆️ Mejorar</button>
          </li>
        ))}
      </ul>

      <h4>Construir:</h4>
      <div className="build-menu">
        <button onClick={() => onBuild(2)}>🌾 Granja</button>
        <button onClick={() => onBuild(3)}>🪚 Aserradero</button>
        <button onClick={() => onBuild(6)}>🏰 Cuartel</button>
      </div>
    </div>
  );
};