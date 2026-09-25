import { jwtDecode } from 'jwt-decode';
import type { UserSession } from '../types';

interface TokenClaims {
  sub?: string;
  nameid?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
}

const formatDisplayName = (value: string): string => {
  const normalized = value.trim().replace(/[._-]+/g, ' ');

  if (!normalized) {
    return 'Aventurero';
  }

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const decodeUserSession = (token: string | null): UserSession => {
  if (!token) {
    return { userId: '', username: '', email: '', displayName: '' };
  }

  try {
    const claims = jwtDecode<TokenClaims>(token);
    const email = claims.email ?? '';
    const username = claims.preferred_username ?? '';
    const nameSource = claims.name ?? username ?? email.split('@')[0] ?? '';

    return {
      userId: claims.sub ?? claims.nameid ?? '',
      username,
      email,
      displayName: formatDisplayName(nameSource),
    };
  } catch {
    return { userId: '', username: '', email: '', displayName: '' };
  }
};
