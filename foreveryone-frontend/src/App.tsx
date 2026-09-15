import { useState } from 'react';
import { identityApi, heroesApi, kingdomApi } from './api/api';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado de sesión
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  // Estado del Dashboard
  const [heroId, setHeroId] = useState<string | null>(null);
  const [kingdomId, setKingdomId] = useState<string | null>(null);
  
  // Mensajes
  const [authMsg, setAuthMsg] = useState('');
  const [dashMsg, setDashMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await identityApi.post(endpoint, { email, password });
      
      if (isLogin) {
        setToken(response.data.token);
        setAuthMsg('¡Login exitoso!');
        // En un sistema real, decodificarías el JWT para sacar el ID.
        // Para este MVP, te pediremos que pegues el ID manualmente abajo.
      } else {
        setAuthMsg(`¡Registro exitoso! Tu User ID es: ${response.data.userId}`);
      }
    } catch (error: any) {
      setAuthMsg(error.response?.data?.message || 'Error en la autenticación');
    }
  };

  const handleCreateHero = async () => {
    setDashMsg('');
    if (!currentUserId) return setDashMsg('Pega tu User ID primero.');
    try {
      const res = await heroesApi.post('/api/heroes', { userId: currentUserId, class: 1 }); // 1 = Warrior
      setHeroId(res.data.heroId);
      setDashMsg('¡Héroe Warrior creado con éxito!');
    } catch (error: any) {
      setDashMsg(error.response?.data?.message || 'Error al crear héroe');
    }
  };

  const handleCreateKingdom = async () => {
    setDashMsg('');
    if (!currentUserId) return setDashMsg('Pega tu User ID primero.');
    try {
      const res = await kingdomApi.post('/api/kingdoms', { userId: currentUserId });
      setKingdomId(res.data.kingdomId);
      setDashMsg('¡Reino fundado con éxito!');
    } catch (error: any) {
      setDashMsg(error.response?.data?.message || 'Error al crear reino');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setHeroId(null);
    setKingdomId(null);
    setCurrentUserId('');
    localStorage.removeItem('token');
  };

  return (
    <div className="app-container">
      <h1>ForEveryone</h1>
      <p>Bienvenido al reino de Eldoria</p>

      {!token ? (
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
      ) : (
        <div className="dashboard">
          <h2>Panel del Jugador</h2>
          
          <div className="dashboard-input">
            <label>Introduce tu User ID (lo obtienes al registrarte):</label>
            <input 
              type="text" 
              placeholder="Ej: 6fe51144-07ff-4ac0..." 
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
            />
          </div>

          <div className="actions">
            <button onClick={handleCreateHero} disabled={!!heroId}>
              {heroId ? `Héroe Creado (${heroId.substring(0,8)}...)` : 'Crear Héroe (Warrior)'}
            </button>
            <button onClick={handleCreateKingdom} disabled={!!kingdomId}>
              {kingdomId ? `Reino Creado (${kingdomId.substring(0,8)}...)` : 'Crear Reino'}
            </button>
          </div>

          {dashMsg && <p className="message" style={{ color: '#28a745' }}>{dashMsg}</p>}
          
          <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      )}
    </div>
  );
}

export default App;