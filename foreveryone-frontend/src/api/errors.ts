import { isAxiosError } from 'axios';

/**
 * Los cuatro servicios no comparten un unico formato de error, asi que este
 * modulo centraliza como se extrae un mensaje legible de cualquier respuesta:
 *
 * - Identity devuelve `ProblemDetails` con `detail` (texto) y `title` (codigo).
 * - Heroes, Kingdom y Shop devuelven `{ "message": "..." }` a proposito.
 * - Los `NotFound()` sin cuerpo se reescriben a un `ProblemDetails` generico
 *   que solo trae `title: "Not Found"`, sin `message` ni `detail`.
 * - Las validaciones anaden `errors`, ya sea como lista plana o indexada por
 *   campo (los `ValidationProblemDetails` automaticos de `[ApiController]`).
 * - Una excepcion sin manejar llega como 500 `text/plain` con la traza de la
 *   pila, que nunca debe mostrarse al jugador.
 */

type ValidationErrors = Record<string, unknown> | string[] | undefined;

interface ErrorBody {
  message?: unknown;
  detail?: unknown;
  title?: unknown;
  errors?: ValidationErrors;
}

const firstString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const collectValidationErrors = (errors: ValidationErrors): string[] => {
  if (Array.isArray(errors)) {
    return errors.flatMap((entry) => firstString(entry) ?? []);
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
 * Devuelve el primer mensaje utilizable del cuerpo de la respuesta y, si no
 * hay ninguno, `fallback`. Nunca filtra trazas de pila ni codigos HTTP crudos.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return 'No hay conexión con el servidor. Comprueba que los servicios estén encendidos.';
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
  const title = firstString(body.title);
  const validationErrors = collectValidationErrors(body.errors);

  return (
    firstString(body.message) ??
    firstString(body.detail) ??
    (validationErrors.length > 0 ? validationErrors.join(' · ') : undefined) ??
    (title && isErrorCode(title) ? title : undefined) ??
    fallback
  );
};
