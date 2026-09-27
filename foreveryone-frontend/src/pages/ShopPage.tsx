import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { heroesApi, shopApi } from '../api/api';
import { getErrorMessage, isNotFound } from '../api/errors';
import type { HeroData, ShopItemData, UserSession } from '../types';
import { Message, type MessageTone } from '../components/Message';
import '../components/GameCard.css';
import './ShopPage.css';

interface Notice {
  tone: MessageTone;
  text: string;
}

interface BuyItemResult {
  message: string;
  currentGold: number;
}

export const ShopPage = () => {
  const { userId } = useOutletContext<UserSession>();
  const [hero, setHero] = useState<HeroData | null>(null);
  const [items, setItems] = useState<ShopItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isActive = true;

    const load = async () => {
      try {
        // El heroe y el catalogo son servicios distintos: si uno falla, el otro
        // sigue siendo util, asi que se resuelven por separado.
        const [heroResult, shopResult] = await Promise.allSettled([
          heroesApi.get<HeroData>(`/api/heroes/${userId}`),
          shopApi.get<ShopItemData[]>('/api/shop'),
        ]);

        if (!isActive) {
          return;
        }

        if (heroResult.status === 'fulfilled') {
          setHero(heroResult.value.data);
        } else if (isNotFound(heroResult.reason)) {
          setLoadError('Necesitas un héroe para entrar a la tienda.');
        } else {
          setLoadError(getErrorMessage(heroResult.reason, 'No se pudo cargar tu héroe.'));
        }

        if (shopResult.status === 'fulfilled') {
          setItems(shopResult.value.data);
        } else {
          setLoadError(
            getErrorMessage(shopResult.reason, 'No se pudo cargar el catálogo de la tienda.'),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const handleBuyItem = async (item: ShopItemData) => {
    setNotice(null);
    setPendingItemId(item.id);

    try {
      // La compra la sirve Heroes, no Shop: es la que descuenta el oro al heroe.
      const { data } = await heroesApi.post<BuyItemResult>(`/api/shop/${userId}/buy`, { itemId: item.id });
      const { data: heroData } = await heroesApi.get<HeroData>(`/api/heroes/${userId}`);
      setHero(heroData);
      setNotice({ tone: 'success', text: data.message });
    } catch (error: unknown) {
      setNotice({
        tone: 'error',
        text: getErrorMessage(error, 'No se pudo comprar el objeto.'),
      });
    } finally {
      setPendingItemId(null);
    }
  };

  if (isLoading) {
    return <p className="shop-loading">Abriendo el puesto del mercader…</p>;
  }

  if (loadError) {
    return (
      <div className="stats-card">
        <Message tone="error">{loadError}</Message>
      </div>
    );
  }

  if (!hero) {
    return <p className="shop-loading">Necesitas un héroe para entrar a la tienda.</p>;
  }

  return (
    <div className="stats-card">
      <div className="shop-header">
        <h3>🏪 Tienda de Foreveryone</h3>
        <span className="gold-display">🪙 Oro: {hero.gold}</span>
      </div>

      {items.length === 0 ? (
        <p className="shop-empty">El mercader no tiene nada preparado por ahora.</p>
      ) : (
        <div className="shop-items">
          {items.map((item) => {
            const isPending = pendingItemId === item.id;
            const canAfford = hero.gold >= item.cost;

            return (
              <div key={item.id} className="shop-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                </div>
                <div className="item-action">
                  <span className="item-cost">🪙 {item.cost}</span>
                  <button
                    type="button"
                    onClick={() => handleBuyItem(item)}
                    // `pendingItemId` evita el doble clic: sin el, dos pulsaciones
                    // rapidas descutaban el objeto dos veces.
                    disabled={!canAfford || pendingItemId !== null}
                  >
                    {isPending ? 'Comprando…' : 'Comprar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notice && <Message tone={notice.tone}>{notice.text}</Message>}
    </div>
  );
};
