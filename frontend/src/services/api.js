import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userProfile');
    }
    return Promise.reject(error);
  }
);

// ── Chatbot API ───────────────────────────────────────
export const chatbotAPI = {
  sendMessage: (message, language, conversationHistory = [], userState, userDistrict) =>
    api.post('/chatbot/message', { message, language, conversationHistory, userState, userDistrict }),

  getSuggestions: (language = 'en') =>
    api.get('/chatbot/suggestions', { params: { language } }),
};

// ── Schemes API ───────────────────────────────────────
export const schemesAPI = {
  getAll: (params = {}) => api.get('/schemes', { params }),

  getById: (id) => api.get(`/schemes/${id}`),

  findEligible: (userProfile) => api.post('/schemes/eligible', userProfile),

  create: (data) => api.post('/schemes', data),

  update: (id, data) => api.put(`/schemes/${id}`, data),

  delete: (id) => api.delete(`/schemes/${id}`),
};

// ── Applications API ──────────────────────────────────
export const applicationsAPI = {
  submit: (applicationData) => api.post('/applications', applicationData),
};

// ── Fraud API ─────────────────────────────────────────
export const fraudAPI = {
  getAlerts: (params = {}) => api.get('/fraud/alerts', { params }),

  updateAlert: (id, data) => api.put(`/fraud/alerts/${id}`, data),

  getStats: () => api.get('/fraud/stats'),
};

// ── Admin API ─────────────────────────────────────────
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),

  getMe: () => api.get('/admin/me'),

  getStats: () => api.get('/admin/stats'),

  getApplications: (params = {}) => api.get('/admin/applications', { params }),
};

export default api;
