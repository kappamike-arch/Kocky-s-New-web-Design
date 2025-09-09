import { api } from './client';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'STAFF' | 'USER';
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
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get single user
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  create: async (data: CreateUserData) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserData) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Change password
  changePassword: async (id: string, oldPassword: string, newPassword: string) => {
    const response = await api.post(`/users/${id}/change-password`, {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Reset password
  resetPassword: async (id: string) => {
    const response = await api.post(`/users/${id}/reset-password`);
    return response.data;
  },
};

