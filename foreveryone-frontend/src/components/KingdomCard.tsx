import type { KingdomData } from '../types';

export const KingdomCard = ({ kingdom, onCreate }: { kingdom: KingdomData | null, onCreate: () => void }) => {
  if (!kingdom) {
    return (
      <div className="action-box">
        <p>Aún no tienes un reino.</p>
        <button onClick={onCreate}>Crear Reino</button>
      </div>
    );
  }

  return (
    <div className="stats-card">
      <h3>🏰 Reino (Castillo Nv.{kingdom.castleLevel})</h3>
      <div className="resources">
        <span>🪵 Madera: {kingdom.wood}</span>
        <span>🪨 Piedra: {kingdom.stone}</span>
        <span>🪙 Oro: {kingdom.gold}</span>
        <span>🍖 Comida: {kingdom.food}</span>
      </div>
      <h4>Edificios:</h4>
      <ul>
        {kingdom.buildings.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
};