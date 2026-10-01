/**
 * Persistencia y deteccion del tema.
 *
 * Sigue el mismo patron que `auth/token.ts`: un solo modulo, una clave de
 * `localStorage` y un punto de acceso. La clave vive aqui porque el provider la
 * necesita tambien antes de que React arranque.
 */

export type Theme = 'dark' | 'light';

export const THEMES: readonly Theme[] = ['dark', 'light'];

const STORAGE_KEY = 'foreveryone:theme';

export const THEME_ATTRIBUTE = 'data-theme';

const isTheme = (value: unknown): value is Theme =>
  typeof value === 'string' && (THEMES as readonly string[]).includes(value);

/**
 * El atributo `data-theme` se escribe en el `<html>`, no en un contenedor del
 * arbol de React, porque los tokens se resuelven en la raiz y asi el fondo del
 * `body` tambien queda cubierto.
 */
export const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
};

/**
 * Preferencia inicial, antes de que React arranque. Se invoca desde `main.tsx`
 * para que el atributo `data-theme` ya exista en el primer pintado: si se hiciera
 * dentro del provider, el navegador pintaria primero el tema por defecto y el
 * jugador veria un destello al recargar en tema claro.
 */
export const applyInitialTheme = (): Theme => {
  const theme = readTheme();

  applyTheme(theme);

  return theme;
};

/**
 * Tema que pide el sistema operativo. Solo se usa si el jugador no ha elegido
 * ninguno: en cuanto elige, su preferencia manda.
 */
export const detectSystemTheme = (): Theme => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

/**
 * Tema guardado, o el del sistema si no hay ninguno.
 *
 * El juego arranca en oscuro porque es el tema de partida y el que mejor sostiene
 * la paleta medieval; el tema claro es el alternativo que se elige a mano.
 */
export const readTheme = (): Theme => {
  if (typeof localStorage === 'undefined') {
    return detectSystemTheme();
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  return isTheme(stored) ? stored : detectSystemTheme();
};

export const writeTheme = (theme: Theme): void => {
  localStorage.setItem(STORAGE_KEY, theme);
};