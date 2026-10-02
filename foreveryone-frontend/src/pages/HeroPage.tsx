import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { HeroCard, HeroLoadingCard } from '../components/HeroCard';
import { Message, type MessageTone } from '../components/Message';
import { useHero } from '../hooks/useHero';
import { useTranslation } from '../i18n/useI18n';
import type { UserSession } from '../types';
import './HeroPage.css';

interface Notice {
  tone: MessageTone;
  text: string;
}

/**
 * Ficha del heroe: quien es, como esta y como se recupera. Los rivales y el
 * combate viven en la pagina del mapa.
 */
export const HeroPage = () => {
  const { tl } = useTranslation();
  const { userId, displayName } = useOutletContext<UserSession>();
  const { hero, isLoading, loadError, restError, isResting, rest } = useHero(userId);
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleRest = async () => {
    setNotice(null);
    // El mensaje del servidor llega como clave con argumentos: se compone aqui.
    const result = await rest();
    if (result) setNotice({ tone: 'success', text: tl(result.message) });
  };

  return (
    <div className="hero-page">
      {loadError ? (
        <Message tone="error">{loadError}</Message>
      ) : isLoading ? (
        <HeroLoadingCard displayName={displayName} />
      ) : (
        hero && (
          <HeroCard
            hero={hero}
            displayName={displayName}
            isResting={isResting}
            onRest={handleRest}
          />
        )
      )}
      {notice && <Message tone={notice.tone}>{notice.text}</Message>}
      {restError && <Message tone="error">{restError}</Message>}
    </div>
  );
};