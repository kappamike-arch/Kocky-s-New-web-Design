import { api } from './client';
import { API_URL } from '@/config/api';

export const calendarAPI = {
  // Get all events
  getEvents: (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => api.get('/calendar/events', { params }),
  
  // Get event statistics
  getStats: () => api.get('/calendar/stats'),
  
  // Get iCal feed URL (for reference)
  getICalUrl: () => {
    return `${API_URL}/calendar/ical`;
  }
};
