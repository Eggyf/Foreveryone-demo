/**
 * Set de iconos de la aplicacion.
 *
 * Antes de esto la navegacion y varias acciones usaban emoji. Un emoji no es un
 * sistema de iconos: cambia de forma entre plataformas, ignora el color del
 * tema y no comparte trazo con nada. Aqui todos los iconos se dibujan con el
 * mismo grosor de linea, la misma caja de 24 y las mismas terminaciones, que es
 * lo que hace que un set se lea como uno.
 *
 * Cada glifo es geometria exacta —rectas y curvas—, no una ilustracion.
 */

export type IconName =
  | 'hero'
  | 'map'
  | 'castle'
  | 'shop'
  | 'rest'
  | 'logout'
  | 'compass'
  | 'coin'
  | 'swords'
  | 'plus'
  | 'health'
  | 'attack'
  | 'defense'
  | 'mana'
  | 'wood'
  | 'stone'
  | 'grain'
  // Razas y clases: se eligen en la creación del personaje.
  | 'raceHuman'
  | 'raceElf'
  | 'raceDwarf'
  | 'raceOrc'
  | 'classWarrior'
  | 'classHunter'
  | 'classWizard'
  | 'classRogue'
  // Edificios del reino.
  | 'buildingFarm'
  | 'buildingLumber'
  | 'buildingQuarry'
  | 'buildingMarket'
  | 'buildingBarracks'
  | 'buildingCastle'
  // Bestias por zona.
  | 'enemyGoblin'
  | 'enemySpider'
  | 'enemyTreant'
  | 'enemyBat'
  | 'enemySlime'
  | 'enemyTroll'
  | 'enemySkeleton'
  | 'enemyWraith'
  | 'enemyGolem';

