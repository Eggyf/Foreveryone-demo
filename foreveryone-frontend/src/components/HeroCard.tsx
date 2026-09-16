import type { HeroData } from '../types';

export const HeroCard = ({ hero, onCreate, onAdventure, onRest }: { 
    hero: HeroData | null, 
    onCreate: () => void,
    onAdventure: () => void,
    onRest: () => void
}) => {
  if (!hero) {
    return (
      <div className="action-box">
        <p>Aún no tienes un héroe.</p>
        <button onClick={onCreate}>Crear Héroe (Warrior)</button>
      </div>
    );
  }

  return (
    <div className="stats-card">
      <h3>⚔️ Héroe: {hero.class}</h3>
      <p>🧡 Nivel: {hero.level}</p>
      <ul>
        <li style={{ color: hero.currentHealth > 0 ? '#e74c3c' : '#888' }}>
          ❤️ Vida: {hero.currentHealth} / {hero.health} {hero.currentHealth === 0 && ' (DERROTADO)'}
        </li>
        <li>💥 Ataque: {hero.attack}</li>
        <li>🛡️ Defensa: {hero.defense}</li>
        <li>🔮 Maná: {hero.mana}</li>
      </ul>
      
      <div className="hero-actions">
        <button 
            className="adventure-btn" 
            onClick={onAdventure}
            disabled={hero.currentHealth === 0} // No puede aventurarse si está muerto
        >
          🗡️ Ir a la Aventura
        </button>
        <button 
            className="rest-btn" 
            onClick={onRest}
            disabled={hero.currentHealth === hero.health} // No puede descansar si está full
        >
          🛏️ Descansar
        </button>
      </div>
    </div>
  );
};