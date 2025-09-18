'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menu } from '@/lib/api/menu';
import { formatPrice, parseMenuItems } from '@/lib/utils/price';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Plus, Edit, Trash2, Image, Star, DollarSign, Clock,
  Search, Filter, Upload, X, Check, AlertCircle, Coffee
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MenuManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Food',
    section: '',
    servingSize: '',
    price: 0,
    imageUrl: '',
    imageFile: null as File | null,
    ingredients: [] as string[],
    allergens: [] as string[],
    dietaryRestrictions: [] as string[],
    spiceLevel: 0,
    isAvailable: true,
    isFeatured: false,
    isSpecial: false,
    specialPrice: 0,
    preparationTime: 15,
    calories: 0,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
    setFormData({
      name: '',
      description: '',
      category: 'Food',
      section: '',
      servingSize: '',
      price: 0,
      imageUrl: '',
      imageFile: null,
      ingredients: [],
      allergens: [],
      dietaryRestrictions: [],
      spiceLevel: 0,
      isAvailable: true,
      isFeatured: false,
      isSpecial: false,
      specialPrice: 0,
      preparationTime: 15,
      calories: 0,
    });
    setValidationErrors({});
    setTouched({});
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    // Ensure section is a string, not an object
    const sectionValue = typeof item.section === 'object' && item.section?.value 
      ? item.section.value 
      : (typeof item.section === 'object' && item.section?.label
        ? item.section.label
        : (item.section || item.subcategory || ''));
    
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: typeof item.category === 'object' && item.category?.value 
        ? item.category.value 
        : (item.category || 'Food'),
      section: sectionValue,
      servingSize: item.servingSize || '',
      price: item.price || 0,
      imageUrl: item.imageUrl || item.image || '',
      imageFile: null,
      ingredients: Array.isArray(item.ingredients) 
        ? item.ingredients.map((ing: any) => typeof ing === 'object' ? (ing.value || ing.label || ing) : ing)
        : [],
      allergens: Array.isArray(item.allergens) 
        ? item.allergens.map((all: any) => typeof all === 'object' ? (all.value || all.label || all) : all)
        : [],
      dietaryRestrictions: Array.isArray(item.dietaryRestrictions) 
        ? item.dietaryRestrictions.map((dr: any) => typeof dr === 'object' ? (dr.value || dr.label || dr) : dr)
        : [],
      spiceLevel: item.spiceLevel || 0,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      isFeatured: item.isFeatured || false,
      isSpecial: item.isSpecial || false,
      specialPrice: item.specialPrice || 0,
      preparationTime: item.preparationTime || 15,
      calories: item.calories || 0,
    });
    setValidationErrors({});
    setTouched({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Item name is required';
    }
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (formData.isSpecial && formData.specialPrice && formData.specialPrice >= formData.price) {
      errors.specialPrice = 'Special price must be less than regular price';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    const submitData = formData.imageFile ? 
      createFormDataForSubmit() : 
      { ...formData, imageFile: undefined };
    
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const createFormDataForSubmit = () => {
    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'imageFile' && value) {
        submitFormData.append('image', value as File);
      } else if (value !== null && value !== undefined && key !== 'imageFile') {
        if (Array.isArray(value)) {
          submitFormData.append(key, JSON.stringify(value));
        } else {
          submitFormData.append(key, String(value));
        }
      }
    });
    return submitFormData;
  };

  const handleImageUpload = (files: FileList) => {
    const file = files[0];
    if (file) {
      // Store the file for upload
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl: previewUrl }));
      
      toast.success('Image selected');
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateForm();
  };

  const filteredItems = data?.data?.filter((item: any) =>
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

  const categories = [
    { value: 'Food', label: 'Food' },
    { value: 'Drinks', label: 'Drinks' },
    { value: 'Happy Hour', label: 'Happy Hour' },
    { value: 'Specials', label: 'Specials' },
    { value: 'Appetizers', label: 'Appetizers' },
    { value: 'Entrees', label: 'Entrees' },
    { value: 'Desserts', label: 'Desserts' }
  ];
  
  // Get unique sections from items
  const sections = Array.from(new Set(
    filteredItems
      .map((item: any) => {
        const section = item.section || item.subcategory;
        // Handle if section is an object
        if (typeof section === 'object' && section) {
          return section.value || section.label || '';
        }
        return section;
      })
      .filter(Boolean)
  )).map(section => ({
    value: section,
    label: section
  }));
  
  // Add some default sections if none exist
  if (sections.length === 0) {
    sections.push(
      { value: 'Appetizers', label: 'Appetizers' },
      { value: 'Entrees', label: 'Entrees' },
      { value: 'Desserts', label: 'Desserts' },
      { value: 'Beverages', label: 'Beverages' }
    );
  }
  
  // Remove duplicates from sections
  const uniqueSections = sections.filter((section, index, self) =>
    index === self.findIndex((s) => s.value === section.value)
  );

  // Mock data if API not available
  const mockItems = [
    {
      id: '1',
      name: 'Classic Burger',
      description: 'Juicy beef patty with lettuce, tomato, and special sauce',
      category: 'Food',
      price: 12.99,
      imageUrl: '/api/placeholder/200/150',
      isAvailable: true,
      isFeatured: true,
      ingredients: ['Beef', 'Lettuce', 'Tomato', 'Cheese'],
      allergens: ['Gluten', 'Dairy'],
      spiceLevel: 0,
    },
    {
      id: '2',
      name: 'Craft Beer',
      description: 'Local brewery selection',
      category: 'Drinks',
      price: 6.50,
      imageUrl: '/api/placeholder/200/150',
      isAvailable: true,
      isFeatured: false,
    },
    {
      id: '3',
      name: 'Happy Hour Wings',
      description: 'Spicy buffalo wings with ranch',
      category: 'Happy Hour',
      price: 8.99,
      specialPrice: 5.99,
      imageUrl: '/api/placeholder/200/150',
      isAvailable: true,
      isSpecial: true,
      spiceLevel: 3,
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
                <option key={cat.value} value={cat.value}>{cat.label}</option>
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
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/uploads') 
                              ? `http://72.167.227.205:5001${item.imageUrl}` 
                              : item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/api/placeholder/200/150';
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Image className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex gap-2">
                          {item.isFeatured && (
                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                              Featured
                            </span>
                          )}
                          {item.isSpecial && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                              Special
                            </span>
                          )}
                          {!item.isAvailable && (
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
                            ${(Number(item.price) || 0).toFixed(2)}
                          </span>
                          {item.isSpecial && item.specialPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${(Number(item.specialPrice) || 0).toFixed(2)}
                            </span>
                          )}
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
                            {item.allergens.map((allergen: any, index: number) => {
                              const allergenText = typeof allergen === 'object' 
                                ? (allergen.value || allergen.label || '')
                                : allergen;
                              return (
                                <span
                                  key={`allergen-${index}`}
                                  className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                                >
                                  {allergenText}
                                </span>
                              );
                            })}
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
                                item.isAvailable
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
                                item.isFeatured
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
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 pb-4 border-b">
                <h2 className="text-xl font-bold">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 pt-4">

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onBlur={() => handleFieldBlur('name')}
                      placeholder="e.g., Classic Cheeseburger"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                        touched.name && validationErrors.name 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300'
                      }`}
                    />
                    {touched.name && validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      options={categories}
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      placeholder="Select a category..."
                      className={touched.category && validationErrors.category ? 'border-red-500' : ''}
                    />
                    {touched.category && validationErrors.category && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Juicy beef patty with lettuce, tomato, and our special sauce"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section
                    </label>
                    <SearchableSelect
                      options={uniqueSections}
                      value={formData.section}
                      onValueChange={(value) => setFormData({ ...formData, section: value })}
                      placeholder="Select or type a section..."
                      allowCustomValue={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serving Size
                    </label>
                    <input
                      type="text"
                      value={formData.servingSize}
                      onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                      placeholder="e.g., 8 oz or 2 pieces"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      onBlur={() => handleFieldBlur('price')}
                      placeholder="0.00"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                        touched.price && validationErrors.price 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300'
                      }`}
                    />
                    {touched.price && validationErrors.price && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.specialPrice}
                      onChange={(e) => setFormData({ ...formData, specialPrice: parseFloat(e.target.value) })}
                      onBlur={() => handleFieldBlur('specialPrice')}
                      placeholder="0.00"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                        touched.specialPrice && validationErrors.specialPrice 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300'
                      }`}
                    />
                    {touched.specialPrice && validationErrors.specialPrice && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.specialPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prep Time (min)
                    </label>
                    <input
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                      placeholder="15"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <DragDropZone
                    onFilesSelected={handleImageUpload}
                    accept="image/*"
                    maxSize={5}
                    currentImage={formData.imageUrl}
                  />
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Item Status
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-gray-200">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium">Available</span>
                      {formData.isAvailable && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-gray-200">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium">Featured</span>
                      {formData.isFeatured && <Star className="w-4 h-4 text-yellow-500 ml-auto" />}
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-gray-200">
                      <input
                        type="checkbox"
                        checked={formData.isSpecial}
                        onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium">Special Offer</span>
                      {formData.isSpecial && <DollarSign className="w-4 h-4 text-green-500 ml-auto" />}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors shadow-sm"
                  >
                    {editingItem ? 'Update Item' : 'Save Item'}
                  </button>
                </div>
              </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
