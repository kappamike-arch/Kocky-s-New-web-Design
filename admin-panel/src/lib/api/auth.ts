import { api } from './client';
const Cookies = require('js-cookie');
import { handleLogout } from '../utils/logout';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
  role?: string;
}

export const auth = {
  // Login
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    
    // Store tokens - backend returns 'token' not 'accessToken'
    if (response.data.token) {
      // Store in cookies
      Cookies.set('auth-token', response.data.token, { 
        expires: 7, 
        domain: '.staging.kockys.com',
        path: '/',
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax'
      });
      
      // Also store in localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', response.data.token);
        localStorage.setItem('access_token', response.data.token);
      }
      
      console.log('🔐 Token stored in cookie and localStorage:', response.data.token.substring(0, 20) + '...');
    }
    if (response.data.refreshToken) {
      Cookies.set('refresh-token', response.data.refreshToken, { 
        expires: 30,
        domain: '.staging.kockys.com',
        path: '/',
        secure: false,
        sameSite: 'lax'
      });
    }
    
    // Store user data
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('user-id', response.data.user.id);
    }
    
    return response.data;
  },

  // Register (admin only)
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear local data
      Cookies.remove('auth-token');
      Cookies.remove('refresh-token');
      localStorage.removeItem('user');
      localStorage.removeItem('user-id');
    }
  },

  // Get current user
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = Cookies.get('refresh-token');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await api.post('/auth/refresh', { refreshToken });
    
    // Backend returns 'token' not 'accessToken'
    if (response.data.token) {
      Cookies.set('auth-token', response.data.token, { expires: 7 });
    }
    
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = Cookies.get('auth-token');
    const hasToken = !!token;
    console.log('🔍 Auth Check:', { hasToken, tokenLength: token?.length });
    return hasToken;
  },

  // Get current user from local storage
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user has role
  hasRole: (role: string) => {
    const user = auth.getCurrentUser();
    return user?.role === role;
  },

  // Check if user is admin
  isAdmin: () => {
    return auth.hasRole('ADMIN');
  },

  // Check if user is staff or admin
  isStaff: () => {
    return auth.hasRole('STAFF') || auth.hasRole('ADMIN');
  },
};
