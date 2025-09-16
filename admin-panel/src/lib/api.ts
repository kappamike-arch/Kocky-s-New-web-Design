import axios from "axios";
import { API_URL, API_BASE } from '@/config/api';

export { API_BASE };

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  // Try multiple token sources for compatibility
  let token = null;
  
  // Try localStorage first
  if (typeof window !== 'undefined') {
    token = localStorage.getItem("access_token") || 
            localStorage.getItem("auth-token") ||
            localStorage.getItem("token");
  }
  
  // Try sessionStorage as fallback
  if (!token && typeof window !== 'undefined') {
    token = sessionStorage.getItem("access_token") || 
            sessionStorage.getItem("auth-token") ||
            sessionStorage.getItem("token");
  }
  
  // Try cookies as last resort
  if (!token && typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-token' || name === 'access_token' || name === 'token') {
        token = value;
        break;
      }
    }
  }
  
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('API Request:', cfg.method?.toUpperCase(), cfg.url, {
    hasAuth: !!token,
    tokenSource: token ? 'found' : 'none',
    baseURL: cfg.baseURL
  });
  
  return cfg;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    
    if (error.response?.status === 401) {
      console.warn('Authentication failed - clearing tokens and redirecting to login');
      
      // Clear all possible token locations
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth-token');
        localStorage.removeItem('token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('auth-token');
        sessionStorage.removeItem('token');
      }
      
      if (typeof document !== 'undefined') {
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      
      // Redirect to login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;