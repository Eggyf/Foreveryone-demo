/**
 * Catalogo de edificios del reino.
 *
 * Vive en su propio archivo, y no junto a `BuildingCard`, porque lo consumen
 * tres modulos (la tarjeta, el menu de construccion y la pagina del castillo) y
 * `react-refresh` no admite que un archivo de componente exporte ademas
 * constantes sueltas.
 *
 * Solo guarda las claves de traduccion y el icono. El texto lo compone el
 * cliente, asi que el mismo edificio se llama "Granja" o "Farm" segun el idioma
 * sin duplicar el catalogo.
 *
 * Los numeros son los valores de `BuildingType` del dominio de Kingdom.
 */

/** El castillo se crea al fundar el reino, asi que no se puede construir a mano. */
export const CASTLE_TYPE = 1;

export const BARRACKS_TYPE = 6;

export interface BuildingDetails {
    type: number;
    /** Clave del nombre, por ejemplo `building.farm.name`. */
    nameKey: string;
    icon: string;
    /** Clave de la descripcion, por ejemplo `building.farm.desc`. */
    descriptionKey: string;
}

/**
 * Edificios construibles. Cantera y Mercado existenian en el dominio pero no
 * aparecian en el menu de construccion, asi que no se podian levantar.
 */
export const BUILDABLE_BUILDINGS: readonly BuildingDetails[] = [
    {
        type: 2,
        nameKey: 'building.farm.name',
        icon: '🌾',
        descriptionKey: 'building.farm.desc',
    },
    {
        type: 3,
        nameKey: 'building.sawmill.name',
        icon: '🪚',
        descriptionKey: 'building.sawmill.desc',
    },
    {
        type: 4,
        nameKey: 'building.quarry.name',
        icon: '⛏️',
        descriptionKey: 'building.quarry.desc',
    },
    {
        type: 5,
        nameKey: 'building.market.name',
        icon: '🏪',
        descriptionKey: 'building.market.desc',
    },
    {
        type: BARRACKS_TYPE,
        nameKey: 'building.barracks.name',
        icon: '🛡️',
        descriptionKey: 'building.barracks.desc',
    },
];

/**
 * Descripcion de reserva para un edificio construido que no este en el
 * catalogo. Se mantiene como clave porque sigue siendo texto del cliente.
 */
export const UNKNOWN_BUILDING_NAME_KEY = 'building.fallback';
export const UNKNOWN_BUILDING_DESC_KEY = 'building.fallbackDesc';

export const getBuildingDetails = (type: number): BuildingDetails | null =>
    BUILDABLE_BUILDINGS.find((building) => building.type === type) ?? null;