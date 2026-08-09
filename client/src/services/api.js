import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('agentflow-auth') : null;
  const token = saved ? JSON.parse(saved)?.state?.token : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
