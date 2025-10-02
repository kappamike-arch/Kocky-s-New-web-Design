import axios from 'axios';

// API base (should include /api) and media origin (no /api)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const MEDIA_ORIGIN = process.env.NEXT_PUBLIC_MEDIA_URL || 'https://staging.kockys.com';

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroVideo?: string;
  heroLogo?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  customCss?: string;
  customJs?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const pageContentAPI = {
  // Get page content by slug (public route) - FIXED: Use hero-settings endpoint
  getBySlug: async (slug: string): Promise<PageContent | null> => {
    try {
      // Use hero-settings endpoint instead of page-content
      const response = await axios.get(`${API_BASE_URL}/hero-settings/${slug}`);
      const heroData = response.data;
      
      // Transform hero-settings data to PageContent format
      const pageContent: PageContent = {
        id: heroData.id || slug,
        slug: slug,
        title: heroData.title || 'Welcome to Kocky\'s',
        heroTitle: heroData.title,
        heroSubtitle: heroData.subtitle,
        heroImage: heroData.backgroundImage,
        heroVideo: heroData.backgroundVideo,
        heroLogo: heroData.logoUrl,
        content: heroData.description,
        metaTitle: heroData.title,
        metaDescription: heroData.description,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log(`[HERO] Loaded hero settings for ${slug}:`, pageContent);
      return pageContent;
    } catch (error) {
      console.error(`Failed to fetch hero settings for ${slug}:`, error);
      return null;
    }
  },

  // Check if hero video URL exists
  checkVideoUrl: async (videoUrl: string): Promise<boolean> => {
    try {
      const response = await axios.head(`${MEDIA_ORIGIN}${videoUrl}`);
      return response.status === 200;
    } catch (error) {
      console.error(`Video URL check failed for ${videoUrl}:`, error);
      return false;
    }
  }
};
