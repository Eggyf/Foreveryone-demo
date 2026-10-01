import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/useI18n';
import './NotFoundPage.css';

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <section className="not-found">
      <span aria-hidden="true">🧭</span>
      <h2>{t('notFound.title')}</h2>
      <Link to="/hero" className="not-found-link">
        {t('notFound.back')}
      </Link>
    </section>
  );
};