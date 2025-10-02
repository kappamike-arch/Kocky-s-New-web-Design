'use client';

import { useState, useRef } from 'react';
import { MEDIA_BASE_URL, UPLOADS_URL, UPLOADS_PREFIX } from '@/lib/config';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menu } from '@/lib/api/menu';
import {
  Plus, Edit, Trash2, Star, Clock,
  Search, Upload, Check, Coffee
} from 'lucide-react';
import toast from 'react-hot-toast';

const PLACEHOLDER_IMAGE = '/admin/placeholder-menu.svg';

interface MenuItemForm {
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  tags: string[];
  allergens: string[];
  available: boolean;
  featured: boolean;
  preparationTime: number;
  image: File | null;
}

export default function MenuManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<MenuItemForm>({
    name: '',
    description: '',
    category: 'APPETIZER',
    price: 0,
    imageUrl: '',
    tags: [],
    allergens: [],
    available: true,
    featured: false,
    preparationTime: 15,
    image: null,
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch menu items
  const { data, isLoading, error } = useQuery({
    queryKey: ['menu-items', categoryFilter],
    queryFn: () => menu.getAll({
      category: categoryFilter === 'ALL' ? undefined : categoryFilter,
    }),
    retry: 1,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => menu.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item created');
      setShowCreateModal(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create menu item');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => menu.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item updated');
      setEditingItem(null);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to update menu item');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => menu.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item deleted');
    },
    onError: () => {
      toast.error('Failed to delete menu item');
    },
  });

  // Toggle availability
  const toggleAvailabilityMutation = useMutation({
    mutationFn: (id: string) => menu.toggleAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Availability updated');
    },
  });

  // Toggle featured
  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: string) => menu.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Featured status updated');
    },
  });

  const resetForm = () => {
    setUploadedFile(null);
    setFormData({
      name: '',
      description: '',
      category: 'APPETIZER',
      price: 0,
      imageUrl: '',
      tags: [],
      allergens: [],
      available: true,
      featured: false,
      preparationTime: 15,
      image: null,
    });
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setUploadedFile(null);
    const currentImage = item.imageUrl || item.image || '';
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'APPETIZER',
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0') || 0,
      imageUrl: currentImage,
      tags: item.tags || [],
      allergens: item.allergens || [],
      available: item.available !== undefined ? item.available : true,
      featured: item.featured || false,
      preparationTime: item.preparationTime || item.prepTime || 15,
      image: null,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Record<string, any> = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      preparationTime: formData.preparationTime,
      available: formData.available,
      featured: formData.featured,
      tags: formData.tags,
      allergens: formData.allergens,
    };

    if (uploadedFile) {
      payload.image = uploadedFile;
    } else if (formData.imageUrl && !formData.imageUrl.startsWith('blob:')) {
      payload.imageUrl = formData.imageUrl;
    } else {
      payload.imageUrl = null;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl: previewUrl, image: file }));
      toast.success('Image selected');
    }
  };

  const items = Array.isArray(data?.items) ? data?.items : (Array.isArray(data?.data) ? data?.data : []);
  const filteredItems = items.filter((item: any) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Group items by category
  const groupedItems = filteredItems.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = ['APPETIZER', 'ENTREE', 'DESSERT', 'DRINK', 'BEER', 'WINE', 'COCKTAIL'];

  const resolveImageSrc = (item: any) => {
    const url = item.imageUrl || item.image;
    if (!url) return PLACEHOLDER_IMAGE;
    if (url.startsWith('blob:')) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${MEDIA_BASE_URL}${url}`;
    return `${MEDIA_BASE_URL}${UPLOADS_PREFIX}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Mock data if API not available
  const mockItems = [
    {
      id: '1',
      name: 'Classic Burger',
      description: 'Juicy beef patty with lettuce, tomato, and special sauce',
      category: 'APPETIZER',
      price: 12.99,
      image: '/api/placeholder/200/150',
      available: true,
      featured: true,
      tags: ['Beef', 'Lettuce', 'Tomato', 'Cheese'],
      allergens: ['Gluten', 'Dairy'],
      preparationTime: 15,
    },
    {
      id: '2',
      name: 'Craft Beer',
      description: 'Local brewery selection',
      category: 'BEER',
      price: 6.50,
      image: '/api/placeholder/200/150',
      available: true,
      featured: false,
      tags: [],
      allergens: [],
      preparationTime: 5,
    },
    {
      id: '3',
      name: 'Happy Hour Wings',
      description: 'Spicy buffalo wings with ranch',
      category: 'APPETIZER',
      price: 8.99,
      image: '/api/placeholder/200/150',
      available: true,
      featured: true,
      tags: ['Spicy', 'Wings'],
      allergens: ['Dairy'],
      preparationTime: 20,
    },
  ];

  const displayItems = error ? mockItems : filteredItems;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Menu Management</h1>
        <p className="text-gray-600">Add, edit, and organize your menu items</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </motion.button>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No menu items found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]: [string, any]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-orange-500">●</span>
                  {category}
                  <span className="text-sm text-gray-500">({items.length} items)</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item: any) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={resolveImageSrc(item)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex gap-2">
                          {item.featured && (
                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                              Featured
                            </span>
                          )}
                          {!item.available && (
                            <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-orange-500">
                            ${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || '0').toFixed(2)}
                          </span>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
                          {item.preparationTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.preparationTime} min
                            </div>
                          )}
                          {item.calories > 0 && (
                            <div>{item.calories} cal</div>
                          )}
                          {item.spiceLevel > 0 && (
                            <div className="flex items-center">
                              {[...Array(item.spiceLevel)].map((_, i) => (
                                <span key={i}>🌶️</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Allergens */}
                        {item.allergens?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.allergens.map((allergen: string) => (
                              <span
                                key={allergen}
                                className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                              >
                                {allergen}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleAvailabilityMutation.mutate(item.id)}
                              className={`p-2 rounded ${
                                item.available
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title="Toggle Availability"
                            >
                              <Check className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleFeaturedMutation.mutate(item.id)}
                              className={`p-2 rounded ${
                                item.featured
                                  ? 'text-yellow-500 hover:bg-yellow-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title="Toggle Featured"
                            >
                              <Star className="w-4 h-4" />
                            </motion.button>
                          </div>
                          
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                if (confirm('Delete this item?')) {
                                  deleteMutation.mutate(item.id);
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingItem) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowCreateModal(false);
              setEditingItem(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name*</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Category*</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Prep Time (min)</label>
                    <input
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 15 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </button>
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    ) : (
                      <img
                        src={PLACEHOLDER_IMAGE}
                        alt="Placeholder"
                        className="h-20 w-20 object-cover rounded"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Available</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
