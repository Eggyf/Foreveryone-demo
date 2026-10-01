import { dictionaries } from './dictionaries';
import type { Language } from './language';

/**
 * Traduccion fuera de React.
 *
 * Existe para los dos sitios donde no hay ningun componente al que colgarse:
 * el interceptor de Axios, que se ejecuta antes de que un componente pueda leer
 * contexto, y el arranque de la aplicacion. Se apoya en el idioma que el
 * provider ya aplico, y por eso hay que volver a leerlo si el jugador cambia de
 * idioma.
 *
 * No es un atajo para evitar `useTranslation`: los componentes usan el hook.
 */
let activeLanguage: Language = 'es';

export const setActiveLanguage = (language: Language): void => {
  activeLanguage = language;
};

const current = () => dictionaries[activeLanguage];

/**
 * Traduce una clave simple. Los argumentos que llegan como `{x}` se sustituyen
 * literalmente; para claves anidadas usar `translateText`.
 */
export const t = (key: string, args?: Record<string, string | number>): string => {
  const messages = current();
  const template = messages[key] ?? key;

  if (!args) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = args[name];

    return value === undefined ? match : String(value);
  });
};

/**
 * Resuelve un texto traducible del servidor. Los argumentos cuyo nombre acaba en
 * `Key` son claves a su vez y se resuelven antes de insertarse, que es como el
 * backend compone los mensajes de combate.
 */
export const translateText = (
  text: { key: string; args?: Record<string, string> } | null | undefined,
): string => {
  if (!text) return '';

  const messages = current();
  const resolved: Record<string, string> = {};

  for (const [name, value] of Object.entries(text.args ?? {})) {
    resolved[name] = name.endsWith('Key') ? (messages[value] ?? value) : value;
  }

  return (messages[text.key] ?? text.key).replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = resolved[name];

    return value === undefined ? match : String(value);
  });
};