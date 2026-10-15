/**
 * Persistencia de la retícula de construcción.
 *
 * Sigue el mismo patrón que `theme.ts`: un solo módulo, una clave de
 * `localStorage` y un punto de acceso. La retícula es el motivo firmante del
 * mundo visual, pero es un estado real y no una textura: el jugador puede
 * apagarla, y esa elección se guarda.
 */

const STORAGE_KEY = 'foreveryone:grid';

/** Clase en `<html>` que apaga la retícula. Ver `App.css`. */
export const GRID_OFF_CLASS = 'grid-off';

export type Grid = 'on' | 'off';

export const GRIDS: readonly Grid[] = ['on', 'off'];

const isGrid = (value: unknown): value is Grid =>
  typeof value === 'string' && (GRIDS as readonly string[]).includes(value);

/**
 * La retícula se escribe como clase en `<html>` y no como atributo de tema,
 * porque no es un tema: los dos pueden convivir y apagar la retícula no debe
 * tocar los tokens.
 */
export const applyGrid = (grid: Grid): void => {
  document.documentElement.classList.toggle(GRID_OFF_CLASS, grid === 'off');
};

/**
 * Preferencia inicial, antes de que React arranque. Se invoca desde `main.tsx`
 * junto a `applyInitialTheme`, para que el primer pintado ya traiga la
 * retícula en su estado definitivo y no aparezca un destello de andamiaje.
 */
export const applyInitialGrid = (): Grid => {
  const grid = readGrid();

  applyGrid(grid);

  return grid;
};

export const readGrid = (): Grid => {
  if (typeof localStorage === 'undefined') {
    return 'on';
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  return isGrid(stored) ? stored : 'on';
};

export const writeGrid = (grid: Grid): void => {
  localStorage.setItem(STORAGE_KEY, grid);
};