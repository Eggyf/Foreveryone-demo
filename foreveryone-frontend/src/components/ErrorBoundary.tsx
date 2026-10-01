import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '../i18n/static';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Se invoca al pulsar "Cerrar sesión" para devolver al login. */
  onSessionExpired?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Sin esto, un fallo de render deja la pantalla en blanco y el jugador no tiene
 * forma de volver al login. Solo atrapa errores de render: los fallos de red ya
 * se resuelven en cada pantalla con `getErrorMessage`.
 *
 * Es un `class component` porque React no admite un error boundary en un hook.
 * Como no puede usar `useTranslation`, traduce con el modulo estatico de i18n,
 * que lee el mismo idioma activo que el provider.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // `no-console` no esta activo, y en desarrollo es la unica traza util
    // cuando algo se rompe dentro de un arbol de React.
    console.error('Error al renderizar Foreveryone', error, info.componentStack);
  }

  private readonly reset = () => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, onSessionExpired } = this.props;

    if (!error) {
      return children;
    }

    return (
      <div className="boundary-screen">
        <h2>{t('error.brokenTitle')}</h2>
        <p>{t('error.brokenBody')}</p>
        <pre className="boundary-detail" aria-label={t('error.detailLabel')}>
          {error.message}
        </pre>
        <div className="boundary-actions">
          <button type="button" className="boundary-retry" onClick={this.reset}>
            {t('error.retry')}
          </button>
          <button type="button" className="boundary-reload" onClick={() => window.location.reload()}>
            {t('error.reload')}
          </button>
          {onSessionExpired && (
            <button type="button" className="boundary-logout" onClick={onSessionExpired}>
              {t('error.closeSession')}
            </button>
          )}
        </div>
      </div>
    );
  }
}