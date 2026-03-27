import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include JWT token
api.interceptors.request.use(
    (config) => {
        const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
