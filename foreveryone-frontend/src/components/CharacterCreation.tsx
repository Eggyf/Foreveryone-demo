import { useEffect, useMemo, useState } from 'react';
import { heroesApi } from '../api/api';
import { getErrorMessage, isNotFound } from '../api/errors';
import { useTranslation } from '../i18n/useI18n';
import type {
  CharacterClassOption,
  CharacterOptions,
  CharacterRaceOption,
  UserSession,
} from '../types';
import './CharacterCreation.css';

type Step = 'race' | 'class';

/**
 * Iconos y claves de descripcion de las razas y las clases.
 *
 * El servidor devuelve el nombre del enum (`Humano`, `Warrior`), asi que se busca
 * por esa clave en minusculas. Solo se guardan icono y clave de texto: las
 * estadisticas siguen viniendo del API y no se duplican aqui.
 */
const RACE_META: Record<string, { icon: string; descriptionKey: string }> = {
  humano: { icon: '🧑', descriptionKey: 'hero.raceDescription.humano' },
  elfo: { icon: '🧝', descriptionKey: 'hero.raceDescription.elfo' },
  enano: { icon: '🧔', descriptionKey: 'hero.raceDescription.enano' },
  orco: { icon: '👹', descriptionKey: 'hero.raceDescription.orco' },
};

const CLASS_META: Record<string, { icon: string; descriptionKey: string }> = {
  warrior: { icon: '⚔️', descriptionKey: 'hero.classDescription.warrior' },
  hunter: { icon: '🏹', descriptionKey: 'hero.classDescription.hunter' },
  wizard: { icon: '🔮', descriptionKey: 'hero.classDescription.wizard' },
  rogue: { icon: '🗡️', descriptionKey: 'hero.classDescription.rogue' },
};

const FALLBACK_ICON = '❔';

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

/** Nombre localizado de una raza o clase a partir del enum del servidor. */
const localizedOptionName = (
  t: (key: string) => string,
  kind: 'race' | 'class',
  serverName: string,
): string => {
  const key = serverName.toLowerCase();
  const known = (kind === 'race' ? RACE_META[key] : CLASS_META[key]) !== undefined;

  // Si el dominio anade una raza o clase nueva, se muestra el nombre del enum tal
  // cual en vez de dejar la tarjeta a medias con la clave de traduccion a la vista.
  return known ? t(`hero.${kind}.${key}`) : serverName;
};

export const CharacterCreation = ({ user, onCreated, onSessionExpired }: CharacterCreationProps) => {
  const { t } = useTranslation();
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
          setLoadError(getErrorMessage(error, t('creation.loadError')));
        }
      });

    return () => {
      isActive = false;
    };
  }, [t]);

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
      if (isNotFound(error)) {
        setAccountMissing(true);
        setIsSubmitting(false);
        return;
      }

      setFormError(getErrorMessage(error, t('creation.createError')));
      setIsSubmitting(false);
    }
  };

  if (accountMissing) {
    return (
      <div className="creation-shell">
        <p className="creation-error">{t('creation.accountGone')}</p>
        <button type="button" className="creation-next" onClick={onSessionExpired}>
          {t('creation.closeSession')}
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
        <p className="creation-loading">{t('creation.summoning')}</p>
      </div>
    );
  }

  const isRaceStep = step === 'race';
  const canConfirm = Boolean(selectedRace && selectedClass) && !isSubmitting;

  return (
    <div className="creation-shell">
      <header className="creation-header">
        <span className="creation-eyebrow">
          {t('creation.welcome', { name: user.displayName || t('hero.adventurer') })}
        </span>
        <h1>{t('creation.title')}</h1>
        <p>{t('creation.subtitle')}</p>
      </header>

      <ol className="creation-steps" aria-label={t('creation.stepsLabel')}>
        <li className={isRaceStep ? 'is-active' : 'is-done'}>
          <span>1</span> {t('creation.stepRace')}
        </li>
        <li className={!isRaceStep ? 'is-active' : ''}>
          <span>2</span> {t('creation.stepClass')}
        </li>
      </ol>

      {isRaceStep ? (
        <section className="creation-grid" aria-label={t('creation.stepRace')}>
          {options.races.map((race) => {
            const details = RACE_META[race.name.toLowerCase()];
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
                  {details?.icon ?? FALLBACK_ICON}
                </span>
                <strong className="creation-card-title">
                  {localizedOptionName(t, 'race', race.name)}
                </strong>
                <span className="creation-card-text">
                  {details ? t(details.descriptionKey) : null}
                </span>
                <span className="creation-card-mods">
                  <i>{t('creation.health')} {formatModifier(race.healthPercent)}</i>
                  <i>{t('creation.attackShort')} {formatModifier(race.attackPercent)}</i>
                  <i>{t('creation.defenseShort')} {formatModifier(race.defensePercent)}</i>
                  <i>{t('creation.mana')} {formatModifier(race.manaPercent)}</i>
                </span>
              </button>
            );
          })}
        </section>
      ) : (
        <section className="creation-grid" aria-label={t('creation.stepClass')}>
          {options.classes.map((heroClass) => {
            const details = CLASS_META[heroClass.name.toLowerCase()];
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
                  {details?.icon ?? FALLBACK_ICON}
                </span>
                <strong className="creation-card-title">
                  {localizedOptionName(t, 'class', heroClass.name)}
                </strong>
                <span className="creation-card-text">
                  {details ? t(details.descriptionKey) : null}
                </span>
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
          <strong>
            {selectedRace ? localizedOptionName(t, 'race', selectedRace.name) : ''}{' '}
            {selectedClass ? localizedOptionName(t, 'class', selectedClass.name) : ''}
          </strong>
          <span>
            {t('creation.health')} {preview.health} · {t('creation.attack')} {preview.attack} ·{' '}
            {t('creation.defense')} {preview.defense} · {t('creation.mana')} {preview.mana}
          </span>
        </div>
      )}

      {formError && <p className="creation-error">{formError}</p>}

      <footer className="creation-actions">
        {!isRaceStep ? (
          <button type="button" className="creation-back" onClick={() => setStep('race')}>
            ← {t('creation.changeRace')}
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
            {t('creation.continueToClass')} →
          </button>
        ) : (
          <button
            type="button"
            className="creation-next"
            onClick={handleCreate}
            disabled={!canConfirm}
          >
            {isSubmitting
              ? t('creation.creatingCharacter')
              : `⚔️ ${t('creation.enterGame')}`}
          </button>
        )}
      </footer>
    </div>
  );
};