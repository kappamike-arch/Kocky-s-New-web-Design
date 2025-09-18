import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://staging.kockys.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email/${token}`),
};

// Reservation endpoints
export const reservationAPI = {
  create: (data: any) => api.post('/reservations', data),
  getAll: (params?: any) => api.get('/reservations', { params }),
  getOne: (id: string) => api.get(`/reservations/${id}`),
  update: (id: string, data: any) => api.put(`/reservations/${id}`, data),
  delete: (id: string) => api.delete(`/reservations/${id}`),
  checkAvailability: (params: any) =>
    api.get('/reservations/check-availability', { params }),
  getByConfirmationCode: (code: string) =>
    api.get(`/reservations/confirmation/${code}`),
  getMyReservations: () => api.get('/reservations/my-reservations'),
};

// Food Truck endpoints
export const foodTruckAPI = {
  create: (data: any) => api.post('/food-truck', data),
  getAll: (params?: any) => api.get('/food-truck', { params }),
  getOne: (id: string) => api.get(`/food-truck/${id}`),
  update: (id: string, data: any) => api.put(`/food-truck/${id}`, data),
  delete: (id: string) => api.delete(`/food-truck/${id}`),
  getByConfirmationCode: (code: string) =>
    api.get(`/food-truck/confirmation/${code}`),
};

// Mobile Bar endpoints
export const mobileBarAPI = {
  create: (data: any) => api.post('/mobile-bar', data),
  getAll: (params?: any) => api.get('/mobile-bar', { params }),
  getOne: (id: string) => api.get(`/mobile-bar/${id}`),
  update: (id: string, data: any) => api.put(`/mobile-bar/${id}`, data),
  delete: (id: string) => api.delete(`/mobile-bar/${id}`),
  getPackages: () => api.get('/mobile-bar/packages'),
  getByConfirmationCode: (code: string) =>
    api.get(`/mobile-bar/confirmation/${code}`),
};

// Menu endpoints
export const menuAPI = {
  getAll: (params?: any) => api.get('/menu', { params }),
  getOne: (id: string) => api.get(`/menu/${id}`),
  getCategories: () => api.get('/menu/categories'),
  getFeatured: () => api.get('/menu/featured'),
  getHappyHour: () => api.get('/menu/happy-hour'),
  create: (data: any) => api.post('/menu', data),
  update: (id: string, data: any) => api.put(`/menu/${id}`, data),
  delete: (id: string) => api.delete(`/menu/${id}`),
};

// Order endpoints
export const orderAPI = {
  create: (data: any) => api.post('/orders', data),
  getAll: (params?: any) => api.get('/orders', { params }),
  getOne: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
  getMyOrders: () => api.get('/orders/my-orders'),
  calculateTotal: (data: any) => api.post('/orders/calculate-total', data),
  getByConfirmationCode: (code: string) =>
    api.get(`/orders/confirmation/${code}`),
};

// Newsletter endpoints
export const newsletterAPI = {
  subscribe: (data: { email: string; name?: string }) =>
    api.post('/newsletter/subscribe', data),
  unsubscribe: (email: string) =>
    api.post('/newsletter/unsubscribe', { email }),
  verifySubscription: (token: string) =>
    api.get(`/newsletter/verify/${token}`),
};

// Contact endpoints
export const contactAPI = {
  submit: (data: any) => api.post('/contact', data),
  getAll: (params?: any) => api.get('/contact', { params }),
  getOne: (id: string) => api.get(`/contact/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/contact/${id}/status`, { status }),
  respond: (id: string, response: string) =>
    api.post(`/contact/${id}/respond`, { response }),
};

// Settings endpoints
export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
  getAll: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
  getBusinessHours: () => api.get('/settings/business-hours'),
  updateBusinessHours: (data: any) =>
    api.put('/settings/business-hours', data),
};

// Admin endpoints
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAnalytics: (params?: any) => api.get('/admin/analytics', { params }),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  getRevenueReport: (params?: any) =>
    api.get('/admin/reports/revenue', { params }),
  getReservationsReport: (params?: any) =>
    api.get('/admin/reports/reservations', { params }),
  getOrdersReport: (params?: any) =>
    api.get('/admin/reports/orders', { params }),
};

// Forms endpoints (unified form submission)
export const formsAPI = {
  submit: (formType: string, data: any) => 
    api.post('/forms/submit', { formType, ...data }),
  getByConfirmationCode: (code: string) =>
    api.get(`/forms/confirmation/${code}`),
  getAllSubmissions: (params?: any) => 
    api.get('/forms/submissions', { params }),
};

// CRM endpoints
export const crmAPI = {
  // Dashboard
  getDashboard: () => api.get('/crm/dashboard'),
  
  // Inquiries
  getInquiries: (params?: any) => api.get('/crm/inquiries', { params }),
  getInquiry: (id: string) => api.get(`/crm/inquiries/${id}`),
  updateInquiry: (id: string, data: any) => api.put(`/crm/inquiries/${id}`, data),
  addNote: (id: string, note: string, isInternal?: boolean) => 
    api.post(`/crm/inquiries/${id}/notes`, { note, isInternal }),
  exportInquiries: () => api.get('/crm/inquiries/export'),
  
  // Quotes
  createQuote: (inquiryId: string, data: any) => 
    api.post(`/crm/inquiries/${inquiryId}/quotes`, data),
  updateQuote: (quoteId: string, data: any) => 
    api.put(`/crm/quotes/${quoteId}`, data),
  sendQuote: (quoteId: string) => 
    api.post(`/crm/quotes/${quoteId}/send`),
};

export default api;
