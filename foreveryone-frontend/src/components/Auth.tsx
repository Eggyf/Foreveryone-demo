import { useState } from 'react';
import { identityApi } from '../api/api';
import { getErrorMessage } from '../api/errors';
import { Message, type MessageTone } from './Message';
import './Auth.css';

type AuthMode = 'login' | 'register';

interface AuthNotice {
  tone: MessageTone;
  text: string;
}

export const Auth = ({ onSuccess }: { onSuccess: (token: string) => void }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === 'login';

  const switchMode = (next: AuthMode) => {
    setMode(next);
    // El aviso anterior pertenece a la otra pestana: dejarlo seria confuso.
    setNotice(null);
  };

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    setIsSubmitting(true);

    const payload = isLogin ? { identifier, password } : { username, email, password };
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await identityApi.post<{ token: string }>(endpoint, payload);

      if (isLogin) {
        onSuccess(response.data.token);
      } else {
        setNotice({ tone: 'success', text: `¡Registro exitoso! Ya puedes entrar como "${username}".` });
        setUsername('');
        setEmail('');
        setPassword('');
        setMode('login');
      }
    } catch (error: unknown) {
      setNotice({
        tone: 'error',
        text: getErrorMessage(error, 'No se pudo completar la operación.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="tabs" role="tablist" aria-label="Acceso a Foreveryone">
        <button
          type="button"
          role="tab"
          id="auth-tab-login"
          aria-controls="auth-panel"
          aria-selected={isLogin}
          className={isLogin ? 'active' : ''}
          onClick={() => switchMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          role="tab"
          id="auth-tab-register"
          aria-controls="auth-panel"
          aria-selected={!isLogin}
          className={!isLogin ? 'active' : ''}
          onClick={() => switchMode('register')}
        >
          Registro
        </button>
      </div>

      <form
        id="auth-panel"
        role="tabpanel"
        aria-labelledby={isLogin ? 'auth-tab-login' : 'auth-tab-register'}
        onSubmit={handleAuth}
      >
        {isLogin ? (
          <input
            type="text"
            placeholder="Email o usuario"
            aria-label="Email o usuario"
            autoComplete="username"
            autoFocus
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        ) : (
          <>
            <input
              type="text"
              placeholder="Nombre de usuario"
              aria-label="Nombre de usuario"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={24}
              pattern="[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?"
              title="De 3 a 24 caracteres, empezando y terminando en letra o número. Solo letras, números, punto, guion y guion bajo."
              required
            />
            <p className="field-hint">De 3 a 24 caracteres. Letras, números, punto, guion y guion bajo.</p>
            <input
              type="email"
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        )}
        <input
          type="password"
          placeholder="Contraseña"
          aria-label="Contraseña"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Un momento…' : isLogin ? 'Entrar' : 'Registrarse'}
        </button>
      </form>

      {notice && <Message tone={notice.tone}>{notice.text}</Message>}
    </div>
  );
};
