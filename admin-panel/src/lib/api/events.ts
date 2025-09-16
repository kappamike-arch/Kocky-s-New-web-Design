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

export interface RSVP {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  wantsSms: boolean;
  wantsEmail: boolean;
  createdAt: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  venueName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  videoUrl?: string;
  isPublished?: boolean;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
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

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
  };
  message: string;
}

// Get all events (admin)
export const getEvents = async (params?: {
  page?: number;
  limit?: number;
  isPublished?: boolean;
}): Promise<EventsResponse> => {
  try {
    if (!api) {
      throw new Error('API client is not initialized');
    }
    
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.isPublished !== undefined) searchParams.append('isPublished', params.isPublished.toString());
    
    const response = await api.get(`/events?${searchParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error in getEvents:', error);
    throw error;
  }
};

// Get event by ID (admin)
export const getEvent = async (id: string): Promise<EventResponse> => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

// Create event
export const createEvent = async (data: CreateEventData, file?: File): Promise<EventResponse> => {
  try {
    if (!api) {
      throw new Error('API client is not initialized');
    }
    
    const formData = new FormData();
    
    // Add all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('heroImage', file);
    }
    
    const response = await api.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error in createEvent:', error);
    throw error;
  }
};

// Update event
export const updateEvent = async (id: string, data: Partial<CreateEventData>, file?: File): Promise<EventResponse> => {
  const formData = new FormData();
  
  // Add all form fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });
  
  // Add file if provided
  if (file) {
    formData.append('heroImage', file);
  }
  
  const response = await api.put(`/events/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete event
export const deleteEvent = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};

// Toggle event publish status
export const toggleEventPublish = async (id: string): Promise<EventResponse> => {
  const response = await api.patch(`/events/${id}/publish`);
  return response.data;
};

// Upload event image
export const uploadEventImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post('/events/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Upload event video
export const uploadEventVideo = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('video', file);
  
  const response = await api.post('/events/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get event RSVPs
export const getEventRSVPs = async (eventId: string): Promise<{ success: boolean; data: RSVP[] }> => {
  const response = await api.get(`/events/${eventId}/rsvps`);
  return response.data;
};
