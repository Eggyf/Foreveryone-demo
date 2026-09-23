import type { BuildingData } from '../types';
import './BuildingCard.css';

const BUILDING_DETAILS: Record<number, { icon: string; description: string }> = {
  2: {
    icon: '🌾',
    description: 'Genera comida de forma pasiva para alimentar al reino.',
  },
  3: {
    icon: '🪚',
    description: 'Genera madera de forma pasiva para construir y mejorar.',
  },
  4: {
    icon: '⛏️',
    description: 'Genera piedra de forma pasiva para construir y mejorar.',
  },
  5: {
    icon: '🏪',
    description: 'Genera oro de forma pasiva para financiar el reino.',
  },
  6: {
    icon: '🛡️',
    description: 'Permite entrenar soldados para defender el reino.',
  },
};

export const BuildingCard = ({
  building,
  onUpgrade,
}: {
  building: BuildingData;
  onUpgrade: (type: number) => void;
}) => {
  const details = BUILDING_DETAILS[building.type] ?? {
    icon: '🏛️',
    description: 'Edificio construido para el funcionamiento del reino.',
  };

  return (
    <article className="building-card">
      <div className="building-icon" aria-hidden="true">
        {details.icon}
      </div>
      <h4>{building.name}</h4>
      <p>{details.description}</p>
      <div className="building-card-footer">
        <span className="building-level">Nivel {building.level}</span>
        <button
          type="button"
          className="upgrade-btn"
          onClick={() => onUpgrade(building.type)}
          aria-label={`Mejorar ${building.name} al nivel ${building.level + 1}`}
        >
          ⬆️ Mejorar
        </button>
      </div>
    </article>
  );
};
