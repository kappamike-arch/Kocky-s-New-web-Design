import { api } from './client';

export interface InquiryData {
  type: 'GENERAL' | 'FOOD_TRUCK' | 'MOBILE_BAR' | 'CATERING' | 'PRIVATE_EVENT' | 'RESERVATION';
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  guestCount?: number;
  message: string;
  budget?: string;
  location?: string;
}

export const inquiries = {
  // Submit new inquiry (public)
  submit: async (data: InquiryData) => {
    const response = await api.post('/inquiries/submit', data);
    return response.data;
  },

  // Get all inquiries (admin)
  getAll: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/inquiries', { params });
    return response.data;
  },

  // Get single inquiry (admin)
  getById: async (id: string) => {
    const response = await api.get(`/inquiries/${id}`);
    return response.data;
  },

  // Update inquiry (admin)
  update: async (id: string, data: Partial<InquiryData>) => {
    const response = await api.patch(`/inquiries/${id}`, data);
    return response.data;
  },

  // Update status (admin)
  updateStatus: async (id: string, status: string, notes?: string) => {
    const response = await api.patch(`/inquiries/${id}/status`, { status, notes });
    return response.data;
  },

  // Get statistics (admin)
  getStatistics: async () => {
    const response = await api.get('/inquiries/statistics');
    return response.data;
  },
};
