import type { BuildingData } from '../types';
import { getBuildingDetails } from './buildings';
import './BuildingCard.css';

interface BuildingCardProps {
    building: BuildingData;
    onUpgrade: (type: number) => void;
    disabled?: boolean;
}

export const BuildingCard = ({ building, onUpgrade, disabled = false }: BuildingCardProps) => {
    const details = getBuildingDetails(building.type);
    // El API devuelve el nombre del enum en ingles; el castellano sale del
    // catalogo. Para un tipo desconocido se conserva el nombre recibido.
    const icon = details?.icon ?? '🏛️';
    const name = details?.label ?? building.name;
    const description =
        details?.description ?? 'Edificio construido para el funcionamiento del reino.';

    return (
        <article className="building-card">
            <div className="building-icon" aria-hidden="true">
                {icon}
            </div>
            <h4>{name}</h4>
            <p>{description}</p>
            <div className="building-card-footer">
                <span className="building-level">Nivel {building.level}</span>
                <button
                    type="button"
                    className="upgrade-btn"
                    onClick={() => onUpgrade(building.type)}
                    disabled={disabled}
                    aria-label={`Mejorar ${name} al nivel ${building.level + 1}`}
                >
                    ⬆️ Mejorar
                </button>
            </div>
        </article>
    );
};
