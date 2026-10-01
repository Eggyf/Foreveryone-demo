import { isAxiosError } from 'axios';
import { t, translateText } from '../i18n/static';

/**
 * Los cuatro servicios no comparten un unico formato de error, asi que este
 * modulo centraliza como se extrae un mensaje legible de cualquier respuesta:
 *
 * - Identity devuelve `ProblemDetails` con `detail` (codigo) y `title` (codigo de
 *   dominio). Sus claves viajan en `message`, o en `errors` cuando son varias.
 * - Heroes, Kingdom y Shop devuelven `LocalizedProblem`:
 *   `{ "detail": { "key": "...", "args": { ... } } }`.
 * - Los `NotFound()` sin cuerpo se reescriben a un `ProblemDetails` generico que
 *   solo trae `title: "Not Found"`, sin mensaje alguno.
 * - Una excepcion sin manejar llega como 500 `text/plain` con la traza de la
 *   pila, que nunca debe mostrarse al jugador.
 *
 * Aqui se traduce con `t()` del modulo estatico en vez del hook porque el error
 * se normaliza fuera del arbol de React (interceptor de Axios, manejadores). Ese
 * modulo lee el idioma que el provider ya aplico, de modo que el resultado es el
 * mismo. Es tambien el unico sitio donde se lee el cuerpo del error: anadir un
 * `error.response.data.message` en un componente volveria a mezclar los formatos.
 */

interface ErrorBody {
  message?: unknown;
  detail?: unknown;
  title?: unknown;
  errors?: unknown;
}

interface LocalizedTextBody {
  key?: unknown;
  args?: unknown;
}

const firstString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

/**
 * Normaliza el cuerpo de un `LocalizedText`. Devuelve `null` si no trae clave,
 * que es la señal de que el cuerpo no venia en ese formato y hay que buscar otra
 * cosa (por ejemplo, un `ProblemDetails` de Identity).
 */
const toLocalizedText = (value: unknown): { key: string; args: Record<string, string> } | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const body = value as LocalizedTextBody;
  const key = firstString(body.key);

  if (!key) {
    return null;
  }

  const args: Record<string, string> = {};

  if (body.args && typeof body.args === 'object' && !Array.isArray(body.args)) {
    for (const [name, arg] of Object.entries(body.args as Record<string, unknown>)) {
      const text = firstString(arg);
      if (text) args[name] = text;
    }
  }

  return { key, args };
};

/**
 * Los errores de validacion llegan como diccionario campo -> clave, o como lista
 * plana. Se aplanan a claves para resolverlas con el mismo `t()` del resto.
 */
const collectValidationKeys = (errors: unknown): string[] => {
  if (Array.isArray(errors)) {
    return errors.flatMap((entry) => firstString(entry) ?? []);
  }

  if (errors && typeof errors !== 'object') {
    return [];
  }

  if (errors && typeof errors === 'object') {
    return Object.values(errors).flatMap((entry) =>
      (Array.isArray(entry) ? entry : [entry]).flatMap((item) => firstString(item) ?? []),
    );
  }

  return [];
};

/**
 * `title` solo se acepta cuando tiene forma de codigo de dominio
 * (`User.EmailAlreadyInUse`). Los titulos HTTP genericos ("Not Found") estan en
 * ingles y el mensaje de reserva de cada pantalla ya esta redactado.
 */
const isErrorCode = (value: string): boolean => /^[A-Za-z]+(?:\.[A-Za-z]+)+$/.test(value);

const looksLikeStackTrace = (value: string): boolean =>
  /^\s*(System\.|Microsoft\.|\s*at\s)/m.test(value) || value.includes('Exception:');

/** El servidor no respondio: servicio apagado, puerto ocupado o CORS. */
export const isNetworkError = (error: unknown): boolean =>
  isAxiosError(error) && !error.response;

export const isNotFound = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 404;

export const getStatusCode = (error: unknown): number | undefined => {
  if (!isAxiosError(error)) {
    return undefined;
  }

  return error.response?.status;
};

/**
 * Devuelve el primer mensaje utilizable del cuerpo de la respuesta, ya traducido,
 * y si no hay ninguno, `fallback` (que llega traducido desde el componente).
 * Nunca filtra trazas de pila ni codigos HTTP crudos.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return t('network.down');
  }

  const data: unknown = error.response.data;

  if (typeof data === 'string') {
    const text = data.trim();
    return text && !looksLikeStackTrace(text) ? text : fallback;
  }

  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const body = data as ErrorBody;

  // Formato de Heroes, Kingdom y Shop: el texto llega como clave y argumentos.
  const localizedDetail = toLocalizedText(body.detail);

  if (localizedDetail) {
    return translateText(localizedDetail);
  }

  // Identity manda la clave de traduccion en `message` cuando es un error de
  // dominio, y en `errors` cuando son varias reglas incumplidas.
  const messageKey = firstString(body.message);

  if (messageKey && !looksLikeStackTrace(messageKey)) {
    return t(messageKey);
  }

  const validationKeys = collectValidationKeys(body.errors);

  if (validationKeys.length > 0) {
    // Un campo puede incumplir varias reglas, y Identity las une en una sola
    // cadena separada por `|`. Se parten para traducir cada clave por separado.
    return validationKeys
      .flatMap((entry) => entry.split('|').map((key) => key.trim()))
      .filter(Boolean)
      .map((key) => t(key))
      .join(' · ');
  }

  const title = firstString(body.title);

  return (title && isErrorCode(title) ? title : undefined) ?? fallback;
};