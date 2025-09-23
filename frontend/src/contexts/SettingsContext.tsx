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
      console.log('[SettingsContext] Fetching settings from API...');
      
      // Try to fetch from API with cache-busting headers
      const response = await fetch('https://staging.kockys.com/api/settings', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store', // Prevent Next.js from caching
      });
      
      console.log('[SettingsContext] API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[SettingsContext] API response data:', data);
        
        if (data && data.success && data.settings) {
          const mergedSettings = {
            ...defaultSettings,
            restaurantName: data.settings.siteName || defaultSettings.restaurantName,
            tagline: data.settings.siteDescription || defaultSettings.tagline,
            address: data.settings.address || defaultSettings.address,
            phone: data.settings.contactPhone || defaultSettings.phone,
            email: data.settings.contactEmail || defaultSettings.email,
            website: data.settings.onlineOrderingUrl || defaultSettings.website,
            socialMedia: { ...defaultSettings.socialMedia, ...(data.settings.socialMedia || {}) },
            businessHours: { ...defaultSettings.businessHours, ...(data.settings.businessHours || {}) },
          };
          console.log('[SettingsContext] Merged settings:', mergedSettings);
          setSettings(mergedSettings);
        } else {
          console.warn('[SettingsContext] Invalid API response format:', data);
        }
      } else {
        console.warn('[SettingsContext] API request failed with status:', response.status);
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

  // Expose refresh function globally for admin panel to trigger
  if (typeof window !== 'undefined') {
    (window as any).refreshSettings = fetchSettings;
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