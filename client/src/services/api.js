import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
  register: (data) => api.post('/auth/register', data).then(res => res.data),
};

export const searchApi = {
  generateDorks: (query) => api.post('/search/generate', { query }).then(res => res.data),
  scrapeDork: (payload) => api.post('/search/scrape', payload).then(res => res.data),
};

export const leadsApi = {
  getAll: (tag) => api.get('/leads', { params: { tag } }).then(res => res.data),
  create: (data) => api.post('/leads', data).then(res => res.data),
  update: (id, data) => api.patch(`/leads/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/leads/${id}`).then(res => res.data),
};

export const historyApi = {
  getAll: () => api.get('/history').then(res => res.data),
  delete: (id) => api.delete(`/history/${id}`).then(res => res.data),
};

export const usersApi = {
  getProfile: () => api.get('/users').then(res => res.data),
  updateProfile: (data) => api.patch('/users', data).then(res => res.data),
};

export default api;
