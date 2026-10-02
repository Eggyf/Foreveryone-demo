import type { CSSProperties } from 'react';
import { useTranslation } from '../i18n/useI18n';
import type { ZoneOption } from '../types';
import './WorldMap.css';

/**
 * El mapa es la ilustracion del reino, no un simple selector: por eso las tres
 * zonas son siluetas distintas unidas por un camino, en vez de tres rectangulos
 * iguales. Cada silueta se dibuja alrededor del origen y se traslada al centro de
 * su casilla, de modo que el mismo trazo sirve para cualquier posicion.
 *
 * Anadir una cuarta zona al dominio implica dibujar aqui su silueta; mientras no
 * exista, cae en `FALLBACK_SHAPE` y su boton sigue apareciendo en la rejilla.
 */
const FALLBACK_SHAPE =
  'M -75 -20 C -105 -55, -78 -100, -20 -105 C 42 -110, 88 -80, 85 -35 ' +
  'C 82 12, 38 40, -14 35 C -48 31, -58 -3, -75 -20 Z';

const ZONE_SHAPES: Record<string, string> = {
  // Copa de arbol: contorno organico con lóbulos desiguales, para que no se lea
  // como un círculo.
  forest:
    'M -95 26 C -108 -18, -74 -62, -34 -60 C -8 -88, 44 -84, 66 -56 ' +
    'C 108 -50, 126 -8, 104 24 C 116 62, 74 92, 34 80 C -4 100, -52 84, -60 52 ' +
    'C -92 56, -108 42, -95 26 Z',
  // Techo de cueva: angulos afilados.
  caverns:
    'M -70 59 L -84 2 L -53 -22 L -71 -48 L -18 -60 L 23 -76 L 70 -57 ' +
    'L 94 -26 L 79 10 L 93 41 L 50 65 L -4 73 L -50 71 Z',
  // Columnas rotas: bloque mellado.
  ruins:
    'M -88 20 L -82 -27 L -45 -37 L -33 -65 L 18 -71 L 32 -43 L 72 -45 ' +
    'L 90 -13 L 76 23 L 94 45 L 44 65 L -18 69 L -62 55 Z',
};

/**
 * El acento vive en `App.css` porque el tema claro redefine sus propias variables.
 * Aqui solo se decide cual usar, con un dorado de reserva para que una zona
 * inesperada no quede invisible.
 */
const ZONE_ACCENTS: Record<string, string> = {
  forest: 'var(--zone-forest)',
  caverns: 'var(--zone-caverns)',
  ruins: 'var(--zone-ruins)',
};

const VIEWBOX = { width: 720, height: 330 };

const accentOf = (zoneKey: string) => ZONE_ACCENTS[zoneKey] ?? 'var(--gold)';

/** Centro de cada columna, en porcentajes del lienzo. */
const SLOTS = [
  { left: 19, top: 50 },
  { left: 51, top: 36 },
  { left: 80, top: 60 },
];

/**
 * Coordenadas y acento de cada zona, ya resueltos. Se calculan una vez y se
 * reparten entre el SVG y el botón, que de otro modo repetirían el mapeo.
 */
interface ZoneSlot {
  left: string;
  top: string;
  accent: string;
  centerX: number;
  centerY: number;
}

const slotOf = (zone: ZoneOption, index: number): ZoneSlot => {
  const slot = SLOTS[index % SLOTS.length];

  return {
    left: `${slot.left}%`,
    top: `${slot.top}%`,
    accent: accentOf(zone.key),
    centerX: (slot.left / 100) * VIEWBOX.width,
    centerY: (slot.top / 100) * VIEWBOX.height,
  };
};

/**
 * Las siluetas se dibujan pequeñas y se agrandan aquí, para poder retocarlas sin
 * tener que reescribir los números. A este tamaño la tierra domina el lienzo y las
 * etiquetas caben dentro como marcadores, no como etiquetas sueltas encima.
 */
const LAND_SCALE = 1.26;

interface WorldMapProps {
  zones: ZoneOption[];
  selectedKey: string | null;
  onSelect: (zoneKey: string) => void;
}

export const WorldMap = ({ zones, selectedKey, onSelect }: WorldMapProps) => {
  const { t } = useTranslation();

  return (
    <div className="world-map">
      {/* El SVG es decorativo y no captura el raton: los botones de abajo llevan
          el nombre, el nivel y todo el teclado, asi que aqui no se duplica nada. */}
      <svg
        className="world-map-art"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="world-map-route"
          d="M 137 165 C 218 128, 292 108, 367 119 C 452 131, 522 183, 576 198"
        />
        {zones.map((zone, index) => {
          const slot = slotOf(zone, index);

          return (
            <path
              key={zone.key}
              className="world-map-land"
              style={{ '--zone-accent': slot.accent } as CSSProperties}
              data-selected={zone.key === selectedKey ? 'true' : undefined}
              d={ZONE_SHAPES[zone.key] ?? FALLBACK_SHAPE}
              transform={`translate(${slot.centerX} ${slot.centerY}) scale(${LAND_SCALE})`}
            />
          );
        })}
      </svg>

      <ul className="world-map-zones">
        {zones.map((zone, index) => {
          const slot = slotOf(zone, index);

          return (
            // El acento va en la casilla y las coordenadas tambien: es el elemento
            // posicionado, y el boton lo hereda sin repetir el mapeo.
            <li
              key={zone.key}
              className="world-map-slot"
              style={
                {
                  left: slot.left,
                  top: slot.top,
                  '--zone-accent': slot.accent,
                } as CSSProperties
              }
            >
              <button
                type="button"
                className="world-map-zone"
                aria-pressed={zone.key === selectedKey}
                onClick={() => onSelect(zone.key)}
              >
                <strong>{t(zone.nameKey)}</strong>
                <small>{t('map.recommendedLevel', { level: zone.recommendedLevel })}</small>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};