import { useState, useEffect } from 'react';
import { heroesApi, kingdomApi } from '../api/api';
import type { HeroData, KingdomData } from '../types';
import { HeroCard } from './HeroCard';
import { KingdomCard } from './KingdomCard';

export const Dashboard = ({ userId, onLogout }: { userId: string, onLogout: () => void }) => {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [kingdom, setKingdom] = useState<KingdomData | null>(null);
  const [dashMsg, setDashMsg] = useState('');

  // Carga inicial de datos (El patrón correcto para React 19)
  useEffect(() => {
    // Definimos la función asíncrona DENTRO del efecto
    const fetchInitialData = async () => {
      try {
        const [heroRes, kingdomRes] = await Promise.all([
          heroesApi.get(`/api/heroes/${userId}`).catch(() => null),
          kingdomApi.get(`/api/kingdoms/${userId}`).catch(() => null)
        ]);
        
        // Estos setState son seguros porque ocurren DESPUÉS del await
        if (heroRes) setHero(heroRes.data);
        if (kingdomRes) setKingdom(kingdomRes.data);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      }
    };

    // Ejecutamos la función
    if (userId) fetchInitialData();
  }, [userId]);

  // Manejador para crear Héroe
  const handleCreateHero = async () => {
    try {
      await heroesApi.post('/api/heroes', { userId, class: 1 });
      setDashMsg('¡Héroe Warrior creado!');
      // Actualizamos el estado de React con la nueva info del backend
      const { data } = await heroesApi.get(`/api/heroes/${userId}`);
      setHero(data); 
    } catch (error: any) {
      setDashMsg(error.response?.data?.message || 'Error al crear héroe');
    }
  };

  // Manejador para crear Reino
  const handleCreateKingdom = async () => {
    try {
      await kingdomApi.post('/api/kingdoms', { userId });
      setDashMsg('¡Reino fundado!');
      // Actualizamos el estado de React con la nueva info del backend
      const { data } = await kingdomApi.get(`/api/kingdoms/${userId}`);
      setKingdom(data);
    } catch (error: any) {
      setDashMsg(error.response?.data?.message || 'Error al crear reino');
    }
  };

  return (
    <div className="dashboard">
      <h2>Panel del Jugador</h2>
      
      <HeroCard hero={hero} onCreate={handleCreateHero} />
      <KingdomCard kingdom={kingdom} onCreate={handleCreateKingdom} />

      {dashMsg && <p className="message" style={{ color: '#28a745' }}>{dashMsg}</p>}
      <button className="logout-btn" onClick={onLogout}>Cerrar Sesión</button>
    </div>
  );
};