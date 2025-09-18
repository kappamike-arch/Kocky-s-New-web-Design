import axios from 'axios';

const API_BASE = 'https://staging.kockys.com/api';

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  happyHourPrice?: number | null;
  image?: string | null;
  category: string;
  servingSize?: string | null;
  featured: boolean;
  available: boolean;
  rating?: number;
  dietaryInfo?: string[];
  allergens?: string[];
  tags?: string[];
  spicyLevel?: number;
}

export interface MenuSection {
  id: string;
  name: string;
  description?: string | null;
  displayMode: 'FULL_DETAILS' | 'TITLE_ONLY';
  items: MenuItem[];
}

export interface MenuResponse {
  sections: MenuSection[];
  featured: MenuItem[];
}

/**
 * Fetch menu items from the backend API
 * @param menuType - Type of menu to fetch (REGULAR, HAPPY_HOUR, BRUNCH, SPECIALS)
 * @returns Promise with menu data
 */
export async function fetchMenuFromAPI(menuType: 'REGULAR' | 'HAPPY_HOUR' | 'BRUNCH' | 'SPECIALS'): Promise<MenuResponse | null> {
  try {
    const response = await axios.get(`${API_BASE}/enhanced-menu/frontend`, {
      params: { menuType }
    });
    
    if (response.data.success && response.data.data) {
      const { sections, featured } = response.data.data;
      
      // Format image URLs
      const formatItems = (items: any[]): MenuItem[] => {
        return items.map((item: any) => ({
          ...item,
          image: item.image ? `${API_BASE.replace('/api', '')}${item.image}` : null,
          category: item.category?.toLowerCase() || 'appetizers',
          rating: item.rating || 4.5,
          dietaryInfo: Array.isArray(item.tags) ? item.tags : [],
          allergens: Array.isArray(item.allergens) ? item.allergens : []
        }));
      };
      
      return {
        sections: sections.map((section: any) => ({
          ...section,
          items: formatItems(section.items)
        })),
        featured: formatItems(featured)
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch ${menuType} menu:`, error);
    return null;
  }
}

/**
 * Transform API menu data to flat MenuItem array for components
 */
export function flattenMenuSections(menuData: MenuResponse): MenuItem[] {
  const items: MenuItem[] = [];
  
  // Add all items from sections
  menuData.sections.forEach(section => {
    section.items.forEach(item => {
      if (!items.find(i => i.id === item.id)) {
        items.push(item);
      }
    });
  });
  
  // Add featured items if not already included
  menuData.featured.forEach(item => {
    if (!items.find(i => i.id === item.id)) {
      items.push(item);
    }
  });
  
  return items;
}
