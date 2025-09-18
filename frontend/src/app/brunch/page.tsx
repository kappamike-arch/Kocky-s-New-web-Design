'use client';

import { useState, useEffect } from 'react';
import { EditableHeroSection } from '@/components/sections/HeroSection';
import { MenuSection, MenuItem } from '@/components/menu/MenuCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Clock, ExternalLink, Coffee, Egg } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHeroSettingsWithDefaults, getHeroSettingsAsync, clearHeroSettingsCache } from '@/lib/hero-settings';

// Mock brunch menu items - in production, fetch from backend
const mockBrunchItems: MenuItem[] = [
  // Breakfast Items
  {
    id: 'br1',
    name: 'Classic Benedict',
    description: 'Poached eggs, Canadian bacon, hollandaise on English muffin',
    price: 14.99,
    category: 'breakfast',
    featured: true,
    rating: 4.8,
    dietaryInfo: [],
  },
  {
    id: 'br2',
    name: 'Avocado Toast',
    description: 'Smashed avocado, poached eggs, cherry tomatoes, feta',
    price: 12.99,
    category: 'breakfast',
    dietaryInfo: ['Vegetarian'],
    rating: 4.6,
  },
  {
    id: 'br3',
    name: 'Belgian Waffles',
    description: 'Fresh berries, whipped cream, maple syrup',
    price: 11.99,
    category: 'breakfast',
    dietaryInfo: ['Vegetarian'],
  },
  {
    id: 'br4',
    name: 'Steak & Eggs',
    description: '8oz sirloin, two eggs any style, hash browns',
    price: 22.99,
    category: 'breakfast',
    featured: true,
    rating: 4.9,
  },
  // Lunch Items
  {
    id: 'lu1',
    name: 'Brunch Burger',
    description: 'Beef patty, fried egg, bacon, cheese, special sauce',
    price: 16.99,
    category: 'lunch',
    rating: 4.7,
  },
  {
    id: 'lu2',
    name: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons, grilled chicken option',
    price: 13.99,
    category: 'lunch',
    dietaryInfo: ['Gluten-Free Option'],
  },
  // Drinks
  {
    id: 'dr1',
    name: 'Bottomless Mimosas',
    description: '90 minutes of unlimited mimosas',
    price: 25,
    category: 'drinks',
    featured: true,
  },
  {
    id: 'dr2',
    name: 'Bloody Mary',
    description: 'House-made mix with premium vodka',
    price: 10,
    category: 'drinks',
  },
  {
    id: 'dr3',
    name: 'Fresh Coffee',
    description: 'Locally roasted, unlimited refills',
    price: 4,
    category: 'drinks',
  },
];

// External reservation link
const RESERVATION_URL = 'https://www.opentable.com/r/kockys-bar-and-grill';

