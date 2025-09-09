import { api } from './client';

export interface SubscriberData {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  source?: string;
}

export const emailLists = {
  // Subscribe to newsletter (public)
  subscribe: async (data: SubscriberData) => {
    const response = await api.post('/email-lists/subscribe', {
      ...data,
      source: data.source || 'website',
    });
    return response.data;
  },

  // Unsubscribe (public)
  unsubscribe: async (email: string, reason?: string) => {
    const response = await api.post(`/email-lists/unsubscribe/${email}`, { reason });
    return response.data;
  },

  // Get all subscribers (admin)
  getAll: async (params?: {
    status?: string;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/email-lists', { params });
    return response.data;
  },

  // Get statistics (admin)
  getStatistics: async () => {
    const response = await api.get('/email-lists/statistics');
    return response.data;
  },

  // Export subscribers (admin)
  export: async (status?: string) => {
    const response = await api.get('/email-lists/export', { params: { status } });
    return response.data;
  },
};
