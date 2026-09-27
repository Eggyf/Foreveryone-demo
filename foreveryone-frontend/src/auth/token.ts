const TOKEN_STORAGE_KEY = 'token';

/**
 * Unico punto de acceso al token. `App.tsx` escribe y borra; el interceptor de
 * `src/api/api.ts` solo lee. Centralizarlo evita que la clave se escriba con
 * dos nombres distintos o que se olvide limpiarla al cerrar sesion.
 */
export const readToken = (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY);

export const writeToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};
