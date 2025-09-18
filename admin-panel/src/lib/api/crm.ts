import { api } from './client';

export const crmAPI = {
  // Inquiries
  getAllInquiries: (params?: any) => api.get('/crm/inquiries', { params }),
  getInquiryById: (id: string) => api.get(`/crm/inquiries/${id}`),
  updateInquiry: (id: string, data: any) => api.put(`/crm/inquiries/${id}`, data),
  updateInquiryStatus: (id: string, status: string) => api.put(`/crm/inquiries/${id}/status`, { status }),
  deleteInquiry: (id: string) => api.delete(`/crm/inquiries/${id}`),
  
  // Notes
  addNote: (inquiryId: string, note: string, isInternal: boolean = true) => 
    api.post(`/crm/inquiries/${inquiryId}/notes`, { note, isInternal }),
  
  // Quotes
  createQuote: (inquiryId: string, quoteData: any) => 
    api.post(`/crm/inquiries/${inquiryId}/quotes`, quoteData),
  getQuote: (quoteId: string) => api.get(`/crm/quotes/${quoteId}`),
  updateQuote: (quoteId: string, data: any) => api.put(`/crm/quotes/${quoteId}`, data),
  sendQuoteEmail: (quoteId: string) => api.post(`/crm/quotes/${quoteId}/send`),
  
  // Export
  exportInquiries: (format: 'csv' | 'json' = 'csv') => 
    api.get('/crm/inquiries/export', { params: { format }, responseType: 'blob' }),
  
  // Statistics
  getStats: () => api.get('/crm/stats'),
};

