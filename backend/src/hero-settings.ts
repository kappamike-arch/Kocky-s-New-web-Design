// Hero settings storage and management
// This is a simple in-memory store for hero settings
// In production, this would be stored in a database

export interface HeroSettings {
  id: string;
  pageName: string;
  pageSlug: string;
  useLogo: boolean;
  logoUrl?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

// In-memory storage for hero settings
let heroSettingsStore: { [key: string]: HeroSettings } = {
  home: {
    id: 'home',
    pageName: 'Home',
    pageSlug: '/',
    useLogo: true,
    logoUrl: '/logo.svg',
    title: "Welcome to Kocky's",
    subtitle: 'Bar & Grill',
    description: 'Where Great Food Meets Unforgettable Moments'
  },
  menu: {
    id: 'menu',
    pageName: 'Menu',
    pageSlug: '/menu',
    useLogo: true,
    logoUrl: '/logo.svg',
    title: "Our Menu",
    subtitle: 'Delicious Food & Drinks',
    description: 'Discover our amazing selection'
  },
  'happy-hour': {
    id: 'happy-hour',
    pageName: 'Happy Hour',
    pageSlug: '/happy-hour',
    useLogo: true,
    logoUrl: '/logo.svg',
    title: 'Happy Hour Specials',
    subtitle: 'Daily 3PM - 6PM',
    description: 'Join us for amazing drink specials and appetizer deals'
  },
  brunch: {
    id: 'brunch',
    pageName: 'Weekend Brunch',
    pageSlug: '/brunch',
    useLogo: true,
    logoUrl: '/logo.svg',
    title: 'Weekend Brunch',
    subtitle: 'Saturday & Sunday',
    description: 'Join us from 10am - 3pm for the best brunch in town'
  },
  mobile: {
    id: 'mobile',
    pageName: 'Mobile Bar',
    pageSlug: '/mobile-bar',
    useLogo: true,
    logoUrl: '/logo.svg',
    title: 'Mobile Bar Service',
    subtitle: 'We Come to You',
    description: 'Professional bartending for your special events'
  },
  catering: {
    id: 'catering',
    pageName: 'Catering',
    pageSlug: '/catering',
    useLogo: true,
    logoUrl: '/logo.svg',
    title: 'Catering Services',
    subtitle: 'Events & Parties',
    description: 'Let us cater your next event'
  },
  reservations: {
    id: 'reservations',
    pageName: 'Reservations',
    pageSlug: '/reservations',
    useLogo: true,
    logoUrl: '/logo.svg',
    title: 'Make a Reservation',
    subtitle: 'Book Your Table',
    description: 'Reserve your spot today'
  },
  about: {
    id: 'about',
    pageName: 'About Us',
    pageSlug: '/about',
    useLogo: true,
    logoUrl: '/logo.svg',
    title: "About Kocky's",
    subtitle: 'Our Story',
    description: 'Family owned and operated since 2010'
  },
  gallery: {
    id: 'gallery',
    pageName: 'Gallery',
    pageSlug: '/gallery',
    useLogo: true,
    logoUrl: '/logo.svg',
    title: 'Gallery',
    subtitle: 'Memories & Moments',
    description: 'Explore the vibrant atmosphere of Kocky\'s'
  }
};

// Get all hero settings
export function getAllHeroSettings(): HeroSettings[] {
  return Object.values(heroSettingsStore);
}

// Get hero settings for a specific page
export function getHeroSettings(pageId: string): HeroSettings | null {
  return heroSettingsStore[pageId] || null;
}

// Update hero settings for a specific page
export function updateHeroSettings(pageId: string, settings: Partial<HeroSettings>): HeroSettings {
  if (!heroSettingsStore[pageId]) {
    throw new Error(`Page ${pageId} not found`);
  }
  
  heroSettingsStore[pageId] = {
    ...heroSettingsStore[pageId],
    ...settings,
    id: pageId // Ensure ID doesn't change
  };
  
  return heroSettingsStore[pageId];
}

// Save all hero settings at once
export function saveAllHeroSettings(settings: HeroSettings[]): void {
  settings.forEach(setting => {
    if (setting.id) {
      heroSettingsStore[setting.id] = setting;
    }
  });
}

// Upload logo for a specific page
export function uploadLogo(pageId: string, logoUrl: string): HeroSettings | null {
  if (!heroSettingsStore[pageId]) {
    return null;
  }
  
  heroSettingsStore[pageId] = {
    ...heroSettingsStore[pageId],
    logoUrl,
    useLogo: true // Automatically enable logo when uploading
  };
  
  return heroSettingsStore[pageId];
}
