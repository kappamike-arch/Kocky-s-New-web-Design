'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Default settings that will be used if API fails
const defaultSettings = {
  restaurantName: "Kocky's Bar & Grill",
  tagline: "Where Great Food Meets Unforgettable Moments",
  address: "123 Main Street, City, State 12345",
  phone: "(555) 123-4567",
  email: "info@kockys.com",
  website: "https://kockys.com",
  socialMedia: {
    facebook: "https://facebook.com/kockys",
    instagram: "https://instagram.com/kockys",
    twitter: "https://twitter.com/kockys",
  },
  businessHours: {
    monday: 'Mon: 11:00 AM - 10:00 PM',
    tuesday: 'Tue: 11:00 AM - 10:00 PM',
    wednesday: 'Wed: 11:00 AM - 10:00 PM',
    thursday: 'Thu: 11:00 AM - 10:00 PM',
    friday: 'Fri: 11:00 AM - 11:00 PM',
    saturday: 'Sat: 10:00 AM - 2:00 AM',
    sunday: 'Sun: 10:00 AM - 10:00 PM',
  },
};

type SettingsState = typeof defaultSettings;

interface SettingsContextType {
  settings: SettingsState;
  isLoading: boolean;
  refresh: (force?: boolean) => Promise<void>;
  getSetting: (key: string, defaultValue?: any) => any;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = async (force?: boolean) => {
    if (typeof window === 'undefined') return;
    if (!force && isLoading) return;

    try {
      setIsLoading(true);

      const response = await fetch('https://staging.kockys.com/api/settings', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn('[SettingsContext] API request failed with status:', response.status);
        return;
      }

      const data = await response.json();

      if (!data || (!data.success && !data.settings)) {
        console.warn('[SettingsContext] Invalid API response format:', data);
        return;
      }

      const payload = data.settings || data;
      const mergedSettings: SettingsState = {
        ...defaultSettings,
        restaurantName: payload.siteName || payload.restaurantName || defaultSettings.restaurantName,
        tagline: payload.siteDescription || payload.tagline || defaultSettings.tagline,
        address: payload.address || payload.contactAddress || defaultSettings.address,
        phone: payload.contactPhone || payload.phone || defaultSettings.phone,
        email: payload.contactEmail || payload.email || defaultSettings.email,
        website: payload.onlineOrderingUrl || payload.website || defaultSettings.website,
        socialMedia: { ...defaultSettings.socialMedia, ...(payload.socialMedia || {}) },
        businessHours: { ...defaultSettings.businessHours, ...(payload.businessHours || {}) },
      };

      setSettings(mergedSettings);
    } catch (error) {
      console.warn('[SettingsContext] Failed to fetch settings, using defaults:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings().catch((error) => {
      console.warn('[SettingsContext] Initial fetch failed:', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to get a specific setting with fallback
  const getSetting = (key: string, defaultValue: any = null) => {
    if (!settings) return defaultValue;
    
    const keys = key.split('.');
    let value = settings;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as any)[k];
      } else {
        return defaultValue;
      }
    }
    
    return value || defaultValue;
  };

  const value: SettingsContextType = {
    settings,
    isLoading,
    refresh: fetchSettings,
    getSetting,
    setSettings,
  };

  // Expose refresh function globally for admin panel to trigger
  if (typeof window !== 'undefined') {
    (window as any).refreshSettings = (force?: boolean) => fetchSettings(force);
  }

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

// Alias for backward compatibility
export function useBusinessInfo() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useBusinessInfo must be used within a SettingsProvider');
  }
  return {
    restaurantName: context.settings.restaurantName,
    address: context.settings.address,
    phone: context.settings.phone,
    email: context.settings.email,
    website: context.settings.website,
    socialMedia: context.settings.socialMedia,
    businessHours: context.settings.businessHours,
    isLoading: context.isLoading,
  };
}