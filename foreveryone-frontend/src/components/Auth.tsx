import { useState } from 'react';
import { identityApi } from '../api/api';
import './Auth.css';

export const Auth = ({ onSuccess }: { onSuccess: (token: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await identityApi.post(endpoint, { email, password });
      if (isLogin) {
        onSuccess(response.data.token);
      } else {
        setAuthMsg(`¡Registro exitoso! Tu ID es: ${response.data.userId}. Ahora Inicia Sesión.`);
        setIsLogin(true);
      }
    } catch (error: any) {
      setAuthMsg(error.response?.data?.message || 'Error en la autenticación');
    }
  };

  return (
    <div className="auth-card">
      <div className="tabs">
        <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
        <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Registro</button>
      </div>
      <form onSubmit={handleAuth}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{isLogin ? 'Entrar' : 'Registrarse'}</button>
      </form>
      {authMsg && <p className="message">{authMsg}</p>}
    </div>
  );
};