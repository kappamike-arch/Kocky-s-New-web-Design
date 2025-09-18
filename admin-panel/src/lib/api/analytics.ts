import { api } from './api';

// Generate or get session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return 'server-render';
  
  let sessionId = sessionStorage.getItem('session-id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('session-id', sessionId);
  }
  return sessionId;
};

// Analytics service
export const analytics = {
  // Track page view
  pageView: async (page: string, referrer?: string) => {
    try {
      await api.post('/analytics/pageview', {
        sessionId: getSessionId(),
        page,
        referrer: referrer || document.referrer,
        userId: localStorage.getItem('user-id'),
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  },

  // Track custom event
  event: async (eventType: string, eventName: string, eventData?: any) => {
    try {
      await api.post('/analytics/event', {
        sessionId: getSessionId(),
        eventType,
        eventName,
        page: window.location.pathname,
        referrer: document.referrer,
        eventData,
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  },

  // Track click
  click: async (element: string, url?: string, coordinates?: { x: number; y: number }) => {
    try {
      await api.post('/analytics/track/click', {
        sessionId: getSessionId(),
        element,
        url,
        x: coordinates?.x,
        y: coordinates?.y,
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  },

  // Track conversion
  conversion: async (conversionType: string, value?: number, metadata?: any) => {
    try {
      await api.post('/analytics/track/conversion', {
        sessionId: getSessionId(),
        conversionType,
        value,
        metadata,
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  },

  // Get dashboard data (for admin)
  getDashboard: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/analytics/dashboard?${params}`);
    return response.data;
  },
};
