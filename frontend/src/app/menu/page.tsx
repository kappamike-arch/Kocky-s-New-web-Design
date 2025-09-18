'use client';

import { useState, useEffect } from 'react';
import { EditableHeroSection } from '@/components/sections/HeroSection';
import { MenuSection, MenuItem } from '@/components/menu/MenuCard';
import { MenuItemModal } from '@/components/menu/MenuItemModal';
import { Tabs } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getHeroSettingsWithDefaults, getHeroSettingsAsync, clearHeroSettingsCache } from '@/lib/hero-settings';

// Mock menu data - in production this would come from the backend
const mockMenuItems: MenuItem[] = [
  // Appetizers
  {
    id: 'app1',
    name: 'Loaded Potato Skins',
    description: 'Crispy potato skins topped with bacon, cheese, and sour cream',
    price: 9.99,
    category: 'appetizers',
    image: '/images/potato-skins.jpg',
    featured: true,
    rating: 4.6,
  },
  {
    id: 'app2',
    name: 'Spinach Artichoke Dip',
    description: 'Creamy blend served with tortilla chips',
    price: 8.99,
    category: 'appetizers',
    dietaryInfo: ['Vegetarian'],
    rating: 4.5,
  },
  {
    id: 'app3',
    name: 'Chicken Wings',
    description: 'Choice of Buffalo, BBQ, or Garlic Parmesan',
    price: 12.99,
    category: 'appetizers',
    spicyLevel: 3,
    rating: 4.8,
  },
  // Entrees
  {
    id: 'ent1',
    name: "Kocky's Signature Burger",
    description: 'Double patty with special sauce, lettuce, cheese, pickles on a sesame seed bun',
    price: 14.99,
    category: 'entrees',
    featured: true,
    rating: 4.9,
  },
  {
    id: 'ent2',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce, served with vegetables',
    price: 22.99,
    category: 'entrees',
    dietaryInfo: ['Gluten-Free'],
    rating: 4.7,
  },
  {
    id: 'ent3',
    name: 'BBQ Ribs',
    description: 'Full rack of tender ribs with our house BBQ sauce',
    price: 24.99,
    category: 'entrees',
    featured: true,
    rating: 4.8,
  },
  // Drinks
  {
    id: 'drk1',
    name: 'Craft Beer Flight',
    description: 'Sample four of our rotating craft beers',
    price: 12,
    category: 'drinks',
    rating: 4.6,
  },
  {
    id: 'drk2',
    name: 'Classic Margarita',
    description: 'Tequila, triple sec, fresh lime juice',
    price: 9,
    category: 'drinks',
    featured: true,
  },
  {
    id: 'drk3',
    name: 'House Red Wine',
    description: 'Cabernet Sauvignon or Merlot',
    price: 8,
    category: 'drinks',
  },
  // Desserts
  {
    id: 'des1',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    price: 7.99,
    category: 'desserts',
    featured: true,
    rating: 4.9,
  },
  {
    id: 'des2',
    name: 'New York Cheesecake',
    description: 'Classic cheesecake with berry compote',
    price: 6.99,
    category: 'desserts',
    dietaryInfo: ['Vegetarian'],
    rating: 4.7,
  },
];

