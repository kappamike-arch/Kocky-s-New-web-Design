import axios from 'axios';

// API base (should include /api) and media origin (no /api)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://72.167.227.205:5001/api';
const MEDIA_ORIGIN = API_BASE_URL.replace(/\/?api$/, '');

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
  // Get page content by slug (public route)
  getBySlug: async (slug: string): Promise<PageContent | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/page-content/public/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch page content for ${slug}:`, error);
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
