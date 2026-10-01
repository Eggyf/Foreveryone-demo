import { useCallback, useEffect, useState } from 'react';
import { heroesApi } from '../api/api';
import { getErrorMessage, isNotFound } from '../api/errors';
import { useTranslation } from '../i18n/useI18n';
import type { UserSession } from '../types';
import { CharacterCreation } from './CharacterCreation';
import './GameGate.css';

type GateState = 'checking' | 'ready' | 'needs-creation' | 'invalid-session' | 'error';

interface GameGateProps {
  user: UserSession;
  onSessionExpired: () => void;
  children: React.ReactNode;
}

/**
 * Impide entrar al juego sin personaje. Consulta unicamente en Heroes:
 * un 404 significa "todavia no tienes heroe" y lleva al asistente de creacion.
 *
 * No se comprueba la existencia de la cuenta aqui a proposito. Doinglo
 * dependia de un segundo servicio, de modo que cualquier problema de red con
 * Identity bloqueaba el juego con un mensaje de sesion invalida nada mas
 * entrar. Si la cuenta realmente no existe, el POST de creacion devuelve 404
 * y CharacterCreation lo muestra con la opcion de cerrar sesion.
 */
export const GameGate = ({ user, onSessionExpired, children }: GameGateProps) => {
  const { t } = useTranslation();
  const { userId } = user;
  const [result, setResult] = useState<{ userId: string; state: GateState; detail: string } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Sin `userId` no hay nada que consultar: el token no trajo un `sub` util.
    if (!userId) {
      return;
    }

    let isActive = true;

    heroesApi
      .get(`/api/heroes/${userId}`)
      .then((response) => {
        if (isActive) {
          setResult({ userId, state: response.data ? 'ready' : 'needs-creation', detail: '' });
        }
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        // 404 = todavia no hay heroe. Cualquier otro fallo es un problema real.
        setResult(
          isNotFound(error)
            ? { userId, state: 'needs-creation', detail: '' }
            : { userId, state: 'error', detail: getErrorMessage(error, t('gate.checkFailed')) },
        );
      });

    return () => {
      isActive = false;
    };
  }, [userId, attempt, t]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  const state: GateState = !userId
    ? 'invalid-session'
    : result?.userId === userId
      ? result.state
      : 'checking';

  if (state === 'checking') {
    return (
      <div className="gate-screen">
        <p className="gate-loading">{t('gate.searching')}</p>
      </div>
    );
  }

  // El token existe pero no identifica a un usuario legible. Ningun servicio
  // lo aceptara, asi que la unica salida util es volver al login.
  if (state === 'invalid-session') {
    return (
      <div className="gate-screen">
        <p className="gate-error">{t('gate.invalidSession')}</p>
        <button type="button" className="gate-retry" onClick={onSessionExpired}>
          {t('gate.backToLogin')}
        </button>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="gate-screen">
        <p className="gate-error">{result?.detail || t('gate.checkFailed')}</p>
        <button type="button" className="gate-retry" onClick={retry}>
          {t('gate.retry')}
        </button>
      </div>
    );
  }

  if (state === 'needs-creation') {
    return (
      <CharacterCreation
        user={user}
        onCreated={retry}
        onSessionExpired={onSessionExpired}
      />
    );
  }

  return <>{children}</>;
};