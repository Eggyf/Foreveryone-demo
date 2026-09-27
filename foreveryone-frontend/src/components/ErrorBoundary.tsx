import { Component, type ErrorInfo, type ReactNode } from 'react';
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
        <h2>Algo se ha roto</h2>
        <p>
          La vista actual no se ha podido dibujar. Puedes recargar la pagina para
          seguir jugando.
        </p>
        <pre className="boundary-detail">{error.message}</pre>
        <div className="boundary-actions">
          <button type="button" className="boundary-retry" onClick={this.reset}>
            Reintentar
          </button>
          <button type="button" className="boundary-reload" onClick={() => window.location.reload()}>
            Recargar la página
          </button>
          {onSessionExpired && (
            <button type="button" className="boundary-logout" onClick={onSessionExpired}>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    );
  }
}
