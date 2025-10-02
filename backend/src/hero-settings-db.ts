// Hero settings with database persistence
import { prisma } from './lib/prisma';
import { fixLogoUrl, getLogoWithFallback, syncLogoDirectories } from './hero-logo-fix';

export interface HeroSettings {
  id: string;
  pageName: string;
  pageSlug: string;
  useLogo: boolean;
  logoUrl?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

// Default settings for initial setup
const defaultSettings: Record<string, Omit<HeroSettings, 'id'>> = {
  home: {
    pageName: 'Home',
    pageSlug: '/',
    useLogo: true,
    logoUrl: '/kockys-logo.png?v=1756432883',
    title: "Welcome to Kocky's",
    subtitle: 'Bar & Grill',
    description: 'Where Great Food Meets Unforgettable Moments'
  },
  menu: {
    pageName: 'Menu',
    pageSlug: '/menu',
    useLogo: true,
    logoUrl: '/kockys-logo.png?v=1756432883',
    title: "Our Menu",
    subtitle: 'Delicious Food & Drinks',
    description: 'Discover our amazing selection'
  },
  'happy-hour': {
    pageName: 'Happy Hour',
    pageSlug: '/happy-hour',
    useLogo: true,
    logoUrl: '/kockys-logo.png?v=1756432883',
    title: 'Happy Hour Specials',
    subtitle: 'Daily 3PM - 6PM',
    description: 'Join us for amazing drink specials and appetizer deals'
  },
  brunch: {
    pageName: 'Weekend Brunch',
    pageSlug: '/brunch',
    useLogo: true,
    logoUrl: '/kockys-logo.png?v=1756432883',
    title: 'Weekend Brunch',
    subtitle: 'Saturday & Sunday',
    description: 'Join us from 10am - 3pm for the best brunch in town'
  },
  mobile: {
    pageName: 'Mobile Bar',
    pageSlug: '/mobile-bar',
    useLogo: true,
    logoUrl: '/kockys-logo.png?v=1756432883',
    title: 'Mobile Bar Service',
    subtitle: 'We Come to You',
    description: 'Professional bartending for your special events'
  },
  "food-truck": {
    pageName: "Food Truck",
    pageSlug: "/food-truck",
    useLogo: true,
    logoUrl: "/kockys-logo.png?v=1756432883",
    title: "Food Truck Service",
    subtitle: "Mobile Dining Experience",
    description: "Bring our delicious food directly to your event"
  },
  catering: {
    pageName: 'Catering',
    pageSlug: '/catering',
    useLogo: true,
    logoUrl: '/kockys-logo.png?v=1756432883',
    title: 'Catering Services',
    subtitle: 'Events & Parties',
    description: 'Let us cater your next event'
  },
  reservations: {
    pageName: 'Reservations',
    pageSlug: '/reservations',
    useLogo: true,
    logoUrl: '/kockys-logo.png?v=1756432883',
    title: 'Make a Reservation',
    subtitle: 'Book Your Table',
    description: 'Reserve your spot today'
  },
  about: {
    pageName: 'About Us',
    pageSlug: '/about',
    useLogo: true,
    logoUrl: '/kockys-logo.png?v=1756432883',
    title: "About Kocky's",
    subtitle: 'Our Story',
    description: 'Family owned and operated since 2010'
  }
};

// Initialize default settings in database if they don't exist
export async function initializeHeroSettings() {
  try {
    // Sync logo directories first
    syncLogoDirectories();
    
    for (const [pageId, settings] of Object.entries(defaultSettings)) {
      const existing = await prisma.heroSettings.findUnique({
        where: { pageId }
      });
      
      if (!existing) {
        await prisma.heroSettings.create({
          data: {
            pageId,
            ...settings
          }
        });
        console.log(`Created default hero settings for ${pageId}`);
      } else if (existing.logoUrl) {
        // Fix any existing broken logo URLs
        const fixedUrl = fixLogoUrl(existing.logoUrl, pageId);
        if (fixedUrl !== existing.logoUrl) {
          await prisma.heroSettings.update({
            where: { pageId },
            data: { logoUrl: fixedUrl }
          });
          console.log(`Fixed logo URL for ${pageId}: ${fixedUrl}`);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing hero settings:', error);
  }
}

// Get all hero settings
export async function getAllHeroSettings(): Promise<HeroSettings[]> {
  try {
    const settings = await prisma.heroSettings.findMany();
    return settings.map((setting) => ({
      id: setting.pageId,
      pageName: setting.pageName,
      pageSlug: setting.pageSlug,
      useLogo: setting.useLogo,
      logoUrl: fixLogoUrl(setting.logoUrl, setting.pageId),
      backgroundImage: setting.backgroundImage || undefined,
      backgroundVideo: setting.backgroundVideo || undefined,
      title: setting.title || undefined,
      subtitle: setting.subtitle || undefined,
      description: setting.description || undefined
    }));
  } catch (error) {
    console.error('Error fetching hero settings:', error);
    return Object.entries(defaultSettings).map(([pageId, settings]) => ({
      id: pageId,
      ...settings,
      logoUrl: getLogoWithFallback(pageId, settings.logoUrl)
    }));
  }
}

// Get hero settings for a specific page
export async function getHeroSettings(pageId: string): Promise<HeroSettings | null> {
  try {
    const settings = await prisma.heroSettings.findUnique({
      where: { pageId }
    });
    
    if (!settings) {
      // Try to create from defaults if exists
      const defaultSetting = defaultSettings[pageId];
      if (defaultSetting) {
        const created = await prisma.heroSettings.create({
          data: {
            pageId,
            ...defaultSetting
          }
        });
        return {
          id: pageId,
          pageName: created.pageName,
          pageSlug: created.pageSlug,
          useLogo: created.useLogo,
          logoUrl: getLogoWithFallback(pageId, created.logoUrl),
          backgroundImage: created.backgroundImage || undefined,
          backgroundVideo: created.backgroundVideo || undefined,
          title: created.title || undefined,
          subtitle: created.subtitle || undefined,
          description: created.description || undefined
        };
      }
      return null;
    }
    
    // Fix logo URL to handle HTML entities and path issues
    const fixedLogoUrl = fixLogoUrl(settings.logoUrl, pageId);
    
    return {
      id: pageId,
      pageName: settings.pageName,
      pageSlug: settings.pageSlug,
      useLogo: settings.useLogo,
      logoUrl: fixedLogoUrl,
      backgroundImage: settings.backgroundImage || undefined,
      backgroundVideo: settings.backgroundVideo || undefined,
      title: settings.title || undefined,
      subtitle: settings.subtitle || undefined,
      description: settings.description || undefined
    };
  } catch (error) {
    console.error('Error fetching hero settings:', error);
    return defaultSettings[pageId] ? { id: pageId, ...defaultSettings[pageId] } : null;
  }
}

// Update hero settings for a specific page
export async function updateHeroSettings(pageId: string, settings: Partial<HeroSettings>): Promise<HeroSettings | null> {
  try {
    // Clean HTML entities from string fields
    const cleanedSettings = { ...settings };
    if (cleanedSettings.logoUrl) {
      cleanedSettings.logoUrl = cleanedSettings.logoUrl
        .replace(/&#x2F;/g, '/')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    }
    if (cleanedSettings.title) {
      cleanedSettings.title = cleanedSettings.title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    }
    if (cleanedSettings.subtitle) {
      cleanedSettings.subtitle = cleanedSettings.subtitle
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    }
    if (cleanedSettings.description) {
      cleanedSettings.description = cleanedSettings.description
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    }
    if (cleanedSettings.backgroundImage) {
      cleanedSettings.backgroundImage = cleanedSettings.backgroundImage
        .replace(/&#x2F;/g, '/')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    }
    if (cleanedSettings.backgroundVideo !== undefined) {
      if (cleanedSettings.backgroundVideo) {
        cleanedSettings.backgroundVideo = cleanedSettings.backgroundVideo
          .replace(/&#x2F;/g, '/')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'");
      } else {
        // If empty string, set to undefined to clear the field
        cleanedSettings.backgroundVideo = undefined;
      }
    }
    
    // Check if exists
    const existing = await prisma.heroSettings.findUnique({
      where: { pageId }
    });
    
    if (!existing) {
      // Create if doesn't exist
      const defaultSetting = defaultSettings[pageId];
      if (!defaultSetting) {
        throw new Error(`Page ${pageId} not found`);
      }
      
      const created = await prisma.heroSettings.create({
        data: {
          pageId,
          ...defaultSetting,
          ...cleanedSettings
        }
      });
      
      return {
        id: pageId,
        pageName: created.pageName,
        pageSlug: created.pageSlug,
        useLogo: created.useLogo,
        logoUrl: created.logoUrl || undefined,
        backgroundImage: created.backgroundImage || undefined,
        backgroundVideo: created.backgroundVideo || undefined,
        title: created.title || undefined,
        subtitle: created.subtitle || undefined,
        description: created.description || undefined
      };
    }
    
    // Update existing
    const updateData: any = {
      ...cleanedSettings,
      updatedAt: new Date()
    };
    
    // Explicitly handle undefined values for Prisma
    if (cleanedSettings.backgroundVideo === undefined) {
      updateData.backgroundVideo = null;
    }
    
    const updated = await prisma.heroSettings.update({
      where: { pageId },
      data: updateData
    });
    
    return {
      id: pageId,
      pageName: updated.pageName,
      pageSlug: updated.pageSlug,
      useLogo: updated.useLogo,
      logoUrl: updated.logoUrl || undefined,
      backgroundImage: updated.backgroundImage || undefined,
      backgroundVideo: updated.backgroundVideo || undefined,
      title: updated.title || undefined,
      subtitle: updated.subtitle || undefined,
      description: updated.description || undefined
    };
  } catch (error) {
    console.error('Error updating hero settings:', error);
    throw error;
  }
}

// Upload logo for a specific page
export async function uploadLogo(pageId: string, logoUrl: string): Promise<HeroSettings | null> {
  return updateHeroSettings(pageId, {
    logoUrl,
    useLogo: true
  });
}

// Save all hero settings at once
export async function saveAllHeroSettings(settings: HeroSettings[]): Promise<void> {
  try {
    for (const setting of settings) {
      await updateHeroSettings(setting.id, setting);
    }
  } catch (error) {
    console.error('Error saving all hero settings:', error);
    throw error;
  }
}

