import { api } from './api';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  image?: string;
  imageUrl?: string;
  ingredients?: string[];
  allergens?: string[];
  dietaryRestrictions?: string[];
  spiceLevel?: number;
  available?: boolean;
  isAvailable?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  special?: boolean;
  isSpecial?: boolean;
  specialPrice?: number;
  specialStartDate?: string;
  specialEndDate?: string;
  preparationTime?: number;
  prepTime?: number;
  calories?: number;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  image?: File;
  imageUrl?: string;
  ingredients?: string[];
  allergens?: string[];
  dietaryRestrictions?: string[];
  spiceLevel?: number;
  available?: boolean;
  isAvailable?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  special?: boolean;
  isSpecial?: boolean;
  specialPrice?: number;
  specialStartDate?: string;
  specialEndDate?: string;
  preparationTime?: number;
  prepTime?: number;
  calories?: number;
  sortOrder?: number;
}

export interface UpdateMenuItemData extends Partial<CreateMenuItemData> {}

export const menu = {
  // Get all menu items
  getAll: async (params?: {
    category?: string;
    subcategory?: string;
    isAvailable?: boolean;
    isFeatured?: boolean;
    isSpecial?: boolean;
    search?: string;
  }) => {
    const response = await api.get('/menu', { params });
    return response.data;
  },

  // Get single menu item
  getById: async (id: string) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },

  // Create new menu item - handles both JSON and multipart/form-data
  create: async (data: CreateMenuItemData | FormData) => {
    let formData: FormData;
    
    // If data is already FormData, use it directly
    if (data instanceof FormData) {
      formData = data;
    } else {
      // Always use FormData for consistency with file uploads
      formData = new FormData();
      
      // Add all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else if (key === 'imageUrl' && value instanceof File) {
            // Skip if it's actually a File object
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }
    
    const response = await api.post('/menu', formData);
    return response.data;
  },

  // Update menu item - handles both JSON and multipart/form-data
  update: async (id: string, data: UpdateMenuItemData | FormData) => {
    let formData: FormData;
    
    // If data is already FormData, use it directly
    if (data instanceof FormData) {
      formData = data;
    } else {
      // Convert to FormData if there's an image or for consistency
      formData = new FormData();
      
      // Add all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }
    
    const response = await api.put(`/menu/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete menu item
  delete: async (id: string) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },

  // Upload menu item image
  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/menu/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Toggle availability
  toggleAvailability: async (id: string) => {
    const response = await api.patch(`/menu/${id}/toggle-availability`);
    return response.data;
  },

  // Toggle featured
  toggleFeatured: async (id: string) => {
    const response = await api.patch(`/menu/${id}/toggle-featured`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    // Return default categories for now
    return [
      { id: 'appetizers', name: 'Appetizers' },
      { id: 'salads', name: 'Salads' },
      { id: 'burgers', name: 'Burgers' },
      { id: 'sandwiches', name: 'Sandwiches' },
      { id: 'entrees', name: 'Entrees' },
      { id: 'desserts', name: 'Desserts' },
      { id: 'drinks', name: 'Drinks' },
      { id: 'beer', name: 'Beer' },
      { id: 'wine', name: 'Wine' },
      { id: 'cocktails', name: 'Cocktails' },
    ];
  },

  // Bulk update sort order
  updateSortOrder: async (items: { id: string; sortOrder: number }[]) => {
    const response = await api.post('/menu/sort-order', { items });
    return response.data;
  },
};