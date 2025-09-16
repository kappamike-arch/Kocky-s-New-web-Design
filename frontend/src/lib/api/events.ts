import { api } from './client';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  startAt: string;
  endAt?: string;
  venueName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  heroImageUrl?: string;
  videoUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    rsvps: number;
  };
}

export interface RSVPData {
  name: string;
  email: string;
  phone?: string;
  wantsSms?: boolean;
  wantsEmail?: boolean;
}

export interface ReminderData {
  email?: string;
  phone?: string;
  wantsSms?: boolean;
  wantsEmail?: boolean;
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EventResponse {
  success: boolean;
  data: Event;
}

export interface RSVPResponse {
  success: boolean;
  data: any;
  message: string;
}

// Get all published events (public)
export const getEvents = async (params?: {
  page?: number;
  limit?: number;
}): Promise<EventsResponse> => {
  try {
    if (!api) {
      throw new Error('API client is not initialized');
    }
    
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await api.get(`/events?${searchParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error in getEvents:', error);
    throw error;
  }
};

// Get event by slug (public)
export const getEventBySlug = async (slug: string): Promise<EventResponse> => {
  if (!api) {
    throw new Error('API client is not initialized');
  }
  const response = await api.get(`/events/${slug}`);
  return response.data;
};

// Create RSVP (public)
export const createRSVP = async (eventId: string, data: RSVPData): Promise<RSVPResponse> => {
  if (!api) {
    throw new Error('API client is not initialized');
  }
  const response = await api.post(`/events/${eventId}/rsvp`, data);
  return response.data;
};

// Subscribe to reminders (public)
export const subscribeToReminders = async (eventId: string, data: ReminderData): Promise<{ success: boolean; message: string }> => {
  if (!api) {
    throw new Error('API client is not initialized');
  }
  const response = await api.post(`/events/${eventId}/reminders`, data);
  return response.data;
};

// Get ICS file URL
export const getICSFileUrl = (eventId: string): string => {
  return `${process.env.NEXT_PUBLIC_API_URL || 'https://staging.kockys.com/api'}/events/${eventId}/ics`;
};

// Generate Google Calendar URL
export const generateGoogleCalendarUrl = (event: Event): string => {
  const startDate = new Date(event.startAt);
  const endDate = event.endAt ? new Date(event.endAt) : startDate;
  
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description || '',
    location: event.venueName ? `${event.venueName}${event.addressLine1 ? `, ${event.addressLine1}` : ''}${event.city ? `, ${event.city}` : ''}` : ''
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Generate Apple Calendar URL
export const generateAppleCalendarUrl = (event: Event): string => {
  const startDate = new Date(event.startAt);
  const endDate = event.endAt ? new Date(event.endAt) : startDate;
  
  const params = new URLSearchParams({
    title: event.title,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    description: event.description || '',
    location: event.venueName ? `${event.venueName}${event.addressLine1 ? `, ${event.addressLine1}` : ''}${event.city ? `, ${event.city}` : ''}` : ''
  });
  
  return `webcal://calendar.google.com/calendar/event?${params.toString()}`;
};

// Generate Outlook Calendar URL
export const generateOutlookCalendarUrl = (event: Event): string => {
  const startDate = new Date(event.startAt);
  const endDate = event.endAt ? new Date(event.endAt) : startDate;
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: event.description || '',
    location: event.venueName ? `${event.venueName}${event.addressLine1 ? `, ${event.addressLine1}` : ''}${event.city ? `, ${event.city}` : ''}` : ''
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

