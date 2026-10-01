import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { kingdomApi } from '../api/api';
import { getErrorMessage, isNotFound } from '../api/errors';
import { useTranslation } from '../i18n/useI18n';
import type { KingdomData, TrainArmyResult, UpgradeBuildingResult, UserSession } from '../types';
import { KingdomCard } from '../components/KingdomCard';
import { Message, type MessageTone } from '../components/Message';
import { getBuildingDetails } from '../components/buildings';
import './CastlePage.css';

type KingdomLoadState = 'loading' | 'ready' | 'missing' | 'error';

interface Notice {
  tone: MessageTone;
  text: string;
}

/**
 * Decide que estado de carga corresponde a una respuesta de Kingdom.
 * Un 404 no es un fallo: es una cuenta sin reino todavia, y lo mas util es
 * ofrecer fundarlo en lugar de mostrar un error. Cualquier otro problema (el
 * servicio apagado, un 500) si es un fallo real y necesita reintento.
 */
const useKingdomLoad = (userId: string, t: (key: string) => string) => {
  const [loadState, setLoadState] = useState<KingdomLoadState>('loading');
  const [kingdom, setKingdom] = useState<KingdomData | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isActive = true;

    kingdomApi
      .get<KingdomData>(`/api/kingdoms/${userId}`)
      .then(({ data }) => {
        if (isActive) {
          setKingdom(data);
          setLoadError('');
          setLoadState('ready');
        }
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setKingdom(null);

        if (isNotFound(error)) {
          setLoadError('');
          setLoadState('missing');
          return;
        }

        setLoadError(getErrorMessage(error, t('kingdom.loadError')));
        setLoadState('error');
      });

    return () => {
      isActive = false;
    };
  }, [userId, reloadKey, t]);

  return {
    loadState,
    kingdom,
    loadError,
    /** Vuelve a leer el reino tras una mutacion. Los recursos se acumulan en cada lectura. */
    refresh: useCallback(async (targetUserId: string) => {
      try {
        const { data } = await kingdomApi.get<KingdomData>(`/api/kingdoms/${targetUserId}`);
        setKingdom(data);
        setLoadError('');
        setLoadState('ready');
      } catch (error: unknown) {
        if (isNotFound(error)) {
          setLoadError('');
          setLoadState('missing');
          return;
        }

        setLoadError(getErrorMessage(error, t('kingdom.loadError')));
        setLoadState('error');
      }
    }, [t]),
    retry: () => {
      setLoadState('loading');
      setLoadError('');
      setReloadKey((current) => current + 1);
    },
  };
};

export const CastlePage = () => {
  const { t, tl } = useTranslation();
  const { userId } = useOutletContext<UserSession>();
  const { loadState, kingdom, loadError, refresh, retry } = useKingdomLoad(userId, t);
  const [notice, setNotice] = useState<Notice | null>(null);
  // Identifica la accion en curso. Los controles se deshabilitan mientras haya
  // una, para que un doble clic no construya ni entrene dos veces.
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const runAction = async (action: string, run: () => Promise<string>) => {
    setNotice(null);
    setPendingAction(action);

    try {
      const success = await run();
      await refresh(userId);
      setNotice({ tone: 'success', text: success });
    } catch (error: unknown) {
      setNotice({
        tone: 'error',
        text: getErrorMessage(error, t('kingdom.actionError')),
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleCreateKingdom = async () => {
    await runAction('create', async () => {
      await kingdomApi.post('/api/kingdoms', { userId });
      return t('kingdom.created');
    });
  };

  const handleAddBuilding = async (type: number) => {
    const labelKey = getBuildingDetails(type)?.nameKey ?? 'building.fallback';

    await runAction(`build-${type}`, async () => {
      await kingdomApi.post(`/api/kingdoms/${userId}/buildings`, { buildingType: type });
      return t('kingdom.built', { building: t(labelKey) });
    });
  };

  const handleUpgradeBuilding = async (type: number) => {
    const labelKey = getBuildingDetails(type)?.nameKey ?? 'building.fallback';

    await runAction(`upgrade-${type}`, async () => {
      const { data } = await kingdomApi.post<UpgradeBuildingResult>(
        `/api/kingdoms/${userId}/buildings/upgrade`,
        { buildingType: type },
      );
      return t('kingdom.upgraded', { building: t(labelKey), level: data.newLevel });
    });
  };

  const handleTrainArmy = async (amount: number) => {
    await runAction(`train-${amount}`, async () => {
      const { data } = await kingdomApi.post<TrainArmyResult>(
        `/api/kingdoms/${userId}/army/train`,
        { amount },
      );
      // El servidor devuelve la clave del mensaje y sus argumentos ya resueltos.
      return tl(data.message);
    });
  };

  if (loadState === 'loading') {
    return (
      <div className="castle-page">
        <p className="castle-loading">{t('kingdom.loading')}</p>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="castle-page">
        <Message tone="error">{loadError}</Message>
        <button type="button" className="castle-retry" onClick={retry}>
          {t('gate.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="castle-page">
      <KingdomCard
        kingdom={kingdom}
        isBusy={pendingAction !== null}
        onCreate={handleCreateKingdom}
        onBuild={handleAddBuilding}
        onUpgrade={handleUpgradeBuilding}
        onTrain={handleTrainArmy}
      />
      {notice && <Message tone={notice.tone}>{notice.text}</Message>}
    </div>
  );
};