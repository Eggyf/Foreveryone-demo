import { useEffect, useState } from 'react';
import { heroesApi } from '../api/api';
import { getErrorMessage } from '../api/errors';
import { useTranslation } from '../i18n/useI18n';
import type { BattleActionOption, BattleState, EnemyOption } from '../types';
import './BattlePanel.css';
import { Icon, type IconName } from './Icon';

// Iconos en el cliente: el dominio no depende de la presentacion.
const ENEMY_ICONS: Record<string, IconName> = {
  goblin: 'enemyGoblin',
  spider: 'enemySpider',
  treant: 'enemyTreant',
  bat: 'enemyBat',
  slime: 'enemySlime',
  troll: 'enemyTroll',
  skeleton: 'enemySkeleton',
  wraith: 'enemyWraith',
  golem: 'enemyGolem',
};

const FALLBACK_ENEMY_ICON: IconName = 'enemyGoblin';

const healthPercent = (current: number, max: number) =>
  max === 0 ? 0 : Math.max(0, Math.min(100, Math.round((current / max) * 100)));

interface BattlePanelProps {
  userId: string;
  /**
   * Rivales de la zona activa. Los elige el mapa, no este componente: el dominio
   * manda las zonas con sus enemigos ya anidados y aqui solo se combate contra lo
   * que le pasen.
   */
  enemies: EnemyOption[];
  disabled: boolean;
  onBattleFinished: () => void;
}

