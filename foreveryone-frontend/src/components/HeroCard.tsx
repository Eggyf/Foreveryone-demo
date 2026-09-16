import type { HeroData } from '../types';

export const HeroCard = ({ hero, onCreate }: { hero: HeroData | null, onCreate: () => void }) => {
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
      <p>Nivel: {hero.level}</p>
      <ul>
        <li>❤️ Vida: {hero.health}</li>
        <li>💥 Ataque: {hero.attack}</li>
        <li>🛡️ Defensa: {hero.defense}</li>
        <li>🔮 Maná: {hero.mana}</li>
      </ul>
    </div>
  );
};