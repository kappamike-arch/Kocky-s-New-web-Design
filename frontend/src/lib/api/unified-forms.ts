import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface UnifiedFormData {
  formType: 'reservation' | 'mobile-bar' | 'food-truck' | 'catering';
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  guestCount?: number | string;
  companyName?: string;
  message?: string;
  packageType?: string;
  budget?: string;
  specialRequests?: string;
  eventDuration?: number;
  menuPreferences?: string;
  eventType?: string;
  [key: string]: any; // Allow additional fields
}

export const unifiedFormsAPI = {
  // Submit any type of form
  submit: async (data: UnifiedFormData) => {
    try {
      const response = await axios.post(`${API_URL}/unified-forms/submit`, data);
      return response.data;
    } catch (error: any) {
      console.error('Form submission error:', error);
      throw error;
    }
  },

  // Get all inquiries for CRM
  getInquiries: async (params?: {
    serviceType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const response = await axios.get(`${API_URL}/unified-forms/inquiries`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get inquiries:', error);
      throw error;
    }
  },

  // Get single inquiry details
  getInquiryDetails: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/unified-forms/inquiries/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get inquiry details:', error);
      throw error;
    }
  },

  // Update inquiry status
  updateInquiryStatus: async (id: string, status: string, note?: string) => {
    try {
      const response = await axios.patch(`${API_URL}/unified-forms/inquiries/${id}/status`, {
        status,
        note
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update inquiry status:', error);
      throw error;
    }
  },

  // Create quote from inquiry
  createQuote: async (inquiryId: string, quoteData: any) => {
    try {
      const response = await axios.post(
        `${API_URL}/unified-forms/inquiries/${inquiryId}/quote`,
        quoteData
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to create quote:', error);
      throw error;
    }
  }
};

// Helper function to convert form data to unified format
export const convertToUnifiedFormat = (
  formType: UnifiedFormData['formType'],
  data: any
): UnifiedFormData => {
  const baseData: UnifiedFormData = {
    formType,
    name: data.name || data.contactName || data.guestName || '',
    email: data.email || data.contactEmail || data.guestEmail || '',
    phone: data.phone || data.contactPhone || data.guestPhone || '',
    eventDate: data.eventDate || data.date || '',
    eventTime: data.eventTime || data.time || '',
    eventLocation: data.eventLocation || data.location || data.venue || '',
    guestCount: data.guestCount || data.partySize || data.expectedGuests || '',
    companyName: data.companyName || '',
    message: data.message || data.specialRequests || data.additionalNotes || '',
    packageType: data.packageType || '',
    budget: data.budget || '',
    specialRequests: data.specialRequests || '',
  };

  // Add any additional fields
  Object.keys(data).forEach(key => {
    if (!(key in baseData)) {
      baseData[key] = data[key];
    }
  });

  return baseData;
};
