import { useI18n } from '../i18n/useI18n';
import { LANGUAGES, languageLabel } from '../i18n/language';
import { useTheme } from '../i18n/useTheme';
import './SettingsBar.css';

/**
 * Selector de idioma y tema.
 *
 * Vive fuera de `GameLayout` a proposito: `GameLayout` solo existe con sesion
 * iniciada, y sin esto el jugador no podria cambiar de idioma antes de entrar.
 * Los dos controles son elementos de formulario nativos, no botones con imagen:
 * un `<select>` ya tiene el comportamiento de teclado, el anuncio del lector de
 * pantalla y la experiencia de moviles bien resueltos.
 */
export const SettingsBar = () => {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();

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
    </div>
  );
};