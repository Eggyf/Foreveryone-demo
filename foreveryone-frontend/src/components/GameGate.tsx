import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { heroesApi } from '../api/api';
import type { UserSession } from '../types';
import { CharacterCreation } from './CharacterCreation';
import './GameGate.css';

type GateState = 'checking' | 'ready' | 'needs-creation' | 'error';

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
  const { userId } = user;
  const [result, setResult] = useState<{ userId: string; state: GateState } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isActive = true;

    heroesApi
      .get(`/api/heroes/${userId}`)
      .then((response) => {
        if (isActive) {
          setResult({ userId, state: response.data ? 'ready' : 'needs-creation' });
        }
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        // 404 = todavia no hay heroe. Cualquier otro fallo es un problema real.
        const isMissing = isAxiosError(error) && error.response?.status === 404;
        setResult({ userId, state: isMissing ? 'needs-creation' : 'error' });
      });

    return () => {
      isActive = false;
    };
  }, [userId, attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  const state: GateState = !userId ? 'error' : result?.userId === userId ? result.state : 'checking';

  if (state === 'checking') {
    return (
      <div className="gate-screen">
        <p className="gate-loading">Buscando tu destino en Foreveryone…</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="gate-screen">
        <p className="gate-error">
          No se pudo comprobar si ya tienes personaje. Comprueba que los servicios
          estén encendidos.
        </p>
        <button type="button" className="gate-retry" onClick={retry}>
          Reintentar
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
