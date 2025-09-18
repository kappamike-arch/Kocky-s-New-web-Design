import { api } from './client';

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER';
  isActive?: boolean;
  emailVerified?: Date | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER';
  isActive?: boolean;
  password?: string;
}

export const users = {
  // Get all users
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get single user
  getById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Create new user
  create: async (data: CreateUserData) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserData) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Change password
  changePassword: async (id: string, oldPassword: string, newPassword: string) => {
    const response = await api.post(`/admin/users/${id}/change-password`, {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Reset password
  resetPassword: async (id: string) => {
    const response = await api.post(`/admin/users/${id}/reset-password`);
    return response.data;
  },
};
