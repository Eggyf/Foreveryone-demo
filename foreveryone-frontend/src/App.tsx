import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import './App.css';

// Función auxiliar para no repetir código
const extractUserId = (token: string | null): string => {
  if (!token) return '';
  try {
    const decoded: any = jwtDecode(token);
    return decoded.sub || decoded.nameid || '';
  } catch {
    return '';
  }
};

function App() {
  // Inicializamos el estado leyendo directamente del localStorage de forma perezosa
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [userId, setUserId] = useState<string>(() => extractUserId(localStorage.getItem('token')));

  // Se llama cuando el Login es exitoso
  const handleAuthSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUserId(extractUserId(newToken)); // Extraemos el ID en el mismo flujo, sin useEffect
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserId('');
  };

  return (
    <div className="app-container">
      <h1>ForEveryone</h1>
      <p>Bienvenido al reino de Eldoria</p>
      
      {!token ? (
        <Auth onSuccess={handleAuthSuccess} />
      ) : (
        <Dashboard userId={userId} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;