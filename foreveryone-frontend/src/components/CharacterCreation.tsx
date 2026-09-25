import { isAxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { heroesApi } from '../api/api';
import type {
  CharacterClassOption,
  CharacterOptions,
  CharacterRaceOption,
  UserSession,
} from '../types';
import './CharacterCreation.css';

type Step = 'race' | 'class';

const RACE_DETAILS: Record<string, { icon: string; description: string }> = {
  humano: {
    icon: '🧑',
    description: 'Versátil y sin debilidades marcados. Se adapta a cualquier clase.',
  },
  elfo: {
    icon: '🧝',
    description: 'Descendiente de los bosques: certero y mágico, pero frágil cuerpo a cuerpo.',
  },
  enano: {
    icon: '🧔',
    description: 'Forjado en las profundidades: mucha vida y defensa, a costa de su ataque.',
  },
  orco: {
    icon: '👹',
    description: 'Fuerza desbordada y gran vitalidad, con menos defensa y menos maná.',
  },
};

const CLASS_DETAILS: Record<string, { icon: string; description: string }> = {
  warrior: {
    icon: '⚔️',
    description: 'Especialista en combate cuerpo a cuerpo. Aguanta el frente.',
  },
  hunter: {
    icon: '🏹',
    description: 'Experto en ataques a distancia. Precisión y velocidad.',
  },
  wizard: {
    icon: '🔮',
    description: 'Maestro de la magia. Gran daño arcano a cambio de fragilidad.',
  },
  rogue: {
    icon: '🗡️',
    description: 'Sombra letal. equilibra daño y supervivencia con muy poco maná.',
  },
};

interface CharacterCreationProps {
  user: UserSession;
  onCreated: () => void;
  onSessionExpired: () => void;
}

interface ResolvedStats {
  health: number;
  attack: number;
  defense: number;
  mana: number;
}

/**
 * Reproduce el calculo del backend (RaceBonus.Scale) para que la vista previa
 * muestre exactamente las estadisticas con las que se creara el heroe.
 * Math.trunc replica el truncamiento de la division entera de C#.
 */
const resolveStats = (
  base: CharacterClassOption,
  race: CharacterRaceOption,
): ResolvedStats => {
  const scale = (value: number, percent: number) =>
    Math.max(1, value + Math.trunc((value * percent) / 100));

  return {
    health: scale(base.health, race.healthPercent),
    attack: scale(base.attack, race.attackPercent),
    defense: scale(base.defense, race.defensePercent),
    mana: scale(base.mana, race.manaPercent),
  };
};

const formatModifier = (value: number): string =>
  value === 0 ? '—' : `${value > 0 ? '+' : ''}${value}%`;

const getErrorMessage = (error: unknown, fallback: string): string =>
  isAxiosError<{ message?: string; detail?: string }>(error)
    ? error.response?.data?.message || error.response?.data?.detail || fallback
    : fallback;

export const CharacterCreation = ({ user, onCreated, onSessionExpired }: CharacterCreationProps) => {
  const [options, setOptions] = useState<CharacterOptions | null>(null);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState<Step>('race');
  const [selectedRace, setSelectedRace] = useState<CharacterRaceOption | null>(null);
  const [selectedClass, setSelectedClass] = useState<CharacterClassOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [accountMissing, setAccountMissing] = useState(false);

  useEffect(() => {
    let isActive = true;

    heroesApi
      .get<CharacterOptions>('/api/heroes/options')
      .then(({ data }) => {
        if (isActive) {
          setOptions(data);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setLoadError(getErrorMessage(error, 'No se pudieron cargar las razas y clases.'));
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const preview = useMemo(
    () =>
      selectedRace && selectedClass ? resolveStats(selectedClass, selectedRace) : null,
    [selectedRace, selectedClass],
  );

  const handleCreate = async () => {
    if (!selectedRace || !selectedClass) {
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      await heroesApi.post('/api/heroes', {
        userId: user.userId,
        race: selectedRace.id,
        class: selectedClass.id,
      });
      onCreated();
    } catch (error: unknown) {
      // 404 = Heroes no encuentra la cuenta en Identity. El token es de una
      // cuenta borrada o caducada, así que la unica salida es cerrar sesión.
      if (isAxiosError(error) && error.response?.status === 404) {
        setAccountMissing(true);
        setIsSubmitting(false);
        return;
      }

      setFormError(getErrorMessage(error, 'No se pudo crear tu personaje.'));
      setIsSubmitting(false);
    }
  };

  if (accountMissing) {
    return (
      <div className="creation-shell">
        <p className="creation-error">
          Tu cuenta ya no existe en el servidor. Vuelve a iniciar sesión o registra
          una cuenta nueva para continuar.
        </p>
        <button type="button" className="creation-next" onClick={onSessionExpired}>
          Ir al login
        </button>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="creation-shell">
        <p className="creation-error">{loadError}</p>
      </div>
    );
  }

  if (!options) {
    return (
      <div className="creation-shell">
        <p className="creation-loading">Invocando el destino…</p>
      </div>
    );
  }

  const isRaceStep = step === 'race';
  const canConfirm = Boolean(selectedRace && selectedClass) && !isSubmitting;

  return (
    <div className="creation-shell">
      <header className="creation-header">
        <span className="creation-eyebrow">Bienvenido, {user.displayName || 'Aventurero'}</span>
        <h1>Crea tu personaje</h1>
        <p>Foreveryone necesita un héroe. Elige primero tu raza y después tu clase.</p>
      </header>

      <ol className="creation-steps" aria-label="Progreso de creación">
        <li className={isRaceStep ? 'is-active' : 'is-done'}>
          <span>1</span> Raza
        </li>
        <li className={!isRaceStep ? 'is-active' : ''}>
          <span>2</span> Clase
        </li>
      </ol>

      {isRaceStep ? (
        <section className="creation-grid" aria-label="Elige tu raza">
          {options.races.map((race) => {
            const details = RACE_DETAILS[race.name.toLowerCase()];
            const isSelected = selectedRace?.id === race.id;

            return (
              <button
                type="button"
                key={race.id}
                className={`creation-card${isSelected ? ' is-selected' : ''}`}
                onClick={() => setSelectedRace(race)}
                aria-pressed={isSelected}
              >
                <span className="creation-card-icon" aria-hidden="true">
                  {details?.icon ?? '❔'}
                </span>
                <strong className="creation-card-title">{race.name}</strong>
                <span className="creation-card-text">{details?.description}</span>
                <span className="creation-card-mods">
                  <i>Vida {formatModifier(race.healthPercent)}</i>
                  <i>Atq {formatModifier(race.attackPercent)}</i>
                  <i>Def {formatModifier(race.defensePercent)}</i>
                  <i>Maná {formatModifier(race.manaPercent)}</i>
                </span>
              </button>
            );
          })}
        </section>
      ) : (
        <section className="creation-grid" aria-label="Elige tu clase">
          {options.classes.map((heroClass) => {
            const details = CLASS_DETAILS[heroClass.name.toLowerCase()];
            const stats = selectedRace ? resolveStats(heroClass, selectedRace) : null;
            const isSelected = selectedClass?.id === heroClass.id;

            return (
              <button
                type="button"
                key={heroClass.id}
                className={`creation-card${isSelected ? ' is-selected' : ''}`}
                onClick={() => setSelectedClass(heroClass)}
                aria-pressed={isSelected}
              >
                <span className="creation-card-icon" aria-hidden="true">
                  {details?.icon ?? '❔'}
                </span>
                <strong className="creation-card-title">{heroClass.name}</strong>
                <span className="creation-card-text">{details?.description}</span>
                {stats && (
                  <span className="creation-card-stats">
                    <i>❤️ {stats.health}</i>
                    <i>💥 {stats.attack}</i>
                    <i>🛡️ {stats.defense}</i>
                    <i>🔮 {stats.mana}</i>
                  </span>
                )}
              </button>
            );
          })}
        </section>
      )}

      {preview && (
        <div className="creation-preview" aria-live="polite">
          <strong>{selectedRace?.name} {selectedClass?.name}</strong>
          <span>Vida {preview.health} · Ataque {preview.attack} · Defensa {preview.defense} · Maná {preview.mana}</span>
        </div>
      )}

      {formError && <p className="creation-error">{formError}</p>}

      <footer className="creation-actions">
        {!isRaceStep ? (
          <button type="button" className="creation-back" onClick={() => setStep('race')}>
            ← Cambiar raza
          </button>
        ) : (
          <span />
        )}

        {isRaceStep ? (
          <button
            type="button"
            className="creation-next"
            onClick={() => setStep('class')}
            disabled={!selectedRace}
          >
            Continuar con la clase →
          </button>
        ) : (
          <button
            type="button"
            className="creation-next"
            onClick={handleCreate}
            disabled={!canConfirm}
          >
            {isSubmitting ? 'Creando personaje…' : '⚔️ Entrar en Foreveryone'}
          </button>
        )}
      </footer>
    </div>
  );
};
