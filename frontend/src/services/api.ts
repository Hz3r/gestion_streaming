import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para manejar errores globales (opcional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || "Ocurrió un error inesperado";
        console.error("API Error:", message);
        return Promise.reject(error);
    }
);

export default api;
