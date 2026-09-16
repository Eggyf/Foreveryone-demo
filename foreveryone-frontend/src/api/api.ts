import axios from 'axios';

// Asegúrate de cambiar los puertos por los de tus APIs reales
export const identityApi = axios.create({
    baseURL: 'http://localhost:5045', // Cambia por tu puerto de Identity
});

export const heroesApi = axios.create({
    baseURL: 'http://localhost:5281', // Cambia por tu puerto de Heroes
});

export const shopApi = axios.create({
    baseURL: 'http://localhost:5136', // Cambia el puerto por el de tu Shop.Api
});

export const kingdomApi = axios.create({
    baseURL: 'http://localhost:5256', // Cambia por tu puerto de Kingdom
});

// Interceptor: Automatiza el envío del Token JWT en cada petición a Heroes y Kingdom
const requestInterceptor = (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

heroesApi.interceptors.request.use(requestInterceptor);
kingdomApi.interceptors.request.use(requestInterceptor);