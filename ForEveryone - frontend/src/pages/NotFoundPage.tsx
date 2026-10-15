import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/useI18n';
import '../components/Button.css';
import './NotFoundPage.css';
import { Icon } from '../components/Icon';

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <section className="not-found">
      <span className="not-found-mark" aria-hidden="true">
        <Icon name="compass" size={40} />
      </span>
      <h2>{t('notFound.title')}</h2>
      <Link to="/hero" className="btn btn-primary not-found-link">
        {t('notFound.back')}
      </Link>
    </section>
  );
};