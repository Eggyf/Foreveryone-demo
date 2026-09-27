import { jwtDecode } from 'jwt-decode';
import type { UserSession } from '../types';

interface TokenClaims {
  sub?: string;
  nameid?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  /** Segundos desde epoch. Identity lo emite con `expires`. */
  exp?: number;
}

const EMPTY_SESSION: UserSession = { userId: '', username: '', email: '', displayName: '' };

const formatDisplayName = (value: string): string => {
  const normalized = value.trim().replace(/[._-]+/g, ' ');

  if (!normalized) {
    return 'Aventurero';
  }

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

/** `??` no descarta cadenas vacias, asi que el primer valor no vacio gana. */
const firstFilled = (...values: Array<string | undefined>): string =>
  values.find((value) => Boolean(value?.trim()))?.trim() ?? '';

export const decodeUserSession = (token: string | null): UserSession => {
  if (!token) {
    return EMPTY_SESSION;
  }

  try {
    const claims = jwtDecode<TokenClaims>(token);
    const email = firstFilled(claims.email);
    const username = firstFilled(claims.preferred_username);

    return {
      userId: firstFilled(claims.sub, claims.nameid),
      username,
      email,
      displayName: formatDisplayName(firstFilled(claims.name, username, email.split('@')[0])),
    };
  } catch {
    // Token corrupto o con un formato que jwt-decode no reconoce.
    return EMPTY_SESSION;
  }
};

/**
 * El backend aun no valida el JWT, asi que un token caducado solo se detecta
 * leyendo su `exp`. Comprobarlo aqui evita mostrar el juego a un jugador que ya
 * no puede llamar a ningun servicio.
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }

  try {
    const { exp } = jwtDecode<TokenClaims>(token);
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};
