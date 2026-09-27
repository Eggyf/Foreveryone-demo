import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export const NotFoundPage = () => (
  <section className="notfound-screen">
    <span className="notfound-eyebrow">Error 404</span>
    <h2>Esta página no existe</h2>
    <p>El enlace que has seguido no lleva a ninguna parte del reino.</p>
    <div className="notfound-actions">
      <Link className="notfound-link" to="/hero">
        Volver a mi héroe
      </Link>
      <Link className="notfound-link is-quiet" to="/castle">
        Ir al castillo
      </Link>
    </div>
  </section>
);
