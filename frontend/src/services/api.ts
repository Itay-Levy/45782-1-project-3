import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, VacationsResponse, Vacation, ReportData } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Auth endpoints
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  checkEmail: async (email: string): Promise<{ exists: boolean }> => {
    const response = await api.get(`/auth/check-email/${encodeURIComponent(email)}`);
    return response.data;
  },
};

// Vacations endpoints
export const vacationsService = {
  getAll: async (page: number = 1, limit: number = 10, filter?: string): Promise<VacationsResponse> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter) params.append('filter', filter);
    const response = await api.get(`/vacations?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Vacation> => {
    const response = await api.get(`/vacations/${id}`);
    return response.data;
  },

  create: async (formData: FormData): Promise<Vacation> => {
    const response = await api.post('/vacations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: number, formData: FormData): Promise<Vacation> => {
    const response = await api.put(`/vacations/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/vacations/${id}`);
  },

  follow: async (id: number): Promise<void> => {
    await api.post(`/vacations/${id}/follow`);
  },

  unfollow: async (id: number): Promise<void> => {
    await api.delete(`/vacations/${id}/follow`);
  },

  getReport: async (): Promise<ReportData[]> => {
    const response = await api.get('/vacations/report');
    return response.data;
  },

  downloadCsv: async (): Promise<Blob> => {
    const response = await api.get('/vacations/csv', { responseType: 'blob' });
    return response.data;
  },
};

export const getImageUrl = (fileName: string): string => {
  return `${API_URL.replace('/api', '')}/uploads/${fileName}`;
};

export default api;
