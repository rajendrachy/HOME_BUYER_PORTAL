import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============= AUTH APIs =============
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');

// ============= APPLICATION APIs (Citizen) =============
export const submitApplication = (data) => api.post('/applications', data);
export const getMyApplications = () => api.get('/applications/my');
export const getApplicationById = (id) => api.get(`/applications/${id}`);
export const trackApplication = (appId) => api.get(`/applications/track/${appId}`);
export const acceptOffer = (appId, offerId) => api.put(`/applications/${appId}/accept-offer/${offerId}`);

// ============= MUNICIPALITY OFFICER APIs =============
export const getAllApplications = () => api.get('/applications/all');

// ✅ NEW: Get all applications with advanced filters (search, filter, sort, pagination)
export const getAllApplicationsWithFilters = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.district && filters.district !== 'all') params.append('district', filters.district);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  return api.get(`/applications/all?${params.toString()}`);
};

export const updateApplicationStatus = (id, data) => api.put(`/applications/${id}/status`, data);

// ============= BANK OFFICER APIs =============
export const getApprovedApplications = () => api.get('/applications/approved');
export const submitLoanOffer = (id, data) => api.post(`/applications/${id}/offer`, data);
export const getMyBankOffers = () => api.get('/applications/bank/offers');

export default api;

