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

interface SettingsContextType {
  settings: typeof defaultSettings;
  isLoading: boolean;
  refresh: () => void;
  getSetting: (key: string, defaultValue?: any) => any;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<typeof defaultSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Simple client-side only fetch
  const fetchSettings = async () => {
    if (typeof window === 'undefined') return; // Skip on server
    
    try {
      setIsLoading(true);
      // Try to fetch from API, but don't fail if it doesn't work
      const response = await fetch('http://72.167.227.205:5001/api/settings/public');
      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          const mergedSettings = {
            ...defaultSettings,
            ...data.data,
            socialMedia: { ...defaultSettings.socialMedia, ...(data.data.socialMedia || {}) },
            businessHours: { ...defaultSettings.businessHours, ...(data.data.businessHours || {}) },
          };
          setSettings(mergedSettings);
        }
      }
    } catch (error) {
      console.warn('[SettingsContext] Failed to fetch settings, using defaults:', error);
      // Keep defaults on error
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch on client side
  useEffect(() => {
    fetchSettings();
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