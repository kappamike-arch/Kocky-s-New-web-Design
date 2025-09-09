import { api } from './client';

// Generate or get session ID - only on client side
const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = sessionStorage.getItem('session-id');
  if (!sessionId) {
    // Use a more deterministic approach to avoid hydration issues
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    sessionId = `session-${timestamp}-${randomPart}`;
    sessionStorage.setItem('session-id', sessionId);
  }
  return sessionId;
};

// Analytics service
export const analytics = {
  // Track page view
  pageView: async (page: string, referrer?: string) => {
    try {
      const sessionId = getSessionId();
      if (!sessionId) return; // Skip if no session ID (server-side)
      
      await api.post('/analytics/pageview', {
        sessionId,
        page,
        referrer: referrer || (typeof document !== 'undefined' ? document.referrer : ''),
        userId: typeof localStorage !== 'undefined' ? localStorage.getItem('user-id') : null,
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  },

  // Track custom event
  event: async (eventType: string, eventName: string, eventData?: any) => {
    try {
      const sessionId = getSessionId();
      if (!sessionId) return; // Skip if no session ID (server-side)
      
      await api.post('/analytics/event', {
        sessionId,
        eventType,
        eventName,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        eventData,
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  },

  // Track click
  click: async (element: string, url?: string, coordinates?: { x: number; y: number }) => {
    try {
      const sessionId = getSessionId();
      if (!sessionId) return; // Skip if no session ID (server-side)
      
      await api.post('/analytics/track/click', {
        sessionId,
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
      const sessionId = getSessionId();
      if (!sessionId) return; // Skip if no session ID (server-side)
      
      await api.post('/analytics/track/conversion', {
        sessionId,
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
