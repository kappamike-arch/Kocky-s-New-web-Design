import axios from 'axios';
import Cookies from 'js-cookie';

// API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://staging.kockys.com/api';
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://72.167.227.205:3003/admin/api/graphql';

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
