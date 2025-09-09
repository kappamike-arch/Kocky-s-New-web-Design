import { api } from './client';

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  heroImageUrl?: string;
  heroVideoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  contactAddress?: string; // Computed field for display
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  businessHours: any; // Backend uses complex structure
  emailSettings: {
    provider?: string;
    from?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    fromEmail?: string;
    fromName?: string;
  };
  paymentSettings: {
    stripeEnabled?: boolean;
    acceptsCash?: boolean;
    acceptsCard?: boolean;
    stripePublicKey?: string;
    enableOnlinePayment?: boolean;
    taxRate?: number;
  };
  reservationSettings?: {
    minPartySize?: number;
    maxPartySize?: number;
    advanceBookingDays?: number;
    reservationSlotDuration?: number;
    maxReservationsPerSlot?: number;
  };
  seoSettings?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    googleAnalyticsId?: string;
  };
  updatedAt?: string;
}

export interface UpdateSettingsData {
  siteName?: string;
  siteDescription?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  heroImageUrl?: string;
  heroVideoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  socialMedia?: Partial<SiteSettings['socialMedia']>;
  businessHours?: any;
  emailSettings?: Partial<SiteSettings['emailSettings']>;
  paymentSettings?: Partial<SiteSettings['paymentSettings']>;
  reservationSettings?: Partial<SiteSettings['reservationSettings']>;
  seoSettings?: Partial<SiteSettings['seoSettings']>;
}

export const settings = {
  // Get settings
  get: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      throw error;
    }
  },

  // Update settings
  update: async (data: UpdateSettingsData) => {
    try {
      const response = await api.put('/settings', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  // Upload logo
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/settings/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload hero image
  uploadHeroImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/settings/upload-hero', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Test email settings
  testEmail: async (data: { email: string; account?: string } | string) => {
    // Support both old format (string) and new format (object)
    const payload = typeof data === 'string' ? { email: data } : data;
    const response = await api.post('/settings/test-email', payload);
    return response.data;
  },

  // Reset to defaults
  resetToDefaults: async () => {
    const response = await api.post('/settings/reset');
    return response.data;
  },
};
