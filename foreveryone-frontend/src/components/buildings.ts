/**
 * Catalogo de edificios del reino.
 *
 * Vive en su propio archivo, y no junto a `BuildingCard`, porque lo consumen
 * tres modulos (la tarjeta, el menu de construccion y la pagina del castillo) y
 * `react-refresh` no admite que un archivo de componente exporte ademas
 * constantes sueltas.
 *
 * Los numeros son los valores de `BuildingType` del dominio de Kingdom.
 */

/** El castillo se crea al fundar el reino, asi que no se puede construir a mano. */
export const CASTLE_TYPE = 1;

export const BARRACKS_TYPE = 6;

export interface BuildingDetails {
    type: number;
    /** Nombre en castellano. El API devuelve el nombre del enum en ingles. */
    label: string;
    icon: string;
    description: string;
}

/**
 * Edificios construibles. Cantera y Mercado existenian en el dominio pero no
 * aparecian en el menu de construccion, asi que no se podian levantar.
 */
export const BUILDABLE_BUILDINGS: readonly BuildingDetails[] = [
    {
        type: 2,
        label: 'Granja',
        icon: '🌾',
        description: 'Genera comida de forma pasiva para alimentar al reino.',
    },
    {
        type: 3,
        label: 'Aserradero',
        icon: '🪚',
        description: 'Genera madera de forma pasiva para construir y mejorar.',
    },
    {
        type: 4,
        label: 'Cantera',
        icon: '⛏️',
        description: 'Genera piedra de forma pasiva para construir y mejorar.',
    },
    {
        type: 5,
        label: 'Mercado',
        icon: '🏪',
        description: 'Genera oro de forma pasiva para financiar el reino.',
    },
    {
        type: BARRACKS_TYPE,
        label: 'Cuartel',
        icon: '🛡️',
        description: 'Permite entrenar soldados para defender el reino.',
    },
];

export const getBuildingDetails = (type: number): BuildingDetails | null =>
    BUILDABLE_BUILDINGS.find((building) => building.type === type) ?? null;
