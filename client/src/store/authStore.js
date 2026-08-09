import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(persist((set) => ({
  user: null,
  token: null,
  hydrated: false,
  setHydrated: (hydrated) => set({ hydrated }),
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    set({ user: data.user, token: data.token });
  },
  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    set({ user: data.user, token: data.token });
  },
  logout: () => set({ user: null, token: null })
}), {
  name: 'agentflow-auth',
  onRehydrateStorage: () => (state) => state?.setHydrated(true)
}));
