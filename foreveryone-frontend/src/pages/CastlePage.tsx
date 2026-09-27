import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { kingdomApi } from '../api/api';
import { getErrorMessage, isNotFound } from '../api/errors';
import type { KingdomData, UserSession } from '../types';
import { KingdomCard } from '../components/KingdomCard';
import { Message, type MessageTone } from '../components/Message';
import { getBuildingDetails } from '../components/buildings';
import './CastlePage.css';

type KingdomLoadState = 'loading' | 'ready' | 'missing' | 'error';

interface Notice {
  tone: MessageTone;
  text: string;
}

interface UpgradeBuildingResult {
  buildingName: string;
  newLevel: number;
}

interface TrainArmyResult {
  armySize: number;
  militaryPower: number;
  message: string;
}

/**
 * Decide que estado de carga corresponde a una respuesta de Kingdom.
 * Un 404 no es un fallo: es una cuenta sin reino todavia, y lo mas util es
 * ofrecer fundarlo en lugar de mostrar un error. Cualquier otro problema (el
 * servicio apagado, un 500) si es un fallo real y necesita reintento.
 */
const toLoadState = (error: unknown): { state: KingdomLoadState; detail: string } => {
  if (isNotFound(error)) {
    return { state: 'missing', detail: '' };
  }

  return { state: 'error', detail: getErrorMessage(error, 'No se pudo cargar tu reino.') };
};

export const CastlePage = () => {
  const { userId } = useOutletContext<UserSession>();
  const [loadState, setLoadState] = useState<KingdomLoadState>('loading');
  const [kingdom, setKingdom] = useState<KingdomData | null>(null);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Identifica la accion en curso. Los controles se deshabilitan mientras haya
  // una, para que un doble clic no construya ni entrene dos veces.
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Carga inicial y reintentos manuales. El estado vuelve a 'loading' desde el
  // boton de reintento, no aqui: un setState sincronico dentro del efecto
  // provoke un render en cascada.
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
        const { state, detail } = toLoadState(error);
        setLoadError(detail);
        setLoadState(state);
      });

    return () => {
      isActive = false;
    };
  }, [userId, reloadKey]);

  const retry = () => {
    setLoadState('loading');
    setLoadError('');
    setReloadKey((current) => current + 1);
  };

  /** Vuelve a leer el reino tras una mutacion. Los recursos se acumulan en cada lectura. */
  const refreshKingdom = useCallback(async (targetUserId: string) => {
    try {
      const { data } = await kingdomApi.get<KingdomData>(`/api/kingdoms/${targetUserId}`);
      setKingdom(data);
      setLoadError('');
      setLoadState('ready');
    } catch (error: unknown) {
      const { state, detail } = toLoadState(error);
      setLoadError(detail);
      setLoadState(state);
    }
  }, []);

  const runAction = async (action: string, targetUserId: string, run: () => Promise<string>) => {
    setNotice(null);
    setPendingAction(action);

    try {
      const success = await run();
      await refreshKingdom(targetUserId);
      setNotice({ tone: 'success', text: success });
    } catch (error: unknown) {
      setNotice({
        tone: 'error',
        text: getErrorMessage(error, 'No se pudo completar la acción.'),
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleCreateKingdom = async () => {
    await runAction('create', userId, async () => {
      await kingdomApi.post('/api/kingdoms', { userId });
      return 'Tu reino ha sido fundado.';
    });
  };

  const handleAddBuilding = async (type: number) => {
    const label = getBuildingDetails(type)?.label ?? 'Edificio';

    await runAction(`build-${type}`, userId, async () => {
      await kingdomApi.post(`/api/kingdoms/${userId}/buildings`, { buildingType: type });
      return `${label} construida.`;
    });
  };

  const handleUpgradeBuilding = async (type: number) => {
    const label = getBuildingDetails(type)?.label ?? 'Edificio';

    await runAction(`upgrade-${type}`, userId, async () => {
      const { data } = await kingdomApi.post<UpgradeBuildingResult>(
        `/api/kingdoms/${userId}/buildings/upgrade`,
        { buildingType: type },
      );
      return `${label} mejorada al nivel ${data.newLevel}.`;
    });
  };

  const handleTrainArmy = async (amount: number) => {
    await runAction(`train-${amount}`, userId, async () => {
      // El backend ya devuelve un mensaje en castellano: se reutiliza tal cual.
      const { data } = await kingdomApi.post<TrainArmyResult>(
        `/api/kingdoms/${userId}/army/train`,
        { amount },
      );
      return data.message;
    });
  };

  if (loadState === 'loading') {
    return (
      <div className="castle-page">
        <p className="castle-loading">Rastreando las tierras de tu reino…</p>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="castle-page">
        <Message tone="error">{loadError}</Message>
        <button type="button" className="castle-retry" onClick={retry}>
          Reintentar
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
