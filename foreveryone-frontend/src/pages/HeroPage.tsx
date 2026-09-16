import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { heroesApi } from '../api/api';
import type { HeroData } from '../types';
import { HeroCard } from '../components/HeroCard';

export const HeroPage = () => {
  const userId = useOutletContext<string>();
  const [hero, setHero] = useState<HeroData | null>(null);
  const [pageMsg, setPageMsg] = useState('');

  useEffect(() => {
    const fetchHero = async () => {
      const res = await heroesApi.get(`/api/heroes/${userId}`).catch(() => null);
      if (res) setHero(res.data);
    };
    if (userId) fetchHero();
  }, [userId]);

  const handleCreateHero = async () => {
    try {
      await heroesApi.post('/api/heroes', { userId, class: 1 });
      const { data } = await heroesApi.get(`/api/heroes/${userId}`);
      setHero(data);
    } catch (e: any) { setPageMsg('Error al crear héroe'); }
  };

  const handleAdventure = async () => {
    try {
      const { data: advData } = await heroesApi.post(`/api/heroes/${userId}/adventure`);
      setPageMsg(advData.message);
      const { data } = await heroesApi.get(`/api/heroes/${userId}`);
      setHero(data);
    } catch (e: any) { setPageMsg(e.response?.data?.message || 'Error'); }
  };

  const handleRest = async () => {
    try {
      await heroesApi.post(`/api/heroes/${userId}/rest`);
      setPageMsg('Has descansado.');
      const { data } = await heroesApi.get(`/api/heroes/${userId}`);
      setHero(data);
    } catch (e: any) { setPageMsg('Error'); }
  };

  return (
    <div>
      <HeroCard 
        hero={hero} 
        onCreate={handleCreateHero} 
        onAdventure={handleAdventure} 
        onRest={handleRest} 
          Vacío porque la tienda ahora es otra página
      />
      {pageMsg && <p className="message" style={{ color: '#28a745' }}>{pageMsg}</p>}
    </div>
  );
};