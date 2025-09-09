import { api } from './client';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  imageUrl?: string;
  ingredients?: string[];
  allergens?: string[];
  dietaryRestrictions?: string[];
  spiceLevel?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isSpecial: boolean;
  specialPrice?: number;
  specialStartDate?: string;
  specialEndDate?: string;
  preparationTime?: number;
  calories?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  imageUrl?: string;
  ingredients?: string[];
  allergens?: string[];
  dietaryRestrictions?: string[];
  spiceLevel?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isSpecial?: boolean;
  specialPrice?: number;
  specialStartDate?: string;
  specialEndDate?: string;
  preparationTime?: number;
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

  // Create new menu item
  create: async (data: CreateMenuItemData) => {
    const response = await api.post('/menu', data);
    return response.data;
  },

  // Update menu item
  update: async (id: string, data: UpdateMenuItemData) => {
    const response = await api.patch(`/menu/${id}`, data);
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
    const response = await api.get('/menu/categories');
    return response.data;
  },

  // Bulk update sort order
  updateSortOrder: async (items: { id: string; sortOrder: number }[]) => {
    const response = await api.post('/menu/sort-order', { items });
    return response.data;
  },
};

