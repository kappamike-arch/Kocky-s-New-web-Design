'use client';

import React from 'react';

// Menu Item Interface
interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  category: string;
  image?: string;
  featured?: boolean;
  rating?: number;
  dietaryInfo?: string[];
}

// Static menu data - no external dependencies
const MENU_ITEMS: MenuItem[] = [
  {
    id: 'app1',
    name: 'Loaded Potato Skins',
    description: 'Crispy potato skins topped with bacon, cheese, and sour cream',
    price: 9.99,
    category: 'appetizers',
    image: 'http://72.167.227.205/uploads/gallery/gallery-1757005147531-560817189.jpg',
    featured: true,
    rating: 4.6,
  },
  {
    id: 'app2',
    name: 'Spinach Artichoke Dip',
    description: 'Creamy blend served with tortilla chips',
    price: 8.99,
    category: 'appetizers',
    image: 'http://72.167.227.205/uploads/gallery/gallery-1757007192434-466496930.jpg',
    dietaryInfo: ['Vegetarian'],
    rating: 4.5,
  },
  {
    id: 'ent1',
    name: "Kocky's Signature Burger",
    description: 'Double patty with special sauce, lettuce, cheese, pickles on a sesame seed bun',
    price: 14.99,
    category: 'entrees',
    image: 'http://72.167.227.205/uploads/gallery/gallery-1757009264753-353858963.jpg',
    featured: true,
    rating: 4.9,
  },
  {
    id: 'ent2',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce, served with vegetables',
    price: 22.99,
    category: 'entrees',
    image: 'http://72.167.227.205/uploads/gallery/gallery-1757029981874-936868913.png',
    dietaryInfo: ['Gluten-Free'],
    rating: 4.7,
  },
  {
    id: 'drk1',
    name: 'Craft Beer Flight',
    description: 'Sample four of our rotating craft beers',
    price: 12,
    category: 'drinks',
    image: 'http://72.167.227.205/uploads/gallery/gallery-1757005147531-560817189.jpg',
    rating: 4.6,
  },
  {
    id: 'drk2',
    name: 'Classic Margarita',
    description: 'Tequila, triple sec, fresh lime juice',
    price: 9,
    category: 'drinks',
    image: 'http://72.167.227.205/uploads/gallery/gallery-1757007192434-466496930.jpg',
    featured: true,
  },
];

// Simple Menu Item Card Component using regular img tag
function MenuItemCard({ item }: { item: MenuItem }) {
  // Validate item data
  if (!item || !item.id || !item.name) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">Invalid menu item data</p>
      </div>
    );
  }

  const price = typeof item.price === 'number' 
    ? `$${item.price.toFixed(2)}` 
    : String(item.price || 'N/A');

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
      {/* Featured Badge */}
      {item.featured && (
        <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          Featured
        </div>
      )}

      {/* Image using regular img tag */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Image failed to load:', item.image);
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

        {/* Dietary Info */}
        {item.dietaryInfo && Array.isArray(item.dietaryInfo) && item.dietaryInfo.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {item.dietaryInfo.map((info, index) => (
              <span
                key={`${item.id}-diet-${index}`}
                className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
              >
                {info}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        {item.rating && typeof item.rating === 'number' && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.rating.toFixed(1)}
            </span>
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

// Main Menu Page Component - Ultra simple, no hooks, no state, no hydration issues
export default function MenuPage() {
  // Filter menu items safely - done at render time, no state
  const featuredItems = MENU_ITEMS.filter(item => item && item.featured === true);
  const appetizers = MENU_ITEMS.filter(item => item && item.category === 'appetizers');
  const entrees = MENU_ITEMS.filter(item => item && item.category === 'entrees');
  const drinks = MENU_ITEMS.filter(item => item && item.category === 'drinks');

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
      <MenuSection 
        title="Chef's Recommendations" 
        items={featuredItems}
        description="Our most popular and highly rated dishes"
      />

      {/* Appetizers */}
      <MenuSection 
        title="Appetizers" 
        items={appetizers}
      />

      {/* Entrees */}
      <MenuSection 
        title="Entrées" 
        items={entrees}
      />

      {/* Drinks */}
      <MenuSection 
        title="Drinks" 
        items={drinks}
      />
    </div>
  );
}