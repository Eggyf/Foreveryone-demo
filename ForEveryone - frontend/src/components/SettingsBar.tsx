import { useI18n } from '../i18n/useI18n';
import { LANGUAGES, languageLabel } from '../i18n/language';
import { useTheme } from '../i18n/useTheme';
import { useGrid } from '../i18n/useGrid';
import './SettingsBar.css';

/**
 * Selector de idioma, tema y retícula.
 *
 * Vive fuera de `GameLayout` a proposito: `GameLayout` solo existe con sesion
 * iniciada, y sin esto el jugador no podria cambiar de idioma antes de entrar.
 * Los tres controles son elementos de formulario nativos, no botones con imagen:
 * un `<select>` ya tiene el comportamiento de teclado, el anuncio del lector de
 * pantalla y la experiencia de moviles bien resueltos.
 */
export const SettingsBar = () => {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const { grid, setGrid } = useGrid();

  return (
    <div className="settings-bar">
      <label className="settings-field">
        <span className="settings-label">{t('app.language')}</span>
        <select
          className="settings-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value as typeof language)}
        >
          {LANGUAGES.map((option) => (
            <option key={option} value={option}>
              {languageLabel(option)}
            </option>
          ))}
        </select>
      </label>

      <label className="settings-field">
        <span className="settings-label">{t('app.theme')}</span>
        <select
          className="settings-select"
          value={theme}
          onChange={(event) => setTheme(event.target.value as typeof theme)}
        >
          <option value="dark">{t('app.themeDark')}</option>
          <option value="light">{t('app.themeLight')}</option>
        </select>
      </label>

      {/* La retícula es el motivo firmante del mundo visual, pero es un estado
          real y no una textura: aquí se apaga para quien la encuentre ruidosa. */}
      <label className="settings-field">
        <span className="settings-label">{t('app.grid')}</span>
        <select
          className="settings-select"
          value={grid}
          onChange={(event) => setGrid(event.target.value as typeof grid)}
        >
          <option value="on">{t('app.gridOn')}</option>
          <option value="off">{t('app.gridOff')}</option>
        </select>
      </label>
    </div>
  );
};