'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { UPLOADS_URL } from '@/lib/config';
import { normalizeImageUrl } from '@/lib/images/url';

// Menu Item Interface
interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  category: string;
  image?: string;
  imageUrl?: string;
  featured?: boolean;
  available?: boolean;
  tags?: string[];
  allergens?: string[];
}

// API Response Interface
interface MenuResponse {
  success: boolean;
  data: MenuItem[];
}

// Menu Item Card Component
function MenuItemCard({ item }: { item: MenuItem }) {
  // Validate item data
  if (!item || !item.id || !item.name) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">Invalid menu item data</p>
      </div>
    );
  }

  const numericPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price ?? '');
  const price = Number.isFinite(numericPrice)
    ? `$${numericPrice.toFixed(2)}`
    : String(item.price ?? 'N/A');

  // Use normalized image URL
  const imageUrl = normalizeImageUrl(item.imageUrl || item.image);

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
      {/* Featured Badge */}
      {item.featured && (
        <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          Featured
        </div>
      )}

      {/* Unavailable Badge */}
      {item.available === false && (
        <div className="absolute top-2 right-2 z-10 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          Unavailable
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Image failed to load:', imageUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <span className="text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
            {item.name}
          </h3>
          <span className="text-lg font-bold text-orange-500 ml-2 flex-shrink-0">
            {price}
          </span>
        </div>
        
        {/* Description */}
        {item.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {item.tags.map((tag, index) => (
              <span
                key={`${item.id}-tag-${index}`}
                className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Allergens */}
        {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {item.allergens.map((allergen, index) => (
              <span
                key={`${item.id}-allergen-${index}`}
                className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full"
              >
                {allergen}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Menu Section Component
function MenuSection({ title, items, description }: { 
  title: string; 
  items: MenuItem[]; 
  description?: string; 
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );
}

// Error Component
function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <p className="text-red-600 mb-4">{message}</p>
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Menu Items Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Our menu is being updated. Please check back soon!
        </p>
      </div>
    </div>
  );
}

// Main Menu Page Component
export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.get<MenuResponse>('/menu');

      if (data?.success && Array.isArray(data.data)) {
        const normalisedItems = data.data
          .filter((item): item is MenuItem => Boolean(item && item.id && item.name))
          .map((item) => ({
            ...item,
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price ?? '0') || item.price,
            imageUrl: item.imageUrl || item.image,
          }));

        setMenuItems(normalisedItems);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching menu items:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Filter menu items by category and availability
  const availableItems = menuItems.filter(item => item.available !== false);
  const featuredItems = availableItems.filter(item => item.featured === true);
  
  // Group items by category
  const itemsByCategory = availableItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Category display names and order
  const categoryConfig = {
    'APPETIZER': { name: 'Appetizers', order: 1 },
    'ENTREE': { name: 'Entrées', order: 2 },
    'DESSERT': { name: 'Desserts', order: 3 },
    'DRINK': { name: 'Drinks', order: 4 },
    'BEER': { name: 'Beer', order: 5 },
    'WINE': { name: 'Wine', order: 6 },
    'COCKTAIL': { name: 'Cocktails', order: 7 },
  };

  // Sort categories by order
  const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
    const orderA = categoryConfig[a as keyof typeof categoryConfig]?.order || 999;
    const orderB = categoryConfig[b as keyof typeof categoryConfig]?.order || 999;
    return orderA - orderB;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Menu</h1>
            <p className="text-xl mb-2">Discover Our Delicious Menu</p>
            <p className="text-gray-300">From appetizers to desserts, we have something for everyone</p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Menu</h1>
            <p className="text-xl mb-2">Discover Our Delicious Menu</p>
            <p className="text-gray-300">From appetizers to desserts, we have something for everyone</p>
          </div>
        </div>
        <ErrorMessage message={error} onRetry={fetchMenuItems} />
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Menu</h1>
            <p className="text-xl mb-2">Discover Our Delicious Menu</p>
            <p className="text-gray-300">From appetizers to desserts, we have something for everyone</p>
          </div>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Menu</h1>
          <p className="text-xl mb-2">Discover Our Delicious Menu</p>
          <p className="text-gray-300">From appetizers to desserts, we have something for everyone</p>
        </div>
      </div>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <MenuSection 
          title="Chef's Recommendations" 
          items={featuredItems}
          description="Our most popular and highly rated dishes"
        />
      )}

      {/* Menu Categories */}
      {sortedCategories.map((category) => {
        const categoryName = categoryConfig[category as keyof typeof categoryConfig]?.name || category;
        const items = itemsByCategory[category];
        
        return (
          <MenuSection 
            key={category}
            title={categoryName} 
            items={items}
          />
        );
      })}
    </div>
  );
}