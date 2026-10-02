import { useCallback, useEffect, useState } from 'react';
import { heroesApi } from '../api/api';
import { getErrorMessage } from '../api/errors';
import { useTranslation } from '../i18n/useI18n';
import type { HeroData, RestHeroResult } from '../types';

interface HeroState {
  userId: string;
  hero: HeroData | null;
}

interface UseHeroResult {
  /** El heroe del usuario en sesion, o `null` mientras carga. */
  hero: HeroData | null;
  isLoading: boolean;
  /** Error al leer el heroe. Sale ya traducido. */
  loadError: string;
  /** Error al descansar. Sale ya traducido. */
  restError: string;
  isResting: boolean;
  /**
   * Vuelve a leer el heroe. Hay que llamarla despues de un combate: alli el
   * servidor le puede haber cambiado la vida, el nivel o el oro. Va memorizado
   * porque `BattlePanel` lo envuelve en un `useCallback`.
   */
  refresh: () => Promise<void>;
  /**
   * Descansa y relee el heroe. Devuelve la respuesta del servidor para que la
   * pagina componga el mensaje de exito, o `null` si fallo, en cuyo caso el
   * error queda en `restError`.
   */
  rest: () => Promise<RestHeroResult | null>;
}

/**
 * Carga el heroe del usuario en sesion y expone las acciones que se hacen sobre
 * el.
 *
 * Vive en un hook y no en `HeroPage` porque el mapa necesita lo mismo: saber si el
 * heroe esta en pie para dejarle luchar, descansar tras caer, y releerlo al
 * terminar un combate. El estado guardado incluye el `userId` al que pertenece
 * para que, si este cambia, no se pinte el heroe del anterior.
 */
export const useHero = (userId: string): UseHeroResult => {
  const { t } = useTranslation();
  const [state, setState] = useState<HeroState | null>(null);
  const [loadError, setLoadError] = useState('');
  const [restError, setRestError] = useState('');
  const [isResting, setIsResting] = useState(false);

  const hero = state?.userId === userId ? state.hero : null;
  const isLoading = Boolean(userId) && !loadError && !hero;

  const refresh = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      const { data } = await heroesApi.get<HeroData>(`/api/heroes/${userId}`);
      setState({ userId, hero: data });
      setLoadError('');
    } catch (error: unknown) {
      setLoadError(getErrorMessage(error, t('hero.refreshError')));
    }
  }, [userId, t]);

  const rest = useCallback(async (): Promise<RestHeroResult | null> => {
    if (!userId) {
      return null;
    }

    setRestError('');
    setIsResting(true);
    try {
      const { data } = await heroesApi.post<RestHeroResult>(`/api/heroes/${userId}/rest`);
      const { data: hero } = await heroesApi.get<HeroData>(`/api/heroes/${userId}`);
      setState({ userId, hero });
      return data;
    } catch (error: unknown) {
      setRestError(getErrorMessage(error, t('hero.restError')));
      return null;
    } finally {
      setIsResting(false);
    }
  }, [userId, t]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isActive = true;

    const fetchHero = async () => {
      try {
        const { data } = await heroesApi.get<HeroData>(`/api/heroes/${userId}`);
        if (isActive) {
          setState({ userId, hero: data });
          setLoadError('');
        }
      } catch (error: unknown) {
        if (isActive) {
          setLoadError(getErrorMessage(error, t('hero.loadError')));
        }
      }
    };

    fetchHero();

    return () => {
      isActive = false;
    };
  }, [userId, t]);

  return { hero, isLoading, loadError, restError, isResting, refresh, rest };
};