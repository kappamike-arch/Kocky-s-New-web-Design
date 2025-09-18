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
    const response = await api.post('/contact/submit', data);
    return response.data;
  },

  // Get all inquiries (admin)
  getAll: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    // Map 'type' to 'serviceType' for backend compatibility
    const backendParams = {
      ...params,
      serviceType: params?.type,
      type: undefined
    };
    const response = await api.get('/crm/inquiries', { params: backendParams });
    return response.data;
  },

  // Get single inquiry (admin)
  getById: async (id: string) => {
    const response = await api.get(`/crm/inquiries/${id}`);
    return response.data;
  },

  // Update inquiry (admin)
  update: async (id: string, data: Partial<InquiryData>) => {
    const response = await api.put(`/crm/inquiries/${id}`, data);
    return response.data;
  },

  // Update status (admin)
  updateStatus: async (id: string, status: string, notes?: string) => {
    const response = await api.put(`/crm/inquiries/${id}`, { status, notes });
    return response.data;
  },

  // Get statistics (admin)
  getStatistics: async () => {
    const response = await api.get('/crm/dashboard');
    return response.data;
  },
};
