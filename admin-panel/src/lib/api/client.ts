import axios from 'axios';
import { API_URL } from '@/config/api';
const Cookies = require('js-cookie');

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL || null;

// Create axios instance for backend API
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  console.log('API Request:', config.baseURL + config.url);
  const token = Cookies.get('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Remove credentials requirement for now
  config.withCredentials = false;
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

// CMS GraphQL client
export const cmsClient = {
  query: async (query: string, variables?: any) => {
    const response = await fetch(CMS_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    
    return data.data;
  },
};

