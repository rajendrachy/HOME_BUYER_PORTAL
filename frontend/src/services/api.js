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
    const { status, data } = error.response || {};
    // Only redirect if it's a 401 AND not a 2FA requirement
    if (status === 401 && !data?.requires2FA) {
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
export const login2FA = (data) => api.post('/auth/2fa/login', data);
export const getMe = () => api.get('/auth/me');

// 🔐 2FA Setup
export const setup2FA = () => api.post('/auth/2fa/setup');
export const verify2FA = (token) => api.post('/auth/2fa/verify', { token });
export const disable2FA = () => api.post('/auth/2fa/disable');

// ============= ADMIN APIs (User Management) =============
export const adminGetAllUsers = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.role && filters.role !== 'all') params.append('role', filters.role);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  
  return api.get(`/auth/users?${params.toString()}`);
};

export const adminUpdateUser = (id, data) => api.put(`/auth/users/${id}`, data);
export const adminDeleteUser = (id) => api.delete(`/auth/users/${id}`);

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

