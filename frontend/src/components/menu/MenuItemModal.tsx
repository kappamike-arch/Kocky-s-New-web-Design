'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuItem } from './MenuCard';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<MenuItem>) => Promise<void>;
  item?: MenuItem | null;
  category?: string;
}

export function MenuItemModal({
  isOpen,
  onClose,
  onSave,
  item,
  category = 'food',
}: MenuItemModalProps) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: category,
    featured: false,
    available: true,
    spicyLevel: 0,
    dietaryInfo: [],
    ...item,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(item?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setFormData(item);
      setImagePreview(item.image || null);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: category,
        featured: false,
        available: true,
        spicyLevel: 0,
        dietaryInfo: [],
      });
      setImagePreview(null);
    }
  }, [item, category]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDietaryInfoToggle = (info: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryInfo: prev.dietaryInfo?.includes(info)
        ? prev.dietaryInfo.filter(i => i !== info)
        : [...(prev.dietaryInfo || []), info],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error('Please enter item name');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success(item ? 'Item updated successfully' : 'Item added successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Keto',
    'Organic',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {item ? 'Edit Menu Item' : 'Add Menu Item'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Item Image</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {imagePreview ? (
                        <>
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData(prev => ({ ...prev, image: undefined }));
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Upload className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Image
                    </Button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                      placeholder="e.g. Cheeseburger"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="food">Food</option>
                      <option value="drinks">Drinks</option>
                      <option value="appetizers">Appetizers</option>
                      <option value="desserts">Desserts</option>
                      <option value="specials">Specials</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Brief description of the item"
                  />
                </div>

                {/* Spicy Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Spicy Level
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, spicyLevel: level })}
                        className={`px-3 py-1 rounded-lg border ${
                          formData.spicyLevel === level
                            ? 'bg-red-500 text-white border-red-500'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {level === 0 ? 'None' : '🌶️'.repeat(level)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Info */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dietary Information
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleDietaryInfoToggle(option)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          formData.dietaryInfo?.includes(option)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Featured Item</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Available</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
