import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { kingdomApi } from '../api/api';
import type { KingdomData } from '../types';
import { KingdomCard } from '../components/KingdomCard';

export const CastlePage = () => {
  const userId = useOutletContext<string>();
  const [kingdom, setKingdom] = useState<KingdomData | null>(null);
  const [pageMsg, setPageMsg] = useState('');

  useEffect(() => {
    const fetchKingdom = async () => {
      const res = await kingdomApi.get(`/api/kingdoms/${userId}`).catch(() => null);
      if (res) setKingdom(res.data);
    };
    if (userId) fetchKingdom();
  }, [userId]);

  const handleCreateKingdom = async () => {
    try {
      await kingdomApi.post('/api/kingdoms', { userId });
      const { data } = await kingdomApi.get(`/api/kingdoms/${userId}`);
      setKingdom(data);
    } catch (e: any) { setPageMsg('Error al crear reino'); }
  };

  const handleAddBuilding = async (type: number) => {
    try {
      await kingdomApi.post(`/api/kingdoms/${userId}/buildings`, { buildingType: type });
      const { data } = await kingdomApi.get(`/api/kingdoms/${userId}`);
      setKingdom(data);
    } catch (e: any) { setPageMsg(e.response?.data?.message || 'Error'); }
  };

  const handleUpgradeBuilding = async (type: number) => {
    try {
      await kingdomApi.post(`/api/kingdoms/${userId}/buildings/upgrade`, { buildingType: type });
      const { data } = await kingdomApi.get(`/api/kingdoms/${userId}`);
      setKingdom(data);
    } catch (e: any) { setPageMsg(e.response?.data?.message || 'Error'); }
  };

  const handleTrainArmy = async (amount: number) => {
    try {
      await kingdomApi.post(`/api/kingdoms/${userId}/army/train`, { amount });
      const { data } = await kingdomApi.get(`/api/kingdoms/${userId}`);
      setKingdom(data);
    } catch (e: any) { setPageMsg(e.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <KingdomCard 
        kingdom={kingdom} 
        onCreate={handleCreateKingdom} 
        onBuild={handleAddBuilding} 
        onUpgrade={handleUpgradeBuilding} 
        onTrain={handleTrainArmy} 
      />
      {pageMsg && <p className="message" style={{ color: '#28a745' }}>{pageMsg}</p>}
    </div>
  );
};