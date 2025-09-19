// Hero settings management
// Fetches settings from the API server

import axios from 'axios';
import { decodeHtmlEntities, buildQueryParams } from './utils/htmlDecode';

export interface HeroSettings {
  id: string;
  pageName: string;
  pageSlug: string;
  useLogo: boolean;
  logoUrl?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  mediaPreference?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

// API base URL - use Apache proxy
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://staging.kockys.com/api';

// Cache for hero settings to avoid excessive API calls
interface CachedSettings {
  data: HeroSettings;
  timestamp: number;
}
let settingsCache: { [key: string]: CachedSettings } = {};
// Cache duration in milliseconds (0 = no cache for debugging)
const CACHE_DURATION = -1; // Force no cache

// Add cache-busting parameter to force fresh requests (only on client side)
function addCacheBuster(url: string): string {
  if (typeof window === 'undefined') {
    return url; // Don't add cache buster on server side
  }
  const urlObj = new URL(url);
  urlObj.searchParams.set('_cb', Date.now().toString());
  return urlObj.toString();
}

// Fetch hero settings from API
async function fetchHeroSettings(pageId: string): Promise<HeroSettings | null> {
  try {
    if (process.env.NODE_ENV === 'development') console.log(`Fetching hero settings for ${pageId} from API...`);
    const response = await axios.get(`${API_BASE_URL}/hero-settings/${pageId}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      params: {
        timestamp: typeof window !== 'undefined' ? Date.now() : 0 // Only use timestamp on client side
      },
      paramsSerializer: (params) => {
        // Use URLSearchParams to ensure proper encoding
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            urlParams.append(key, String(value));
          }
        });
        return urlParams.toString();
      }
    });
    if (response.data.success && response.data.data) {
      if (process.env.NODE_ENV === 'development') console.log(`Received settings for ${pageId}:`, response.data.data);
      // Also save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem(`heroSettings_${pageId}`, JSON.stringify(response.data.data));
      }
      return response.data.data;
    }
  } catch (error) {
    console.error('Error fetching hero settings from API:', error);
  }
  return null;
}

// Get hero settings with caching (with option to bypass cache)
export async function getHeroSettingsAsync(pageId: string): Promise<HeroSettings | null> {
  if (process.env.NODE_ENV === 'development') console.log(`[DEBUG] getHeroSettingsAsync called for ${pageId}`);
  
  try {
    // Force fresh API call with cache buster
    const apiUrl = addCacheBuster(`${API_BASE_URL}/hero-settings/${pageId}`);
    if (process.env.NODE_ENV === 'development') console.log(`[DEBUG] Fetching hero settings for ${pageId} from API with cache buster...`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      console.error(`[DEBUG] API request failed for ${pageId}:`, response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    if (process.env.NODE_ENV === 'development') console.log(`[DEBUG] Received settings for ${pageId}:`, result);

    // Check if result is a direct hero settings object (has id field)
    if (result && result.id === pageId) {
      // Clear any existing cache for this page
      localStorage.removeItem(`hero-settings-${pageId}`);
      sessionStorage.removeItem(`hero-settings-${pageId}`);
      
      // Decode HTML entities in all text fields
      const cleanedResult = {
        ...result,
        pageName: decodeHtmlEntities(result.pageName),
        pageSlug: decodeHtmlEntities(result.pageSlug),
        title: decodeHtmlEntities(result.title),
        subtitle: decodeHtmlEntities(result.subtitle),
        description: decodeHtmlEntities(result.description),
        logoUrl: decodeHtmlEntities(result.logoUrl),
        backgroundImage: decodeHtmlEntities(result.backgroundImage),
        backgroundVideo: decodeHtmlEntities(result.backgroundVideo)
      };
      
      // Store fresh data - result is the settings object directly
      localStorage.setItem(`hero-settings-${pageId}`, JSON.stringify(cleanedResult));
      
      if (process.env.NODE_ENV === 'development') console.log(`[DEBUG] Fresh settings stored for ${pageId}:`, cleanedResult);
      return cleanedResult;
    }
    
    // Check if result has wrapped structure (for backward compatibility)
    if (result.success && result.data) {
      // Clear any existing cache for this page
      localStorage.removeItem(`hero-settings-${pageId}`);
      sessionStorage.removeItem(`hero-settings-${pageId}`);
      
      // Decode HTML entities in all text fields
      const cleanedSettings = {
        ...result.data,
        pageName: decodeHtmlEntities(result.data.pageName),
        pageSlug: decodeHtmlEntities(result.data.pageSlug),
        title: decodeHtmlEntities(result.data.title),
        subtitle: decodeHtmlEntities(result.data.subtitle),
        description: decodeHtmlEntities(result.data.description),
        logoUrl: decodeHtmlEntities(result.data.logoUrl),
        backgroundImage: decodeHtmlEntities(result.data.backgroundImage),
        backgroundVideo: decodeHtmlEntities(result.data.backgroundVideo)
      };
      
      // Store fresh data
      localStorage.setItem(`hero-settings-${pageId}`, JSON.stringify(cleanedSettings));
      
      if (process.env.NODE_ENV === 'development') console.log(`[DEBUG] Fresh settings stored for ${pageId}:`, cleanedSettings);
      return cleanedSettings;
    }

    console.error(`[DEBUG] Invalid API response for ${pageId}:`, result);
    return null;
  } catch (error) {
    console.error(`[DEBUG] Error fetching hero settings for ${pageId}:`, error);
    return null;
  }
}

// Synchronous version for backward compatibility (uses cached data if available)
export function getHeroSettings(pageId: string): HeroSettings | null {
  // Return cached settings if available
  if (settingsCache[pageId]) {
    return settingsCache[pageId].data;
  }
  
  // Try localStorage as fallback (for offline mode)
  if (typeof window !== 'undefined') {
    try {
      const pageSettings = localStorage.getItem(`heroSettings_${pageId}`);
      if (pageSettings) {
        return JSON.parse(pageSettings);
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
  }
  
  return null;
}

// Default settings if none are saved
export const defaultHeroSettings: Record<string, HeroSettings> = {
  home: {
    id: 'home',
    pageName: 'Home',
    pageSlug: '/',
    useLogo: false,
    logoUrl: undefined,
    title: "Welcome to Kocky's",
    subtitle: 'Bar & Grill',
    description: 'Where Great Food Meets Unforgettable Moments'
  },
  menu: {
    id: 'menu',
    pageName: 'Menu',
    pageSlug: '/menu',
    useLogo: false,
    logoUrl: undefined,
    title: "Our Menu",
    subtitle: 'Delicious Food & Drinks',
    description: 'Discover our amazing selection'
  },
  'happy-hour': {
    id: 'happy-hour',
    pageName: 'Happy Hour',
    pageSlug: '/happy-hour',
    useLogo: false,
    logoUrl: undefined,
    title: 'Happy Hour Specials',
    subtitle: 'Daily 3PM - 6PM',
    description: 'Join us for amazing deals on drinks and appetizers'
  },
  brunch: {
    id: 'brunch',
    pageName: 'Weekend Brunch',
    pageSlug: '/brunch',
    useLogo: false,
    logoUrl: undefined,
    title: 'Weekend Brunch',
    subtitle: 'Saturday & Sunday',
    description: 'Join us from 10am - 3pm for the best brunch in town'
  },
  mobile: {
    id: 'mobile',
    pageName: 'Mobile Bar',
    pageSlug: '/mobile-bar',
    useLogo: false,
    logoUrl: undefined,
    title: 'Mobile Bar Service',
    subtitle: 'We Come to You',
    description: 'Professional bartending for your special events'
  },
  catering: {
    id: 'catering',
    pageName: 'Catering',
    pageSlug: '/catering',
    useLogo: false,
    logoUrl: undefined,
    title: 'Catering Services',
    subtitle: 'Events & Parties',
    description: 'Let us cater your next event'
  },
  reservations: {
    id: 'reservations',
    pageName: 'Reservations',
    pageSlug: '/reservations',
    useLogo: false,
    logoUrl: undefined,
    title: 'Make a Reservation',
    subtitle: 'Book Your Table',
    description: 'Reserve your spot today'
  },
  about: {
    id: 'about',
    pageName: 'About Us',
    pageSlug: '/about',
    useLogo: false,
    logoUrl: undefined,
    title: "About Kocky's",
    subtitle: 'Our Story',
    description: 'Family owned and operated since 2010'
  }
};

export function getHeroSettingsWithDefaults(pageId: string): HeroSettings {
  // Try to get cached settings first
  const saved = getHeroSettings(pageId);
  if (saved) {
    // If saved settings exist, ensure proper fallback behavior
    return {
      ...saved,
             // If no logo URL or title, ensure we have defaults
       logoUrl: saved.logoUrl || defaultHeroSettings[pageId]?.logoUrl || undefined,
      title: saved.title || defaultHeroSettings[pageId]?.title || "Kocky's Bar & Grill",
      subtitle: saved.subtitle || defaultHeroSettings[pageId]?.subtitle || '',
      description: saved.description || defaultHeroSettings[pageId]?.description || '',
      useLogo: saved.useLogo  // Use the saved useLogo setting as-is
    };
  }
  
  return defaultHeroSettings[pageId] || defaultHeroSettings.home;
}

// Clear cache to force refresh
export function clearHeroSettingsCache() {
  if (process.env.NODE_ENV === 'development') console.log('Clearing hero settings cache');
  settingsCache = {};
}

// Helper to determine what should be displayed
export function getHeroDisplay(pageId: string): {
  type: 'logo' | 'title' | 'fallback';
  content: string;
  subtitle?: string;
  description?: string;
} {
  const settings = getHeroSettingsWithDefaults(pageId);
  
  if (settings.useLogo && settings.logoUrl) {
    return {
      type: 'logo',
      content: settings.logoUrl,
      subtitle: settings.subtitle,
      description: settings.description
    };
  }
  
  if (settings.title) {
    return {
      type: 'title',
      content: settings.title,
      subtitle: settings.subtitle,
      description: settings.description
    };
  }
  
  // Fallback to logo if available, otherwise default title
  if (settings.logoUrl) {
    return {
      type: 'logo',
      content: settings.logoUrl,
      subtitle: settings.subtitle || 'Bar & Grill',
      description: settings.description
    };
  }
  
  return {
    type: 'fallback',
    content: "Kocky's",
    subtitle: settings.subtitle || 'Bar & Grill',
    description: settings.description
  };
}