const paths: Record<IconName, React.ReactNode> = {
  // Espada y escudo cruzados: la hoja del heroe.
  hero: (
    <>
      <path d="M4 20 20 4" />
      <path d="M14 4h6v6" />
      <path d="M20 4 12 12" />
      <path d="M4 16v4h4" />
    </>
  ),
  // Plano cuadriculado: la retícula del mundo.
  map: (
    <>
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </>
  ),
  // Almenas: el castillo.
  castle: (
    <>
      <path d="M4 21V7h16v14" />
      <path d="M4 7V3h4v4h3V3h2v4h3V3h4v4" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  // Marquesina: la tienda.
  shop: (
    <>
      <path d="M4 9h16l-1.5 11h-13z" />
      <path d="M3 9l2-5h14l2 5" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  // Cama: descansar.
  rest: (
    <>
      <path d="M3 19v-9M3 14h18v5" />
      <path d="M21 19v-6a3 3 0 0 0-3-3H3" />
      <path d="M7 10.5h4" />
    </>
  ),
  // Salida del portal.
  logout: (
    <>
      <path d="M14 4h5v16h-5" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h9" />
    </>
  ),
  // Rosa de los vientos.
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  // Moneda.
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h5M9.5 14.5h5" />
    </>
  ),
  // Dos hojas: entrar en combate.
  swords: (
    <>
      <path d="M4 4 14 14M4 4v4M4 4h4" />
      <path d="m20 4-6 6" />
      <path d="M20 4v4M20 4h-4" />
      <path d="M14 20 4 10" />
    </>
  ),
  // Mas: construir.
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  // Vitales. Los cuatro se distinguen solo por la silueta, que es como se
  // escanean: el color solo refuerza.
  health: (
    <>
      <path d="M12 20 4.5 12.5a4.6 4.6 0 0 1 6.5-6.5l1 1 1-1a4.6 4.6 0 0 1 6.5 6.5z" />
    </>
  ),
  attack: (
    <>
      <path d="m4 20 8-8" />
      <path d="m17 3 4 4-3 3-4-4z" />
      <path d="M13 8 8 13" />
    </>
  ),
  defense: (
    <>
      <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6z" />
    </>
  ),
  mana: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  ),
  // Recursos del reino.
  wood: (
    <>
      <path d="M5 8h14M5 12h14M5 16h14" />
      <path d="M5 5v14M19 5v14" />
    </>
  ),
  stone: (
    <>
      <path d="M4 15.5 9 7h6l5 8.5-3 3.5H7z" />
      <path d="M9 7v12M15 7v12" />
    </>
  ),
  grain: (
    <>
      <path d="M12 21V9" />
      <path d="M12 9c0-3 1.5-5 4-5 0 3-1.5 5-4 5zM12 9c0-3-1.5-5-4-5 0 3 1.5 5 4 5z" />
      <path d="M12 15c0-2.4 1.2-4 3.2-4 0 2.4-1.2 4-3.2 4zM12 15c0-2.4-1.2-4-3.2-4 0 2.4 1.2 4 3.2 4z" />
    </>
  ),

  // --- Razas y clases ---------------------------------------------------
  // Siluetas geométricas, no retratos: al tamaño al que se ven (14-18px dentro
  // de una celda) un detalle más solo produciría ruido.
  raceHuman: (
    <>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </>
  ),
  raceElf: (
    <>
      <path d="M8 4 5 10l4-1" />
      <path d="m16 4 3 6-4-1" />
      <circle cx="12" cy="8" r="3" />
      <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
    </>
  ),
  raceDwarf: (
    <>
      <path d="M4 9h16l-1 11H5z" />
      <path d="M8 9V6h8v3" />
      <path d="M9.5 14h5" />
    </>
  ),
  raceOrc: (
    <>
      <path d="M4 8 6 4M20 8l-2-4" />
      <circle cx="12" cy="9" r="4" />
      <path d="M9 20v-1a6 6 0 0 1 6 0v1" />
    </>
  ),
  classWarrior: (
    <>
      <path d="M4 4 14 14M4 4v4M4 4h4" />
      <path d="M14 4h6v6" />
    </>
  ),
  classHunter: (
    <>
      <path d="M4 20 20 4" />
      <path d="M20 4c-5 0-9 3-11 7" />
      <path d="M14 14 20 20" />
    </>
  ),
  classWizard: (
    <>
      <path d="M12 3 5 21h14z" />
      <path d="M12 9v6M9 12h6" />
    </>
  ),
  classRogue: (
    <>
      <path d="m8 14 6-6" />
      <path d="m9 3 6 6-2 2-6-6z" />
      <path d="M4 20h9" />
    </>
  ),

  // --- Edificios del reino ------------------------------------------------
  buildingFarm: (
    <>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 11v9h14v-9" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  buildingLumber: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <path d="M7 4v16M17 4v16" />
    </>
  ),
  buildingQuarry: (
    <>
      <path d="m3 19 6-9 4 5 3-4 5 8z" />
      <path d="m9 10 2 4" />
    </>
  ),
  buildingMarket: (
    <>
      <path d="M4 9h16l-1 11H5z" />
      <path d="M3 9l2-5h14l2 5" />
    </>
  ),
  buildingBarracks: (
    <>
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M5 11h14" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  // El castillo del reino: el mismo perfil que la almenas de la navegacion,
  // aqui a escala de insignia.
  buildingCastle: (
    <>
      <path d="M3 21V7h18v14" />
      <path d="M3 7V3h5v4h8V3h5v4" />
      <path d="M10 21v-6h4v6" />
    </>
  ),

  // --- Enemigos ------------------------------------------------------------
  // Cada criatura es una silueta reconocible a su tamaño: lo que distingue a
  // un golem de un esqueleto tiene que verse sin color ni detalle.
  enemyGoblin: (
    <>
      <path d="M5 5l3 2M19 5l-3 2" />
      <path d="M12 5c3 0 5 2.5 5 5s-2 5-5 5-5-2.5-5-5 2-5 5-5z" />
      <path d="M9 8h1M15 8h1" />
      <path d="M9 20l3-4 3 4" />
    </>
  ),
  enemySpider: (
    <>
      <circle cx="12" cy="13" r="4" />
      <path d="M8 11 4 7M16 11l4-4M8 14l-5 2M16 14l5 2M8 17l-4 4M16 17l4 4" />
    </>
  ),
  enemyTreant: (
    <>
      <path d="M12 3v18" />
      <path d="M12 7 6 4M12 7l6-3M12 11 4 9M12 11l8-2" />
      <path d="M9 21h6" />
    </>
  ),
  enemyBat: (
    <>
      <path d="M12 8c2 0 3 1.5 3 3s-1 3-3 3-3-1.5-3-3 1-3 3-3z" />
      <path d="M9 11 3 6v6l5 2M15 11l6-5v6l-5 2" />
    </>
  ),
  enemySlime: (
    <>
      <path d="M4 17c0-5 3.6-9 8-9s8 4 8 9z" />
      <path d="M9 14h6" />
    </>
  ),
  enemyTroll: (
    <>
      <path d="M12 4c3 0 5 2.5 5 5s-2 5-5 5-5-2.5-5-5 2-5 5-5z" />
      <path d="M7 21l1-4M17 21l-1-4" />
      <path d="M9 8h1M15 8h1" />
    </>
  ),
  enemySkeleton: (
    <>
      <path d="M7 4h10v7a5 5 0 0 1-10 0z" />
      <path d="M10 8h1M14 8h1" />
      <path d="M10 12h4M12 12v2" />
      <path d="M12 16v5M9 21h6" />
    </>
  ),
  enemyWraith: (
    <>
      <path d="M5 20V10a7 7 0 0 1 14 0v10" />
      <path d="M8 20v-3M12 20v-4M16 20v-3" />
    </>
  ),
  enemyGolem: (
    <>
      <path d="M7 7h10v10H7z" />
      <path d="M4 10h3M17 10h3M4 14h3M17 14h3" />
      <path d="M10 4h4v3M9 17v3M15 17v3" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  /** Lado de la caja. El trazo escala con el, para que no engorde al agrandar. */
  size?: number;
  className?: string;
}

export const Icon = ({ name, size = 18, className }: IconProps) => (
  <svg
    className={className ? `icon ${className}` : 'icon'}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
    focusable="false"
  >
    {paths[name]}
  </svg>
);