export const BattlePanel = ({ userId, enemies, disabled, onBattleFinished }: BattlePanelProps) => {
  const { t, tl } = useTranslation();
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const getEnemyIcon = (key: string): IconName =>
  ENEMY_ICONS[key.toLowerCase()] ?? FALLBACK_ENEMY_ICON;

  // Al montar se recupera el combate en curso, para poder retomarlo si el
  // jugador recarga la pagina a mitad de pelea.
  useEffect(() => {
    let isActive = true;

    const load = async () => {
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

  const startBattle = async (enemyKey: string) => {
    setError('');
    setIsBusy(true);
    try {
      const { data } = await heroesApi.post<BattleState>(`/api/heroes/${userId}/battle`, {
        userId,
        enemyKey,
      });
      setBattle(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('battle.startError')));
    } finally {
      setIsBusy(false);
    }
  };

  const playTurn = async (action: number) => {
    if (!battle) return;
    setError('');
    setIsBusy(true);
    try {
      const { data } = await heroesApi.post<BattleState>(
        `/api/heroes/${userId}/battle/${battle.battleId}/turn`,
        { userId, battleId: battle.battleId, action },
      );
      setBattle(data);
      if (data.finished) {
        // El combate ya no admite mas turnos; el heroe quedo actualizado en el
        // servidor y hay que reflejarlo en la tarjeta de arriba.
        onBattleFinished();
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('battle.turnError')));
    } finally {
      setIsBusy(false);
    }
  };

  const enemyName = battle ? t(battle.enemyNameKey) : '';

  return (
    <section className="battle-panel" aria-label={t('battle.label')}>
      <header className="battle-header">
        <h3>{t('battle.title')}</h3>
        <p>{t('battle.subtitle')}</p>
      </header>

      {!battle && enemies.length === 0 && (
        <p className="battle-hint">{t('battle.noEnemies')}</p>
      )}

      {!battle && enemies.length > 0 && (
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
                <span className="battle-enemy-icon" aria-hidden="true">
                  <Icon name={getEnemyIcon(enemy.key)} size={26} />
                </span>
                <strong>{t(enemy.nameKey)}</strong>
                <span className="battle-enemy-stats">
                  <i><Icon name="health" size={13} /> {enemy.health}</i>
                  <i><Icon name="attack" size={13} /> {enemy.attack}</i>
                  <i><Icon name="defense" size={13} /> {enemy.defense}</i>
                </span>
                <span className="battle-enemy-rewards">
                  <Icon name="plus" size={13} /> {t('battle.exp', { value: enemy.experienceReward })}
                  {' · '}
                  <Icon name="coin" size={13} /> {t('battle.gold', { value: enemy.goldReward })}
                </span>
              </button>
            ))}
          </div>
          {disabled && <p className="battle-hint">{t('battle.heroDefeated')}</p>}
        </>
      )}

      {battle && (
        <div
          className={`battle-arena${battle.finished ? (battle.victory ? ' is-victory' : ' is-defeat') : ''}`}
        >
          <header className="battle-enemy-head">
            <span className="battle-enemy-icon" aria-hidden="true">
              {getEnemyIcon(battle.enemyKey)}
            </span>
            <div className="battle-fighter">
              <strong>{enemyName}</strong>
              <div
                className="battle-track"
                role="progressbar"
                aria-label={`${t('hero.healthLabel')}: ${enemyName}`}
                aria-valuemin={0}
                aria-valuemax={battle.enemyMaxHealth}
                aria-valuenow={battle.enemyHealth}
              >
                <span style={{ width: `${healthPercent(battle.enemyHealth, battle.enemyMaxHealth)}%` }} />
              </div>
              <small>
                {battle.enemyHealth} / {battle.enemyMaxHealth} · <Icon name="attack" size={13} /> {battle.enemyAttack} · <Icon name="defense" size={13} />{' '}
                {battle.enemyDefense}
              </small>
            </div>
          </header>

          <div className="battle-hero-head">
            <span className="battle-fighter">
              <strong>{t('battle.yourHero')}</strong>
              <div
                className="battle-track is-hero"
                role="progressbar"
                aria-label={t('battle.heroHealthLabel')}
                aria-valuemin={0}
                aria-valuemax={battle.heroMaxHealth}
                aria-valuenow={battle.heroHealth}
              >
                <span style={{ width: `${healthPercent(battle.heroHealth, battle.heroMaxHealth)}%` }} />
              </div>
              <small>
                {battle.heroHealth} / {battle.heroMaxHealth} · <Icon name="attack" size={13} /> {battle.heroAttack} · <Icon name="defense" size={13} />{' '}
                {battle.heroDefense}
              </small>
            </span>
            {battle.heroMaxMana > 0 && (
              <span className="battle-fighter battle-mana">
                <strong><Icon name="mana" size={13} /> {t('creation.mana')}</strong>
                <div
                  className="battle-track is-mana"
                  role="progressbar"
                  aria-label={t('battle.heroManaLabel')}
                  aria-valuemin={0}
                  aria-valuemax={battle.heroMaxMana}
                  aria-valuenow={battle.heroMana}
                >
                  <span style={{ width: `${healthPercent(battle.heroMana, battle.heroMaxMana)}%` }} />
                </div>
                <small>{battle.heroMana} / {battle.heroMaxMana}</small>
              </span>
            )}
            <span className="battle-turn-badge">
              {t('battle.turn', { round: battle.round + 1 })}
            </span>
          </div>

          {!battle.finished && (
            <div className="battle-choices">
              {battle.actions.map((option) => (
                <BattleChoice
                  key={option.action}
                  option={option}
                  isBusy={isBusy}
                  onPlay={playTurn}
                />
              ))}
            </div>
          )}

          {battle.finished && (
            <div className="battle-outcome">
              <strong>
                <Icon name={battle.victory ? 'swords' : 'defense'} size={16} />{' '}
                {battle.victory ? t('battle.victory') : t('battle.defeat')}
              </strong>
              <p>{tl(battle.message)}</p>
              {battle.victory && (
                <span className="battle-rewards">
                  <Icon name="plus" size={13} /> {t('battle.exp', { value: battle.experienceGained })}
                  {' · '}
                  <Icon name="coin" size={13} /> {t('battle.gold', { value: battle.goldGained })}
                </span>
              )}
              <button
                type="button"
                className="btn btn-quiet battle-again"
                onClick={() => { setBattle(null); setError(''); }}
              >
                {t('battle.again')}
              </button>
            </div>
          )}

          {error && <p className="battle-error">{error}</p>}

          {battle.rounds.length > 0 && (
            <ol className="battle-log" aria-label={t('battle.logLabel')}>
              {battle.rounds.map((round) => (
                <li key={round.round}>
                  <span className="battle-round-number">{round.round}</span>
                  <span className="battle-round-text">{tl(round.message)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
};

/**
 * Un boton de accion. Todo el balance viene del servidor (nombre, dano, coste de
 * mana, limite de usos y el motivo por el que esta bloqueada), asi que anadir una
 * habilidad nueva en el dominio no obliga a tocar el frontend. Solo el texto se
 * compone en el cliente.
 */
const BattleChoice = ({
  option,
  isBusy,
  onPlay,
}: {
  option: BattleActionOption;
  isBusy: boolean;
  onPlay: (action: number) => void;
}) => {
  const { t, tl } = useTranslation();
  const isBlocked = !option.available;
  const reason = tl(option.unavailableReason);

  return (
    <button
      type="button"
      className={`battle-choice${option.action === 1 ? '' : ' is-skill'}`}
      onClick={() => onPlay(option.action)}
      disabled={isBlocked || isBusy}
      title={reason || t(option.descriptionKey)}
    >
      <strong>{t(option.nameKey)}</strong>
      <span className="battle-choice-damage">
        {option.damage > 0 ? (
          <>
            <Icon name="attack" size={13} /> {t('battle.damageText', { damage: option.damage })}
          </>
        ) : (
          <>
            <Icon name="defense" size={13} /> {t('battle.noDamage')}
          </>
        )}
      </span>
      <span className="battle-choice-desc">{t(option.descriptionKey)}</span>
      <span className="battle-choice-meta">
        {option.manaCost > 0 ? (
          <i><Icon name="mana" size={13} /> {t('battle.manaCost', { cost: option.manaCost })}</i>
        ) : (
          <i>{t('battle.noMana')}</i>
        )}
        {option.usesLimit > 0 && (
          <i>{t('battle.uses', { left: option.usesLeft, limit: option.usesLimit })}</i>
        )}
      </span>
      {isBlocked && reason && (
        <span className="battle-choice-blocked">{reason}</span>
      )}
    </button>
  );
};