import { api } from './client';

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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}';
    return `${baseUrl}/api/calendar/ical`;
  }
};