export default function BrunchPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [brunchItems, setBrunchItems] = useState(mockBrunchItems);
  const [overlayOpacity, setOverlayOpacity] = useState(0.35);
  const [isLoading, setIsLoading] = useState(true);
  const [heroData, setHeroData] = useState({
    title: '',
    subtitle: 'BUTTA BRUNCH', // Use your actual subtitle
    description: '1st Session 11am-1pm 2nd Session 2pm-4pm Session', // Use your actual description
    backgroundImage: '',
    backgroundVideo: '',
    useLogo: true, // Start with logo enabled
    logoUrl: '/uploads/logos/logo-brunch-1756543247360-105278658.png' // Use the brunch logo
  });
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Load settings from API after mount to avoid hydration issues
  useEffect(() => {
    const loadSettings = async (bypassCache: boolean = false) => {
      if (bypassCache) {
        clearHeroSettingsCache(); // Clear cache to force fresh fetch
      }
      const settings = await getHeroSettingsAsync('brunch', bypassCache);
      if (settings) {
        console.log('[BRUNCH] Loaded hero settings from API:', settings);
        console.log('[BRUNCH] Logo URL from API:', settings.logoUrl);
        console.log('[BRUNCH] Use Logo from API:', settings.useLogo);
        
        // Apply the settings from API - use the actual values from database
        setHeroData({
          title: settings.useLogo ? '' : settings.title,
          subtitle: settings.subtitle, // Use the actual subtitle from database (BUTTA BRUNCH)
          description: settings.description, // Use the actual description from database
          backgroundImage: settings.backgroundImage || '',
          backgroundVideo: settings.backgroundVideo || '',
          useLogo: settings.useLogo !== false, // Default to true
          logoUrl: settings.logoUrl || '/uploads/logos/logo-brunch-1756543247360-105278658.png' // Use the brunch logo with fallback
        });
        setIsLoading(false);
        setHeroLoaded(true);
      }
    };

    // Delay initial load slightly to avoid hydration mismatch
    const timer = setTimeout(() => {
      loadSettings(true);
    }, 100);

    // Reload when window gains focus (bypass cache)
    const handleFocus = () => {
      loadSettings(true);
    };

    // Reload periodically to catch changes
    const interval = setInterval(() => loadSettings(false), 5000); // Check every 5 seconds

    window.addEventListener('focus', handleFocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const breakfastItems = brunchItems.filter(item => item.category === 'breakfast');
  const lunchItems = brunchItems.filter(item => item.category === 'lunch');
  const drinkItems = brunchItems.filter(item => item.category === 'drinks');

  const handleEditItem = (item: MenuItem) => {
    toast.success('Edit functionality coming soon!');
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setBrunchItems(items => items.filter(item => item.id !== id));
      toast.success('Item deleted');
    }
  };

  const handleAddItem = (category: string) => {
    toast.success('Add functionality coming soon!');
  };

  const handleHeroSave = async (data: any) => {
    setHeroData(prev => ({ ...prev, ...data }));
    toast.success('Hero section updated!');
  };

  const handleHeroImageUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setHeroData(prev => ({ ...prev, backgroundImage: url, backgroundVideo: undefined }));
    toast.success('Image uploaded!');
  };

  const handleHeroVideoUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setHeroData(prev => ({ ...prev, backgroundVideo: url, backgroundImage: undefined }));
    toast.success('Video uploaded!');
  };

  const handleReservation = () => {
    window.open(RESERVATION_URL, '_blank', 'noopener,noreferrer');
    toast.success('Opening reservation system...');
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
        overlayOpacity={overlayOpacity}
        height="large"
        showLogo={heroData.useLogo || !heroData.title}
        logoUrl={heroData.logoUrl}
        ctaButtons={[
          { text: 'Make Reservation', href: '#reservation' },
          { text: 'View Menu', href: '#menu', variant: 'outline' },
        ]}
        isAdmin={isAdmin}
        onOpacityChange={setOverlayOpacity}
        onSave={handleHeroSave}
        onUploadImage={handleHeroImageUpload}
        onUploadVideo={handleHeroVideoUpload}
      />

      {/* Brunch Info Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Weekend Brunch Experience</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Every Saturday & Sunday from 10am to 3pm
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center"
            >
              <Coffee className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Bottomless Drinks</h3>
              <p className="text-gray-600 dark:text-gray-400">
                90 minutes of unlimited mimosas, bloody marys, and coffee
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center"
            >
              <Egg className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Fresh Ingredients</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Farm-fresh eggs, local produce, and house-made specialties
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center"
            >
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Weekend Special</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Extended hours and special menu items every weekend
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Large Reservation Button */}
      <section id="reservation" className="py-16 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Reserve Your Table Now
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Book your brunch experience through our reservation partner
            </p>
            <Button
              size="xl"
              onClick={handleReservation}
              className="bg-white text-primary hover:bg-gray-100 text-lg px-12 py-6 h-auto"
            >
              <Calendar className="mr-3 h-6 w-6" />
              Make Reservation on OpenTable
              <ExternalLink className="ml-3 h-5 w-5" />
            </Button>
            <p className="text-sm text-white/70 mt-4">
              You will be redirected to OpenTable to complete your reservation
            </p>
          </motion.div>
        </div>
      </section>

      {/* Menu Sections */}
      <div id="menu" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Breakfast Items */}
          <MenuSection
            title="Breakfast Favorites"
            description="Classic breakfast dishes with a twist"
            items={breakfastItems}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onAdd={() => handleAddItem('breakfast')}
            isAdmin={isAdmin}
            columns={3}
          />

          {/* Lunch Items */}
          <MenuSection
            title="Lunch Options"
            description="Light lunch fare perfect for brunch"
            items={lunchItems}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onAdd={() => handleAddItem('lunch')}
            isAdmin={isAdmin}
            columns={3}
          />

          {/* Drinks */}
          <MenuSection
            title="Brunch Beverages"
            description="Bottomless drinks and specialty cocktails"
            items={drinkItems}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onAdd={() => handleAddItem('drinks')}
            isAdmin={isAdmin}
            columns={3}
          />
        </div>
      </div>

      {/* Special Events */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-12 text-white"
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Sunday Jazz Brunch</h2>
              <p className="text-2xl mb-2">Every Sunday 11am - 2pm</p>
              <p className="text-xl mb-8 text-white/90">
                Enjoy live jazz music while you brunch!
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <h3 className="font-bold mb-2">Live Entertainment</h3>
                  <p className="text-sm text-white/90">
                    Local jazz musicians perform every Sunday
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <h3 className="font-bold mb-2">Special Menu</h3>
                  <p className="text-sm text-white/90">
                    Exclusive items only available during jazz brunch
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="mt-8 bg-white text-orange-600 hover:bg-gray-100"
                onClick={handleReservation}
              >
                Reserve for Jazz Brunch
              </Button>
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
}
