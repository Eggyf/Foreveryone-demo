import { useContext } from 'react';
import { I18nContext } from './context';

/**
 * Acceso a las traducciones.
 *
 * Vive aparte de `I18nProvider.tsx` porque `react-refresh` no admite que un
 * archivo de componente exporte ademas funciones sueltas: si el hook estuviera en
 * el archivo del provider, el Fast Refresh dejaria de funcionar al editarlo.
 *
 * Falla ruidosamente si se usa fuera del provider: un idioma null en pantalla es
 * peor que un error claro en desarrollo.
 */
export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n debe usarse dentro de <I18nProvider>.');
  }

  return context;
};

/**
 * Atajo para el caso más común: solo traducir claves y mensajes del servidor.
 * Casi todas las pantallas necesitan ambas cosas, asi que pedirlas por separado
 * obligaria a repetir el hook.
 */
export const useTranslation = () => {
  const { t, tl } = useI18n();

  return { t, tl };
};