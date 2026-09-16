import type { KingdomData } from '../types';

export const KingdomCard = ({ kingdom, onCreate, onBuild }: { 
    kingdom: KingdomData | null, 
    onCreate: () => void,
    onBuild: (type: number) => void 
}) => {
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
      
      <h4>Edificios Actuales:</h4>
      <ul>
        {kingdom.buildings.map((b, i) => <li key={i}>{b}</li>)}
      </ul>

      <h4>Menú de Construcción:</h4>
      <div className="build-menu">
        <button onClick={() => onBuild(2)} title="Costo: 200🪵 100🪨 50🪙">
          🌾 Construir Granja
        </button>
        <button onClick={() => onBuild(3)} title="Costo: 100🪵 200🪨 50🪙">
          🪚 Construir Aserradero
        </button>
        <button onClick={() => onBuild(4)} title="Costo: 200🪵 100🪨 50🪙">
          ⛏️ Construir Cantera
        </button>
      </div>
    </div>
  );
};