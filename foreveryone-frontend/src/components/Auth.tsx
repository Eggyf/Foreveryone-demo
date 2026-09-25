import { useState } from 'react';
import axios from 'axios';
import { identityApi } from '../api/api';
import './Auth.css';

interface AuthProblem {
  title?: string;
  detail?: string;
  message?: string;
}

const getAuthErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError<AuthProblem>(error)) {
    return 'Error en la autenticación';
  }

  const problem = error.response?.data;
  return problem?.detail ?? problem?.title ?? problem?.message ?? 'Error en la autenticación';
};

export const Auth = ({ onSuccess }: { onSuccess: (token: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg('');

    const payload = isLogin
      ? { identifier, password }
      : { username, email, password };
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await identityApi.post(endpoint, payload);
      if (isLogin) {
        onSuccess(response.data.token);
      } else {
        setAuthMsg(`¡Registro exitoso! Ya puedes entrar como "${username}".`);
        setUsername('');
        setEmail('');
        setPassword('');
        setIsLogin(true);
      }
    } catch (error: unknown) {
      setAuthMsg(getAuthErrorMessage(error));
    }
  };

  return (
    <div className="auth-card">
      <div className="tabs">
        <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
        <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Registro</button>
      </div>
      <form onSubmit={handleAuth}>
        {isLogin ? (
          <input
            type="text"
            placeholder="Email o usuario"
            aria-label="Email o usuario"
            autoComplete="username"
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={24}
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
        <button type="submit">{isLogin ? 'Entrar' : 'Registrarse'}</button>
      </form>
      {authMsg && <p className="message">{authMsg}</p>}
    </div>
  );
};
