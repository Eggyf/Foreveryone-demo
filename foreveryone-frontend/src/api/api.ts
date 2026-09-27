import axios, { type InternalAxiosRequestConfig } from 'axios';
import { readToken } from '../auth/token';

/**
 * Cada microservicio se expone en su propio puerto (ver `start-all.ps1`). La
 * URL se puede redirigir con `VITE_<SERVICIO>_URL` para despliegues que no
 * usen los puertos locales; si la variable no esta definida se cae al puerto
 * de desarrollo. El slash final se elimina para no duplicar Separadores al
 * concatenar con rutas que empiezan por `/api/...`.
 */
const resolveBaseUrl = (envUrl: string | undefined, fallbackPort: number): string =>
  (envUrl?.trim() || `http://localhost:${fallbackPort}`).replace(/\/+$/, '');

export const identityApi = axios.create({
  baseURL: resolveBaseUrl(import.meta.env.VITE_IDENTITY_URL, 5045),
});

export const heroesApi = axios.create({
  baseURL: resolveBaseUrl(import.meta.env.VITE_HEROES_URL, 5281),
});

export const kingdomApi = axios.create({
  baseURL: resolveBaseUrl(import.meta.env.VITE_KINGDOM_URL, 5256),
});

export const shopApi = axios.create({
  baseURL: resolveBaseUrl(import.meta.env.VITE_SHOP_URL, 5136),
});

/**
 * Añade el JWT a cada peticion de datos. `localStorage` es la unica fuente del
 * token y `App.tsx` es su unico escritor, asi que este interceptor no necesita
 * sincronizarse con ningun estado de React.
 */
const attachToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = readToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
};

heroesApi.interceptors.request.use(attachToken);
kingdomApi.interceptors.request.use(attachToken);
shopApi.interceptors.request.use(attachToken);
