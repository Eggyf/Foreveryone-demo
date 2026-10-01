import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { heroesApi, shopApi } from '../api/api';
import { getErrorMessage, isNotFound } from '../api/errors';
import { useTranslation } from '../i18n/useI18n';
import type { BuyItemResult, HeroData, ShopItemData, UserSession } from '../types';
import { Message, type MessageTone } from '../components/Message';
import '../components/GameCard.css';
import './ShopPage.css';

interface Notice {
  tone: MessageTone;
  text: string;
}

export const ShopPage = () => {
  const { t, tl } = useTranslation();
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
          setLoadError(t('shop.needsHero'));
        } else {
          setLoadError(getErrorMessage(heroResult.reason, t('shop.loadHeroError')));
        }

        if (shopResult.status === 'fulfilled') {
          setItems(shopResult.value.data);
        } else {
          setLoadError(
            getErrorMessage(shopResult.reason, t('shop.loadCatalogError')),
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
  }, [userId, t]);

  const handleBuyItem = async (item: ShopItemData) => {
    setNotice(null);
    setPendingItemId(item.id);

    try {
      // La compra la sirve Heroes, no Shop: es la que descuenta el oro al heroe.
      const { data } = await heroesApi.post<BuyItemResult>(`/api/shop/${userId}/buy`, {
        itemId: item.id,
      });
      const { data: heroData } = await heroesApi.get<HeroData>(`/api/heroes/${userId}`);
      setHero(heroData);
      // El mensaje llega como clave con el nombre del articulo ya resuelto.
      setNotice({ tone: 'success', text: tl(data.message) });
    } catch (error: unknown) {
      setNotice({
        tone: 'error',
        text: getErrorMessage(error, t('shop.buyError')),
      });
    } finally {
      setPendingItemId(null);
    }
  };

  if (isLoading) {
    return <p className="shop-loading">{t('shop.loading')}</p>;
  }

  if (loadError) {
    return (
      <div className="stats-card">
        <Message tone="error">{loadError}</Message>
      </div>
    );
  }

  if (!hero) {
    return <p className="shop-loading">{t('shop.needsHero')}</p>;
  }

  return (
    <div className="stats-card">
      <div className="shop-header">
        <h3>🏪 {t('shop.title')}</h3>
        <span className="gold-display">🪙 {t('shop.gold', { value: hero.gold })}</span>
      </div>

      {items.length === 0 ? (
        <p className="shop-empty">{t('shop.empty')}</p>
      ) : (
        <div className="shop-items">
          {items.map((item) => {
            const isPending = pendingItemId === item.id;
            const canAfford = hero.gold >= item.cost;

            return (
              <div key={item.id} className="shop-item">
                <div className="item-info">
                  <h4>{t(item.nameKey)}</h4>
                  <p>{t(item.descriptionKey)}</p>
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
                    {isPending ? t('shop.buying') : t('shop.buy')}
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