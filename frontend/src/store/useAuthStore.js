import { create } from 'zustand';
import api from '../lib/axios';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      set({ user: res.data, token: res.data.token, isAuthenticated: true, loading: false });
      return true; // Success hook return
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', loading: false });
      return false;
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', credentials);
      localStorage.setItem('token', res.data.token);
      set({ user: res.data, token: res.data.token, isAuthenticated: true, loading: false });
      return true; // Success
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/auth/profile');
      set({ user: res.data, isAuthenticated: true, loading: false });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      set({ loading: false, user: null, isAuthenticated: false, token: null });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (userData) => set({ user: userData }),
}));

export default useAuthStore;
