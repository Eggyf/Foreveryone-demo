import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { heroesApi } from '../api/api';
import { getErrorMessage } from '../api/errors';
import { BattlePanel } from '../components/BattlePanel';
import { HeroCard, HeroLoadingCard } from '../components/HeroCard';
import { Message, type MessageTone } from '../components/Message';
import { useTranslation } from '../i18n/useI18n';
import type { RestHeroResult, UserSession } from '../types';
import './HeroPage.css';

interface HeroResultState {
  userId: string;
  hero: import('../types').HeroData | null;
}

interface Notice {
  tone: MessageTone;
  text: string;
}

export const HeroPage = () => {
  const { t, tl } = useTranslation();
  const { userId, displayName } = useOutletContext<UserSession>();
  const [heroResult, setHeroResult] = useState<HeroResultState | null>(null);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isResting, setIsResting] = useState(false);
  const hero = heroResult?.userId === userId ? heroResult.hero : null;
  const isLoading = Boolean(userId) && !loadError && !hero;

  /**
   * Tras una batalla el heroe puede haber cambiado de vida, nivel u oro, asi que
   * hay que releerlo. Va memorizado porque `BattlePanel` lo envuelve en un
   * `useCallback`: sin esto la funcion cambiaria en cada render.
   */
  const refreshHero = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      const { data } = await heroesApi.get<import('../types').HeroData>(`/api/heroes/${userId}`);
      setHeroResult({ userId, hero: data });
      setLoadError('');
    } catch (error: unknown) {
      setLoadError(getErrorMessage(error, t('hero.refreshError')));
    }
  }, [userId, t]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isActive = true;

    const fetchHero = async () => {
      try {
        const { data } = await heroesApi.get<import('../types').HeroData>(`/api/heroes/${userId}`);
        if (isActive) {
          setHeroResult({ userId, hero: data });
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

  const handleRest = async () => {
    setNotice(null);
    setIsResting(true);

    try {
      const { data } = await heroesApi.post<RestHeroResult>(`/api/heroes/${userId}/rest`);
      const { data: heroData } = await heroesApi.get<import('../types').HeroData>(
        `/api/heroes/${userId}`,
      );
      setHeroResult({ userId, hero: heroData });
      // El mensaje del servidor llega como clave con argumentos: se compone aqui.
      setNotice({ tone: 'success', text: tl(data.message) });
    } catch (error: unknown) {
      setNotice({
        tone: 'error',
        text: getErrorMessage(error, t('hero.restError')),
      });
    } finally {
      setIsResting(false);
    }
  };

  return (
    <div className="hero-page">
      {loadError ? (
        <Message tone="error">{loadError}</Message>
      ) : isLoading ? (
        <HeroLoadingCard displayName={displayName} />
      ) : (
        hero && (
          <>
            <HeroCard
              hero={hero}
              displayName={displayName}
              isResting={isResting}
              onRest={handleRest}
            />
            <BattlePanel
              userId={userId}
              disabled={hero.currentHealth === 0}
              onBattleFinished={refreshHero}
            />
          </>
        )
      )}
      {notice && <Message tone={notice.tone}>{notice.text}</Message>}
    </div>
  );
};