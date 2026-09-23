import { isAxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { heroesApi, shopApi } from '../api/api'; // Importar shopApi
import type { HeroData, ShopItemData } from '../types';
import '../components/GameCard.css';
import './ShopPage.css';

export const ShopPage = () => {
  const userId = useOutletContext<string>();
  const [hero, setHero] = useState<HeroData | null>(null);
  const [items, setItems] = useState<ShopItemData[]>([]);
  const [pageMsg, setPageMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const heroRes = await heroesApi.get(`/api/heroes/${userId}`).catch(() => null);
      // NUEVO: Obtener items de Shop.Api
      const shopRes = await shopApi.get('/api/shop').catch(() => null); 
      if (heroRes) setHero(heroRes.data);
      if (shopRes) setItems(shopRes.data);
    };
    if (userId) fetchData();
  }, [userId]);

  const handleBuyItem = async (itemId: number) => {
    try {
      await heroesApi.post(`/api/shop/${userId}/buy`, { itemId });
      setPageMsg('¡Compra exitosa!');
      const { data } = await heroesApi.get(`/api/heroes/${userId}`);
      setHero(data);
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setPageMsg(message || 'Error al comprar');
    }
  };

  if (!hero) return <p>Necesitas un héroe para entrar a la tienda.</p>;

  return (
    <div className="stats-card">
      <div className="shop-header">
        <h3>🏪 Tienda de Eldoria</h3>
        <span className="gold-display">🪙 Oro: {hero.gold}</span>
      </div>

      <div className="shop-items">
        {items.map((item) => (
          <div key={item.id} className="shop-item">
            <div className="item-info">
              <h4>{item.name}</h4>
              <p>{item.description}</p>
            </div>
            <div className="item-action">
              <span className="item-cost">🪙 {item.cost}</span>
              <button 
                onClick={() => handleBuyItem(item.id)}
                disabled={hero.gold < item.cost}
              >
                Comprar
              </button>
            </div>
          </div>
        ))}
      </div>
      {pageMsg && <p className="message">{pageMsg}</p>}
    </div>
  );
};