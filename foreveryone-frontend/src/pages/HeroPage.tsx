import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { heroesApi } from '../api/api';
import { HeroCard, HeroLoadingCard } from '../components/HeroCard';
import type { HeroData, UserSession } from '../types';

interface HeroResultState {
  userId: string;
  hero: HeroData | null;
}

const getErrorMessage = (error: unknown, fallback: string): string => (
  isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback
);

export const HeroPage = () => {
  const { userId, displayName } = useOutletContext<UserSession>();
  const [heroResult, setHeroResult] = useState<HeroResultState | null>(null);
  const [loadError, setLoadError] = useState('');
  const [pageMsg, setPageMsg] = useState('');
  const hero = heroResult?.userId === userId ? heroResult.hero : null;
  const isLoading = Boolean(userId) && !loadError && !hero;

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isActive = true;

    const fetchHero = async () => {
      try {
        const response = await heroesApi.get(`/api/heroes/${userId}`);
        if (isActive) {
          setHeroResult({ userId, hero: response.data as HeroData });
        }
      } catch (error: unknown) {
        if (isActive) {
          setLoadError(getErrorMessage(error, 'No se pudo cargar tu héroe.'));
        }
      }
    };

    fetchHero();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const handleAdventure = async () => {
    setPageMsg('');
    try {
      const { data: adventureData } = await heroesApi.post(`/api/heroes/${userId}/adventure`);
      setPageMsg(adventureData.message);
      const { data } = await heroesApi.get(`/api/heroes/${userId}`);
      setHeroResult({ userId, hero: data as HeroData });
    } catch (error: unknown) {
      setPageMsg(getErrorMessage(error, 'No se pudo completar la aventura'));
    }
  };

  const handleRest = async () => {
    setPageMsg('');
    try {
      const { data: restData } = await heroesApi.post(`/api/heroes/${userId}/rest`);
      setPageMsg(restData.message);
      const { data } = await heroesApi.get(`/api/heroes/${userId}`);
      setHeroResult({ userId, hero: data as HeroData });
    } catch (error: unknown) {
      setPageMsg(getErrorMessage(error, 'No se pudo descansar'));
    }
  };

  return (
    <div className="hero-page">
      {loadError ? (
        <p className="message">{loadError}</p>
      ) : isLoading ? (
        <HeroLoadingCard displayName={displayName} />
      ) : (
        hero && (
          <HeroCard
            hero={hero}
            displayName={displayName}
            onAdventure={handleAdventure}
            onRest={handleRest}
          />
        )
      )}
      {pageMsg && <p className="message">{pageMsg}</p>}
    </div>
  );
};
