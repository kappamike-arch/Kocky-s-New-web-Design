// CMS functions completely disabled - GraphQL not available
// All functions return null to prevent GraphQL calls

export const cms = {
  // Get menu items (disabled)
  getMenuItems: async (category?: string) => {
    return null;
  },

  // Get featured menu items (disabled)
  getFeaturedItems: async (limit = 6) => {
    return null;
  },

  // Get page by slug (disabled)
  getPage: async (slug: string) => {
    return null;
  },

  // Get active theme (disabled)
  getActiveTheme: async () => {
    return null;
  },

  // Get quote templates (disabled)
  getQuoteTemplates: async (type?: string) => {
    return null;
  },
};