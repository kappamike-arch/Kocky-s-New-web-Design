import { api } from './client';

export interface QuoteItem {
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  isOptional?: boolean;
}

export interface QuotePackage {
  name: string;
  description?: string;
  items: any[];
  price: number;
  isOptional?: boolean;
}

export interface QuoteLabor {
  description: string;
  hours: number;
  rate: number;
  staffName?: string;
  isOptional?: boolean;
}

export interface CreateQuoteData {
  inquiryId?: string;
  customerId?: string;
  title: string;
  description?: string;
  eventDate?: string;
  eventLocation?: string;
  guestCount?: number;
  items: QuoteItem[];
  packages?: QuotePackage[];
  laborItems?: QuoteLabor[];
  taxRate?: number;
  discount?: number;
  discountType?: 'FIXED' | 'PERCENTAGE';
  notes?: string;
  internalNotes?: string;
  termsAndConditions?: string;
  validityDays?: number;
  templateId?: string;
  generatePaymentLink?: boolean;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  total: number;
  customer?: any;
  inquiry?: any;
  items: QuoteItem[];
  packages?: QuotePackage[];
  laborItems?: QuoteLabor[];
  stripePaymentLink?: string;
  createdAt: string;
  sentAt?: string;
  paidAt?: string;
}

export const quotes = {
  // Create a full quote
  createFull: async (data: CreateQuoteData) => {
    const response = await api.post('/quotes/full', data);
    return response.data;
  },

  // Get all quotes
  getAll: async (params?: {
    status?: string;
    customerId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/quotes', { params });
    return response.data;
  },

  // Get single quote
  getById: async (id: string) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },

  // Update quote
  update: async (id: string, data: Partial<CreateQuoteData>) => {
    const response = await api.patch(`/quotes/${id}`, data);
    return response.data;
  },

  // Send quote email with payment link
  sendEmail: async (id: string, email?: string) => {
    const response = await api.post(`/quotes/${id}/send-email`, { email });
    return response.data;
  },

  // Generate payment link
  generatePaymentLink: async (id: string) => {
    const response = await api.post(`/quotes/${id}/payment-link`);
    return response.data;
  },

  // Accept quote
  accept: async (id: string) => {
    const response = await api.post(`/quotes/${id}/accept`);
    return response.data;
  },

  // Reject quote
  reject: async (id: string) => {
    const response = await api.post(`/quotes/${id}/reject`);
    return response.data;
  },

  // Duplicate quote
  duplicate: async (id: string) => {
    const response = await api.post(`/quotes/${id}/duplicate`);
    return response.data;
  },

  // Delete quote
  delete: async (id: string) => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/quotes/statistics?${params}`);
    return response.data;
  },

  // Get templates
  getTemplates: async () => {
    // For now, return hardcoded templates
    // In production, this would fetch from the API
    return [
      {
        id: '1',
        name: 'Food Truck Service - Standard',
        type: 'FOOD_TRUCK',
        defaultItems: [
          {
            name: 'Food Truck Setup & Service',
            description: 'Complete food truck service',
            quantity: 1,
            unitPrice: 500,
          },
          {
            name: 'Per Person Food Package',
            description: 'Choice of burgers, hot dogs, or sandwiches',
            quantity: 50,
            unitPrice: 15,
          },
        ],
      },
      {
        id: '2',
        name: 'Mobile Bar Service - Premium',
        type: 'MOBILE_BAR',
        defaultPackages: [
          {
            name: 'Premium Open Bar Package',
            description: 'Unlimited beer, wine, and mixed drinks',
            price: 2500,
          },
        ],
      },
      {
        id: '3',
        name: 'Catering - Corporate Event',
        type: 'CATERING',
        defaultItems: [
          {
            name: 'Business Lunch Package',
            description: 'Complete lunch service',
            quantity: 30,
            unitPrice: 25,
          },
        ],
      },
      {
        id: '4',
        name: 'Private Event - Wedding',
        type: 'PRIVATE_EVENT',
        defaultPackages: [
          {
            name: 'Wedding Reception Package',
            description: 'Complete wedding service',
            price: 7500,
          },
        ],
      },
      {
        id: '5',
        name: 'Happy Hour Special Event',
        type: 'PRIVATE_EVENT',
        defaultItems: [
          {
            name: 'Happy Hour Appetizer Platter',
            description: 'Wings, nachos, sliders, veggie platter',
            quantity: 5,
            unitPrice: 65,
          },
        ],
      },
    ];
  },
};
