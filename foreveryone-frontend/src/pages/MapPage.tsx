import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { heroesApi } from '../api/api';
import { getErrorMessage } from '../api/errors';
import { BattlePanel } from '../components/BattlePanel';
import { Message } from '../components/Message';
import { WorldMap } from '../components/WorldMap';
import { useHero } from '../hooks/useHero';
import { useTranslation } from '../i18n/useI18n';
import type { UserSession, ZoneOption } from '../types';
import './MapPage.css';

const healthPercent = (current: number, max: number) =>
  max === 0 ? 0 : Math.max(0, Math.min(100, Math.round((current / max) * 100)));

export const MapPage = () => {
  const { t } = useTranslation();
  const { userId } = useOutletContext<UserSession>();
  const { hero, loadError, restError, isResting, refresh, rest } = useHero(userId);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [mapError, setMapError] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Las zonas son catalogo del dominio: llegan enteras y con sus enemigos, asi
  // que el cliente no decide que rival pertenece a que zona.
  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const { data } = await heroesApi.get<ZoneOption[]>('/api/heroes/zones');
        if (!isActive) return;
        setZones(data);
        // Al abrir el mapa se entra en la primera zona, que es la de menor
        // dificultad. El jugador puede cambiar a cualquier otra.
        setSelectedKey((current) => current ?? data[0]?.key ?? null);
      } catch (error: unknown) {
        if (isActive) setMapError(getErrorMessage(error, t('map.loadError')));
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [t]);

  const selectedZone = zones.find((zone) => zone.key === selectedKey) ?? null;
  const isDefeated = hero !== null && hero.currentHealth === 0;

  if (loadError) return <Message tone="error">{loadError}</Message>;
  if (mapError) return <Message tone="error">{mapError}</Message>;

  return (
    <div className="map-page">
      <header className="map-header">
        <h2>🗺️ {t('map.title')}</h2>
        <p>{t('map.subtitle')}</p>
      </header>

      {/* Vitals del heroe: el mapa decide si puede luchar, asi que necesita saber
          cuanto le queda. Sin nombre ni ficha completa, que para eso esta la
          pagina de heroe. */}
      {hero && (
        <section className="map-vitals" aria-label={t('hero.healthLabel')}>
          <span className="map-vital">
            <small>{t('hero.healthLabel')}</small>
            <strong>{t('map.vitals', { value: hero.currentHealth, max: hero.health })}</strong>
            <span
              className="map-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={hero.health}
              aria-valuenow={hero.currentHealth}
            >
              <i style={{ width: `${healthPercent(hero.currentHealth, hero.health)}%` }} />
            </span>
          </span>
          <span className="map-vital">
            <small>{t('nav.hero')}</small>
            <strong>{t('map.level', { level: hero.level })}</strong>
          </span>
          {isDefeated ? (
            <button type="button" className="map-rest" onClick={rest} disabled={isResting}>
              🛏️ {isResting ? t('hero.resting') : t('hero.rest')}
            </button>
          ) : (
            <span className="map-ready">{t('map.ready')}</span>
          )}
        </section>
      )}

      <WorldMap zones={zones} selectedKey={selectedKey} onSelect={setSelectedKey} />

      {restError && <Message tone="error">{restError}</Message>}

      {selectedZone ? (
        <section className="map-zone" aria-label={t(selectedZone.nameKey)}>
          <header className="map-zone-header">
            <h3>{t(selectedZone.nameKey)}</h3>
            <p>{t(selectedZone.descriptionKey)}</p>
          </header>
          {selectedZone.enemies.length === 0 ? (
            <p className="map-zone-empty">{t('map.emptyZone')}</p>
          ) : (
            <BattlePanel
              userId={userId}
              enemies={selectedZone.enemies}
              disabled={isDefeated}
              onBattleFinished={refresh}
            />
          )}
        </section>
      ) : (
        zones.length === 0 && <p className="map-zone-empty">{t('map.selectZone')}</p>
      )}
    </div>
  );
};