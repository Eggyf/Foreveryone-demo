import { useTranslation } from '../i18n/useI18n';
import type { BuildingData } from '../types';
import {
  UNKNOWN_BUILDING_DESC_KEY,
  UNKNOWN_BUILDING_NAME_KEY,
  getBuildingDetails,
} from './buildings';

interface BuildingCardProps {
  building: BuildingData;
}

/**
 * Tarjeta de un edificio ya construido.
 *
 * El nombre legible sale del catalogo (`buildings.ts`) por tipo, no del `name` que
 * devuelve el API: aquel es el nombre del enum en ingles y aqui solo haria falta
 * para cuando el servidor crecen con un tipo que el catalogo todavia no conoce.
 */
export const BuildingCard = ({ building }: BuildingCardProps) => {
  const { t } = useTranslation();
  const details = getBuildingDetails(building.type);

  const nameKey = details?.nameKey ?? UNKNOWN_BUILDING_NAME_KEY;
  const descriptionKey = details?.descriptionKey ?? UNKNOWN_BUILDING_DESC_KEY;
  const icon = details?.icon ?? '🏛️';

  return (
    <article className="building-card" title={t(descriptionKey)}>
      <span className="building-icon" aria-hidden="true">{icon}</span>
      <div className="building-copy">
        <strong>{t(nameKey)}</strong>
        <small>Nv. {building.level}</small>
      </div>
    </article>
  );
};