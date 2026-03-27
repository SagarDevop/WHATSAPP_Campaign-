import api from './api';

const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('user'));
    }
    return null;
};

export const authService = {
    login,
    register,
    logout,
    getCurrentUser,
};
