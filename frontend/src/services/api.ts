import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para inyectar token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores globales (opcional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Redirigir a login si el token expira o es inválido, pero solo si no estamos ya ahí
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        const message = error.response?.data?.message || "Ocurrió un error inesperado";
        console.error("API Error:", message);
        return Promise.reject(error);
    }
);

export default api;
