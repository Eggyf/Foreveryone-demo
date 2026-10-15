/// <reference types="vite/client" />

/**
 * Variables de entorno que puede sobrescribir la URL de cada servicio. Todas
 * son opcionales: si no se definen, `src/api/api.ts` usa los puertos locales
 * de `start-all.ps1`. Los valores por defecto viven en `.env`.
 */
interface ImportMetaEnv {
  readonly VITE_IDENTITY_URL?: string;
  readonly VITE_HEROES_URL?: string;
  readonly VITE_KINGDOM_URL?: string;
  readonly VITE_SHOP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
