import { createContext } from 'react';
import type { MessageArg, Messages } from './dictionaries';
import type { Language } from './language';

/**
 * Contextos de idioma y tema.
 *
 * Viven en su propio archivo porque los providers exportan componentes y los
 * hooks exportan funciones: `react-refresh` no permite mezclar ambos en el mismo
 * archivo. Aqui solo se declaran los contextos y sus tipos.
 */

/**
 * Texto que llega del servidor para que lo traduzca el cliente.
 *
 * El backend no sabe en que idioma juega la persona, asi que manda la clave del
 * mensaje y los argumentos ya resueltos. `Args` puede traer claves anidadas: el
 * nombre de una habilidad o de un enemigo viaja como `abilityNameKey`, y se
 * traduce antes de insertarse en el mensaje.
 */
export interface LocalizedText {
  key: string;
  args?: Record<string, string>;
}

export type TranslateArgs = Record<string, MessageArg>;

export interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Traduce una clave del cliente, con argumentos opcionales. */
  t: (key: string, args?: TranslateArgs) => string;
  /** Traduce un mensaje que llega del servidor. */
  tl: (text: LocalizedText | null | undefined) => string;
}

/**
 * Sustituye los marcadores `{nombre}` por los argumentos. Un marcador sin
 * argumento se deja como estaba: es mas util para depurar que esconderlo.
 */
const PLACEHOLDER = /\{(\w+)\}/g;

export const interpolate = (template: string, args: TranslateArgs): string =>
  template.replace(PLACEHOLDER, (match, name: string) => {
    const value = args[name];

    return value === undefined ? match : String(value);
  });

/**
 * Resuelve un `LocalizedText` del servidor. Si la clave no existe en el
 * diccionario devuelve la propia clave: es feo pero visible, y delata el fallo
 * enseguida en lugar de dejar un texto en blanco o en el idioma equivocado.
 */
export const translateText = (
  messages: Messages,
  text: LocalizedText | null | undefined,
): string => {
  if (!text) return '';

  const resolved: TranslateArgs = {};

  for (const [name, value] of Object.entries(text.args ?? {})) {
    // Un argumento cuyo nombre termina en `Key` es otra clave de traduccion:
    // hay que resolverla antes de meterla en el mensaje.
    resolved[name] = name.endsWith('Key') ? (messages[value] ?? value) : value;
  }

  return interpolate(messages[text.key] ?? text.key, resolved);
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export interface ThemeContextValue {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  /** Invierte entre claro y oscuro. Es lo que hace el boton del selector. */
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);