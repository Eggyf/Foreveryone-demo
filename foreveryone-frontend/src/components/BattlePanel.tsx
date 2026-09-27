import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { heroesApi } from '../api/api';
import type { BattleActionId, BattleState, EnemyOption } from '../types';
import './BattlePanel.css';

// Iconos en el cliente: el dominio no depende de la presentacion.
const ENEMY_ICONS: Record<string, string> = {
  goblin: '👺',
  wolf: '🐺',
  ogre: '👹',
};

const getEnemyIcon = (key: string) => ENEMY_ICONS[key.toLowerCase()] ?? '💀';

const getErrorMessage = (error: unknown, fallback: string): string =>
  isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;

const healthPercent = (current: number, max: number) =>
  max === 0 ? 0 : Math.max(0, Math.min(100, Math.round((current / max) * 100)));

interface BattlePanelProps {
  userId: string;
  disabled: boolean;
  onBattleFinished: () => void;
}

export const BattlePanel = ({ userId, disabled, onBattleFinished }: BattlePanelProps) => {
  const [enemies, setEnemies] = useState<EnemyOption[]>([]);
  const [loadError, setLoadError] = useState('');
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  // Al montar se recupera el combate en curso, para poder retomarlo si el
  // jugador recarga la pagina a mitad de pelea.
  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const { data } = await heroesApi.get<EnemyOption[]>('/api/heroes/enemies');
        if (!isActive) return;
        setEnemies(data);
      } catch (err: unknown) {
        if (isActive) setLoadError(getErrorMessage(err, 'No se pudieron cargar los enemigos.'));
        return;
      }

      try {
        const { data } = await heroesApi.get<BattleState>(`/api/heroes/${userId}/battle`);
        if (isActive) setBattle(data);
      } catch {
        // 404 significa que no hay combate abierto: es el caso normal.
      }
    };

    load();
    return () => { isActive = false; };
  }, [userId]);

  const refreshHero = useCallback(() => {
    onBattleFinished();
  }, [onBattleFinished]);

  const startBattle = async (enemyKey: string) => {
    setError('');
    setIsBusy(true);
    try {
      const { data } = await heroesApi.post<BattleState>(`/api/heroes/${userId}/battle`, { enemyKey });
      setBattle(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo iniciar el combate.'));
    } finally {
      setIsBusy(false);
    }
  };

  const playTurn = async (action: BattleActionId) => {
    if (!battle) return;
    setError('');
    setIsBusy(true);
    try {
      const { data } = await heroesApi.post<BattleState>(
        `/api/heroes/${userId}/battle/${battle.battleId}/turn`,
        { action },
      );
      setBattle(data);
      if (data.finished) refreshHero();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo jugar el turno.'));
    } finally {
      setIsBusy(false);
    }
  };

  if (loadError) return <p className="battle-error">{loadError}</p>;

  return (
    <section className="battle-panel" aria-label="Batallas por turnos">
      <header className="battle-header">
        <h3>⚔️ Batallas</h3>
        <p>Elige a tu rival. En cada turno decides cómo atacar.</p>
      </header>

      {!battle && (
        <>
          <div className="battle-enemies">
            {enemies.map((enemy) => (
              <button
                type="button"
                key={enemy.key}
                className="battle-enemy"
                onClick={() => startBattle(enemy.key)}
                disabled={disabled || isBusy}
              >
                <span className="battle-enemy-icon" aria-hidden="true">{getEnemyIcon(enemy.key)}</span>
                <strong>{enemy.name}</strong>
                <span className="battle-enemy-stats">
                  <i>❤️ {enemy.health}</i>
                  <i>💥 {enemy.attack}</i>
                  <i>🛡️ {enemy.defense}</i>
                </span>
                <span className="battle-enemy-rewards">
                  ✨ {enemy.experienceReward} exp · 🪙 {enemy.goldReward} oro
                </span>
              </button>
            ))}
          </div>
          {disabled && <p className="battle-hint">Tu héroe está derrotado. Descansa para volver a luchar.</p>}
        </>
      )}

      {battle && (
        <div className={`battle-arena${battle.finished ? (battle.victory ? ' is-victory' : ' is-defeat') : ''}`}>
          <header className="battle-enemy-head">
            <span className="battle-enemy-icon" aria-hidden="true">{getEnemyIcon(battle.enemyKey)}</span>
            <div className="battle-fighter">
              <strong>{battle.enemyName}</strong>
              <div
                className="battle-track"
                role="progressbar"
                aria-label={`Vida de ${battle.enemyName}`}
                aria-valuemin={0}
                aria-valuemax={battle.enemyMaxHealth}
                aria-valuenow={battle.enemyHealth}
              >
                <span style={{ width: `${healthPercent(battle.enemyHealth, battle.enemyMaxHealth)}%` }} />
              </div>
              <small>{battle.enemyHealth} / {battle.enemyMaxHealth} · 💥 {battle.enemyAttack} · 🛡️ {battle.enemyDefense}</small>
            </div>
          </header>

          <div className="battle-hero-head">
            <span className="battle-fighter">
              <strong>Tu héroe</strong>
              <div
                className="battle-track is-hero"
                role="progressbar"
                aria-label="Vida de tu héroe"
                aria-valuemin={0}
                aria-valuemax={battle.heroMaxHealth}
                aria-valuenow={battle.heroHealth}
              >
                <span style={{ width: `${healthPercent(battle.heroHealth, battle.heroMaxHealth)}%` }} />
              </div>
              <small>{battle.heroHealth} / {battle.heroMaxHealth} · 💥 {battle.heroAttack} · 🛡️ {battle.heroDefense}</small>
            </span>
            <span className="battle-turn-badge">Turno {battle.round + 1}</span>
          </div>

          {!battle.finished && (
            <div className="battle-choices">
              {battle.actions.map((option) => (
                <button
                  type="button"
                  key={option.action}
                  className={`battle-choice${option.action === 2 ? ' is-skill' : ''}`}
                  onClick={() => playTurn(option.action)}
                  disabled={!option.available || isBusy}
                >
                  <strong>{option.name}</strong>
                  <span className="battle-choice-damage">💥 {option.damage} de daño</span>
                  <span className="battle-choice-desc">{option.description}</span>
                  {option.action === 2 && (
                    <span className="battle-choice-uses">
                      Usos: {option.usesLeft}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {battle.finished && (
            <div className="battle-outcome">
              <strong>{battle.victory ? '🏆 ¡Victoria!' : '💀 Derrota'}</strong>
              <p>{battle.message}</p>
              {battle.victory && (
                <span className="battle-rewards">
                  ✨ {battle.experienceGained} exp · 🪙 {battle.goldGained} oro
                </span>
              )}
              <button
                type="button"
                className="battle-again"
                onClick={() => { setBattle(null); setError(''); }}
              >
                Volver a elegir rival
              </button>
            </div>
          )}

          {error && <p className="battle-error">{error}</p>}

          {battle.rounds.length > 0 && (
            <ol className="battle-log" aria-label="Turnos de la batalla">
              {battle.rounds.map((round) => (
                <li key={round.round}>
                  <span className="battle-round-number">{round.round}</span>
                  <span className="battle-round-text">{round.message}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
};
