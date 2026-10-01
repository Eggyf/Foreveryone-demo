import { useState } from 'react';
import { identityApi } from '../api/api';
import { getErrorMessage } from '../api/errors';
import { useTranslation } from '../i18n/useI18n';
import { Message, type MessageTone } from './Message';
import './Auth.css';

type AuthMode = 'login' | 'register';

interface AuthNotice {
  tone: MessageTone;
  text: string;
}

export const Auth = ({ onSuccess }: { onSuccess: (token: string) => void }) => {
  const { t } = useTranslation();
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
        setNotice({
          tone: 'success',
          text: t('auth.registerSuccess', { username }),
        });
        setUsername('');
        setEmail('');
        setPassword('');
        setMode('login');
      }
    } catch (error: unknown) {
      setNotice({
        tone: 'error',
        text: getErrorMessage(error, t('auth.genericError')),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="tabs" role="tablist" aria-label="Foreveryone">
        <button
          type="button"
          role="tab"
          id="auth-tab-login"
          aria-controls="auth-panel"
          aria-selected={isLogin}
          className={isLogin ? 'active' : ''}
          onClick={() => switchMode('login')}
        >
          {t('auth.login')}
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
          {t('auth.register')}
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
            placeholder={t('auth.identifierPlaceholder')}
            aria-label={t('auth.identifierPlaceholder')}
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
              placeholder={t('auth.usernamePlaceholder')}
              aria-label={t('auth.usernamePlaceholder')}
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={24}
              pattern="[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?"
              title={t('auth.usernamePatternTitle')}
              required
            />
            <p className="field-hint">{t('auth.usernameHint')}</p>
            <input
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              aria-label={t('auth.emailPlaceholder')}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        )}
        <input
          type="password"
          placeholder={t('auth.passwordPlaceholder')}
          aria-label={t('auth.passwordPlaceholder')}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t('auth.waiting')
            : isLogin
              ? t('auth.enter')
              : t('auth.registerAction')}
        </button>
      </form>

      {notice && <Message tone={notice.tone}>{notice.text}</Message>}
    </div>
  );
};