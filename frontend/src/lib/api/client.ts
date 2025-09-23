import axios from 'axios';
import Cookies from 'js-cookie';

// API URLs - Use relative paths for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') ? '/admin/api' : '/api');
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL || null; // GraphQL not available

// Create axios instance for backend API
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth-token');
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
      // Clear token and redirect to login
      Cookies.remove('auth-token');
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// CMS GraphQL client (disabled - GraphQL not available)
export const cmsClient = {
  query: async (query: string, variables?: any) => {
    // GraphQL endpoint not available, return fallback data silently
    return null;
  },
};
