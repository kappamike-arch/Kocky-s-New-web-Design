'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { settings as settingsAPI, type SiteSettings } from '@/lib/api/settings';
import themeConfig from '@/lib/theme-config';

interface SettingsContextType {
  settings: Partial<SiteSettings> | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  getSetting: (key: string, defaultValue?: any) => any;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default settings fallback
const defaultSettings = {
  siteName: themeConfig.business.name,
  siteDescription: themeConfig.business.tagline,
  contactEmail: themeConfig.business.email,
  contactPhone: themeConfig.business.phone,
  contactAddress: themeConfig.business.address,
  address: '123 Main Street',
  city: 'Fresno',
  state: 'CA',
  zipCode: '93701',
  socialMedia: themeConfig.social,
  businessHours: {
    monday: 'Mon: 11:00 AM - 10:00 PM',
    tuesday: 'Tue: 11:00 AM - 10:00 PM',
    wednesday: 'Wed: 11:00 AM - 10:00 PM',
    thursday: 'Thu: 11:00 AM - 11:00 PM',
    friday: 'Fri: 11:00 AM - 2:00 AM',
    saturday: 'Sat: 10:00 AM - 2:00 AM',
    sunday: 'Sun: 10:00 AM - 10:00 PM',
  },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsAPI.getPublic();
      if (process.env.NODE_ENV === 'development') console.log('[SettingsContext] Fetched settings:', data);
      
      if (data) {
        // Merge with defaults for any missing fields
        const mergedSettings = {
          ...defaultSettings,
          ...data,
          socialMedia: { ...defaultSettings.socialMedia, ...(data.socialMedia || {}) },
          businessHours: { ...defaultSettings.businessHours, ...(data.businessHours || {}) },
        };
        setSettings(mergedSettings);
      } else {
        // Use defaults if API fails
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('[SettingsContext] Error fetching settings:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Helper function to get a specific setting with fallback
  const getSetting = (key: string, defaultValue: any = null) => {
    if (!settings) return defaultValue;
    
    // Handle nested keys like 'socialMedia.facebook'
    const keys = key.split('.');
    let value: any = settings;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return defaultValue;
    }
    
    return value || defaultValue;
  };

  const value = {
    settings,
    isLoading,
    refresh: fetchSettings,
    getSetting,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Convenience hook for common settings
export function useBusinessInfo() {
  const { settings, isLoading } = useSettings();
  
  return {
    siteName: settings?.siteName || defaultSettings.siteName,
    email: settings?.contactEmail || defaultSettings.contactEmail,
    phone: settings?.contactPhone || defaultSettings.contactPhone,
    address: settings?.contactAddress || settings?.address || defaultSettings.contactAddress,
    city: settings?.city || defaultSettings.city,
    state: settings?.state || defaultSettings.state,
    zipCode: settings?.zipCode || defaultSettings.zipCode,
    fullAddress: `${settings?.address || defaultSettings.address}, ${settings?.city || defaultSettings.city}, ${settings?.state || defaultSettings.state} ${settings?.zipCode || defaultSettings.zipCode}`,
    socialMedia: settings?.socialMedia || defaultSettings.socialMedia,
    businessHours: settings?.businessHours || defaultSettings.businessHours,
    isLoading,
  };
}
