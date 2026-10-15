/**
 * Idiomas que admite el juego y como se elige uno.
 *
 * La preferencia guardada manda siempre. Solo en la primera visita, cuando el
 * jugador todavia no ha elegido nada, se deduce del idioma del navegador: entrar
 * con el navegador en ingles y ver el juego en ingles evita el primer arranque en
 * un idioma que no es el suyo.
 */

export type Language = 'es' | 'en';

export const LANGUAGES: readonly Language[] = ['es', 'en'];

const STORAGE_KEY = 'foreveryone:language';

/** Nombre de cada idioma en el suyo, para el selector. */
const LANGUAGE_LABELS: Record<Language, string> = {
  es: 'Español',
  en: 'English',
};

const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);

/**
 * Idioma por defecto segun el navegador. Se mira el primer idioma de la lista
 * `navigator.languages`, que es donde el navegador declara sus preferencias en
 * orden. Sin API disponible, castellano.
 */
export const detectBrowserLanguage = (): Language => {
  if (typeof navigator === 'undefined') {
    return 'es';
  }

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const short = candidate.split('-')[0].toLowerCase();

    if (isLanguage(short)) return short;

    // Frances, portugues y catalan share spelling with Spanish enough that a
    // Spanish fallback reads better than raw English.
    if (short === 'fr' || short === 'pt' || short === 'ca' || short === 'gl') return 'es';
  }

  return 'es';
};

/** Idioma guardado, o el del navegador si no hay ninguno. */
export const readLanguage = (): Language => {
  if (typeof localStorage === 'undefined') {
    return detectBrowserLanguage();
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  return isLanguage(stored) ? stored : detectBrowserLanguage();
};

export const writeLanguage = (language: Language): void => {
  localStorage.setItem(STORAGE_KEY, language);
};

export const languageLabel = (language: Language): string => LANGUAGE_LABELS[language];

/**
 * Idioma del documento. No decide nada: solo mantiene el atributo `lang` al día
 * para que un lector de pantalla pronuncie el texto con la voz correcta y para que
 * el navegador no infiera mal el formato de números o fechas.
 */
export const applyDocumentLanguage = (language: Language): void => {
  document.documentElement.lang = language;
};