export default function MenuPage() {
  const isAdmin = false; // Admin controls removed from frontend
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [addCategory, setAddCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('https://staging.kockys.com/api/menu');
        if (response.data.success && response.data.data) {
          // Merge API data with mock data for now
          const apiItems = response.data.data.map((item: any) => ({
            ...item,
            category: item.category?.toLowerCase() || 'drinks',
            available: item.isAvailable,
            featured: item.isFeatured,
          }));
          setMenuItems([...apiItems, ...mockMenuItems]);
        } else {
          setMenuItems(mockMenuItems);
        }
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
        // Fall back to mock data if API fails
        setMenuItems(mockMenuItems);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, []);
  
  // Load hero settings from API
  useEffect(() => {
    const loadHeroSettings = async (bypassCache: boolean = false) => {
      if (bypassCache) {
        clearHeroSettingsCache(); // Clear cache to force fresh fetch
      }
      const settings = await getHeroSettingsAsync('menu', bypassCache);
      if (settings) {
        if (process.env.NODE_ENV === 'development') console.log('Loaded menu hero settings from API:', settings);
        setHeroData({
          title: settings.useLogo ? '' : settings.title,
          subtitle: settings.subtitle, // Use actual subtitle from database
          description: settings.description, // Use actual description from database
          backgroundImage: settings.backgroundImage || '',
          backgroundVideo: settings.backgroundVideo || '',
          useLogo: settings.useLogo,
          logoUrl: settings.logoUrl || '/kockys-logo.png'
        });
        setHeroLoaded(true);
      }
    };
    
    // Delay initial load slightly to avoid hydration mismatch
    const timer = setTimeout(() => {
      loadHeroSettings(true);
    }, 100);
    
    // Reload when window gains focus (bypass cache)
    const handleFocus = () => {
      loadHeroSettings(true);
    };
    
    // Reload periodically to catch changes
    const interval = setInterval(() => loadHeroSettings(false), 5000); // Check every 5 seconds
    
    window.addEventListener('focus', handleFocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);
  
  const [heroData, setHeroData] = useState({
    title: 'Our Menu',
    subtitle: 'Discover Our Delicious Menu',
    description: 'From appetizers to desserts, we have something for everyone',
    backgroundImage: '',
    backgroundVideo: undefined as string | undefined,
    useLogo: true,
    logoUrl: '/kockys-logo.png'
  });
  const [heroLoaded, setHeroLoaded] = useState(false);

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'appetizers', name: 'Appetizers' },
    { id: 'entrees', name: 'Entrées' },
    { id: 'drinks', name: 'Drinks' },
    { id: 'desserts', name: 'Desserts' },
  ];

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const featuredItems = menuItems.filter(item => item.featured);
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(items => items.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    }
  };

  const handleAddItem = (category?: string) => {
    setEditingItem(null);
    setAddCategory(category || 'food');
    setModalOpen(true);
  };

  const handleSaveItem = async (itemData: Partial<MenuItem>) => {
    if (editingItem) {
      // Update existing item
      setMenuItems(items =>
        items.map(item =>
          item.id === editingItem.id
            ? { ...item, ...itemData }
            : item
        )
      );
    } else {
      // Add new item
      const newItem: MenuItem = {
        ...itemData,
        id: Date.now().toString(),
      } as MenuItem;
      setMenuItems(items => [...items, newItem]);
    }
    setModalOpen(false);
  };

  const handleHeroSave = async (data: any) => {
    setHeroData(prev => ({ ...prev, ...data }));
    toast.success('Hero section updated!');
  };

  const handleHeroImageUpload = async (file: File) => {
    // In production, upload to cloud storage
    const url = URL.createObjectURL(file);
    setHeroData(prev => ({ ...prev, backgroundImage: url, backgroundVideo: undefined }));
    toast.success('Image uploaded!');
  };

  const handleHeroVideoUpload = async (file: File) => {
    // In production, upload to cloud storage
    const url = URL.createObjectURL(file);
    setHeroData(prev => ({ ...prev, backgroundVideo: url, backgroundImage: undefined }));
    toast.success('Video uploaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* Hero Section */}
      <EditableHeroSection
        title={heroData.title}
        subtitle={heroData.subtitle}
        description={heroData.description}
        backgroundImage={heroData.backgroundImage}
        backgroundVideo={heroData.backgroundVideo}
        overlayOpacity={0.5}
        height="medium"
        showLogo={heroData.useLogo || !heroData.title}
        logoUrl={heroData.logoUrl}
        ctaButtons={[
          { text: 'Order Online', href: '/order' },
          { text: 'Make Reservation', href: '/reservations', variant: 'outline' },
        ]}
        isAdmin={isAdmin}
        onSave={handleHeroSave}
        onUploadImage={handleHeroImageUpload}
        onUploadVideo={handleHeroVideoUpload}
      />

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <div className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <MenuSection
              title="Chef's Recommendations"
              description="Our most popular and highly rated dishes"
              items={featuredItems}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onAdd={() => handleAddItem('entrees')}
              isAdmin={isAdmin}
              columns={3}
            />
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="sticky top-16 z-20 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto py-4 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
                {category.id !== 'all' && (
                  <span className="ml-2 text-xs opacity-75">
                    ({menuItems.filter(item => item.category === category.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold mb-2">No items in this category</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isAdmin ? 'Add your first item to get started' : 'Check back soon!'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => handleAddItem(activeCategory)}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add First Item
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MenuItem
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    isAdmin={isAdmin}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
        category={addCategory}
      />

    </div>
  );
}

// Single menu item component (simplified version of MenuCard)
function MenuItem({
  item,
  onEdit,
  onDelete,
  isAdmin,
}: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all">
      {/* Image */}
      {item.image && (
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative">
          {/* In production, use Next Image */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
            {item.category === 'drinks' ? '🍹' : item.category === 'desserts' ? '🍰' : '🍽️'}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <span className="text-xl font-bold text-primary">
            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
          </span>
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {item.featured && (
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                Featured
              </span>
            )}
            {item.dietaryInfo?.map((info) => (
              <span
                key={info}
                className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
              >
                {info}
              </span>
            ))}
          </div>

          {isAdmin && (
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(item)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}