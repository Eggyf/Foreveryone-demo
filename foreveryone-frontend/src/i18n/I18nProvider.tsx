import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { dictionaries } from './dictionaries';
import { interpolate, translateText, I18nContext } from './context';
import type { I18nContextValue } from './context';
import {
  applyDocumentLanguage,
  readLanguage,
  writeLanguage,
  type Language,
} from './language';
import { setActiveLanguage } from './static';

export type { LocalizedText, TranslateArgs } from './context';

/**
 * Provee el idioma activo a toda la aplicacion.
 *
 * Los hooks viven en `useI18n.ts` porque `react-refresh` no admite que un archivo
 * de componente exporte funciones sueltas.
 */
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(readLanguage);

  const setLanguage = useCallback((next: Language) => {
    writeLanguage(next);
    setLanguageState(next);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const messages = dictionaries[language];

    return {
      language,
      setLanguage,
      t: (key, args) => interpolate(messages[key] ?? key, args ?? {}),
      tl: (text) => translateText(messages, text),
    };
  }, [language, setLanguage]);

  // El atributo `lang` mantiene al lector de pantalla y al navegador al tanto, y
  // `setActiveLanguage` deja la traduccion estatica al dia para `api/errors.ts`,
  // que corre fuera del arbol de React.
  useEffect(() => {
    applyDocumentLanguage(language);
    setActiveLanguage(language);
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};