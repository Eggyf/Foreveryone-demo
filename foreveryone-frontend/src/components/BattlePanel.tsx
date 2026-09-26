import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { heroesApi } from '../api/api';
import type { BattleResult, EnemyOption } from '../types';
import './BattlePanel.css';

// Iconos en el cliente: el dominio no debe depender de la presentacion.
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

interface BattlePanelProps {
  userId: string;
  disabled: boolean;
  onBattleFinished: () => void;
}

export const BattlePanel = ({ userId, disabled, onBattleFinished }: BattlePanelProps) => {
  const [enemies, setEnemies] = useState<EnemyOption[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isFighting, setIsFighting] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    heroesApi
      .get<EnemyOption[]>('/api/heroes/enemies')
      .then(({ data }) => {
        if (isActive) {
          setEnemies(data);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          setLoadError(getErrorMessage(err, 'No se pudieron cargar los enemigos.'));
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleFight = async (enemyKey: string) => {
    setError('');
    setResult(null);
    setIsFighting(true);

    try {
      const { data } = await heroesApi.post<BattleResult>(`/api/heroes/${userId}/battle`, {
        enemyKey,
      });
      setResult(data);
      onBattleFinished();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo completar la batalla.'));
    } finally {
      setIsFighting(false);
    }
  };

  if (loadError) {
    return <p className="battle-error">{loadError}</p>;
  }

  return (
    <section className="battle-panel" aria-label="Batallas por turnos">
      <header className="battle-header">
        <h3>⚔️ Batallas</h3>
        <p>Elige a tu rival. El más débil da menos oro, pero es más seguro.</p>
      </header>

      <div className="battle-enemies">
        {enemies.map((enemy) => (
          <button
            type="button"
            key={enemy.key}
            className="battle-enemy"
            onClick={() => handleFight(enemy.key)}
            disabled={disabled || isFighting}
          >
            <span className="battle-enemy-icon" aria-hidden="true">
              {getEnemyIcon(enemy.key)}
            </span>
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

      {disabled && !result && (
        <p className="battle-hint">Tu héroe está derrotado. Descansa para volver a luchar.</p>
      )}

      {error && <p className="battle-error">{error}</p>}

      {result && (
        <div className={`battle-result${result.victory ? ' is-victory' : ' is-defeat'}`}>
          <div className="battle-result-head">
            <span className="battle-result-icon" aria-hidden="true">
              {result.victory ? '🏆' : '💀'}
            </span>
            <div>
              <strong>{result.victory ? '¡Victoria!' : 'Derrota'}</strong>
              <p>{result.message}</p>
            </div>
          </div>

          <ol className="battle-log" aria-label="Turnos de la batalla">
            {result.rounds.map((round) => (
              <li key={round.round}>
                <span className="battle-round-number">{round.round}</span>
                <span className="battle-round-text">{round.message}</span>
                <span className="battle-round-hp">
                  Rival {round.enemyHealthRemaining} · Tuyo {round.heroHealthRemaining}
                </span>
              </li>
            ))}
          </ol>

          <div className="battle-rewards">
            {result.victory ? (
              <>
                <span>✨ {result.experienceGained} exp</span>
                <span>🪙 {result.goldGained} oro</span>
                <span>
                  Nivel {result.levelBefore} → {result.levelAfter}
                </span>
              </>
            ) : (
              <span>Necesitas descansar para volver a luchar.</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
