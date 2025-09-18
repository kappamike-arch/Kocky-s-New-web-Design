import { api } from './client';

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  heroImageUrl?: string;
  heroVideoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  businessHours: {
    monday?: any;
    tuesday?: any;
    wednesday?: any;
    thursday?: any;
    friday?: any;
    saturday?: any;
    sunday?: any;
    default?: string;
  };
  emailSettings: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    fromEmail?: string;
    fromName?: string;
  };
  paymentSettings: {
    stripePublicKey?: string;
    enableOnlinePayment: boolean;
    taxRate: number;
  };
  seoSettings: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    googleAnalyticsId?: string;
  };
  updatedAt: string;
}

export interface UpdateSettingsData {
  siteName?: string;
  siteDescription?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialMedia?: Partial<SiteSettings['socialMedia']>;
  businessHours?: Partial<SiteSettings['businessHours']>;
  emailSettings?: Partial<SiteSettings['emailSettings']>;
  paymentSettings?: Partial<SiteSettings['paymentSettings']>;
  seoSettings?: Partial<SiteSettings['seoSettings']>;
}

export const settings = {
  // Get public settings (for frontend)
  getPublic: async () => {
    try {
      const response = await api.get('/settings/public');
      if (process.env.NODE_ENV === 'development') console.log('[Settings] Fetched public settings:', response.data);
      return response.data.settings || response.data;
    } catch (error) {
      console.error('[Settings] Error fetching public settings:', error);
      // Return null instead of throwing to prevent app crashes
      return null;
    }
  },

  // Get all settings (admin only)
  get: async () => {
    try {
      const response = await api.get('/settings');
      if (process.env.NODE_ENV === 'development') console.log('[Settings] Fetched all settings:', response.data);
      return response.data.settings || response.data;
    } catch (error) {
      console.error('[Settings] Error fetching settings:', error);
      return null;
    }
  },

  // Update settings (admin only)
  update: async (data: UpdateSettingsData) => {
    const response = await api.put('/settings', data);
    if (process.env.NODE_ENV === 'development') console.log('[Settings] Updated settings:', response.data);
    return response.data;
  },

  // Get business hours
  getBusinessHours: async () => {
    try {
      const response = await api.get('/settings/business-hours');
      return response.data.businessHours || response.data;
    } catch (error) {
      console.error('[Settings] Error fetching business hours:', error);
      return null;
    }
  },

  // Upload logo
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload hero image
  uploadHeroImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/settings/hero-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Reset to defaults
  reset: async () => {
    const response = await api.post('/settings/reset');
    return response.data;
  },
};