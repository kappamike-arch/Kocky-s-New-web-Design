'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Tag, Sparkles } from 'lucide-react';
import { EditableHeroSection } from '@/components/sections/HeroSection';
import { MenuCard, MenuItem } from '@/components/menu/MenuCard';
import { getHeroSettingsAsync, clearHeroSettingsCache } from '@/lib/hero-settings';
import { pageContentAPI } from '@/lib/api/page-content';

// Load Happy Hour items from API with timeout
const loadHappyHourItems = async (): Promise<MenuItem[]> => {
  try {
    console.log('[HAPPY-HOUR] Starting API call...');
    console.log('[HAPPY-HOUR] Making fetch request to: http://72.167.227.205:5001/api/enhanced-menu/frontend?menuType=HAPPY_HOUR');
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    console.log('[HAPPY-HOUR] About to make fetch request...');
    const response = await fetch('http://72.167.227.205:5001/api/enhanced-menu/frontend?menuType=HAPPY_HOUR', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    console.log('[HAPPY-HOUR] Fetch request completed, response received');
    
    clearTimeout(timeoutId);
    console.log('[HAPPY-HOUR] Response status:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('[HAPPY-HOUR] API response received');
      
      if (result.success && result.data && result.data.sections) {
        console.log('[HAPPY-HOUR] Loaded sections from API:', result.data.sections.length);
        // Transform API data to MenuItem format
        const allItems: MenuItem[] = [];
        
        result.data.sections.forEach((section: any) => {
          console.log('[HAPPY-HOUR] Processing section:', section.name, 'with', section.items?.length || 0, 'items');
          if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item: any) => {
              try {
                allItems.push({
                  id: item.id || Math.random().toString(),
                  name: item.name || 'Unnamed Item',
                  description: item.description || '',
                  price: parseFloat(item.happyHourPrice || item.price) || 0,
                  originalPrice: parseFloat(item.price) || 0,
                  category: (item.category || 'appetizer').toLowerCase(),
                  image: item.image ? `http://72.167.227.205${item.image}` : null,
                  featured: Boolean(item.featured),
                  rating: 4.5, // Default rating
                  servingSize: item.servingSize || '',
                  tags: Array.isArray(item.tags) ? item.tags : (item.tags ? (() => {
                    try { return JSON.parse(item.tags); } catch { return []; }
                  })() : []),
                  allergens: Array.isArray(item.allergens) ? item.allergens : (item.allergens ? (() => {
                    try { return JSON.parse(item.allergens); } catch { return []; }
                  })() : []),
                });
              } catch (itemError) {
                console.error('[HAPPY-HOUR] Error processing item:', item, itemError);
              }
            });
          }
        });
        
        console.log('[HAPPY-HOUR] Transformed items:', allItems.length, 'total items');
        return allItems;
      } else {
        console.error('[HAPPY-HOUR] Invalid API response structure:', result);
      }
    } else {
      console.error('[HAPPY-HOUR] API request failed with status:', response.status);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[HAPPY-HOUR] API call timed out after 10 seconds');
    } else {
      console.error('[HAPPY-HOUR] Failed to load items from API:', error);
    }
  }
  
  // Fallback to empty array if API fails
  console.log('[HAPPY-HOUR] Returning empty array as fallback');
  return [];
};

export default function HappyHourPage() {
  const [happyHourItems, setHappyHourItems] = useState<MenuItem[]>([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [heroData, setHeroData] = useState({
    id: 'happy-hour',
    pageName: 'Happy Hour',
    pageSlug: '/happy-hour',
    title: 'Happy Hour Specials',
    subtitle: 'Daily 3PM - 6PM',
    description: 'Join us for amazing drink specials and appetizer deals every weekday!',
    backgroundImage: '',
    backgroundVideo: undefined as string | undefined,
    mediaPreference: 'auto',
    useLogo: true,
    logoUrl: '/kockys-logo.png'
  });
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Load Happy Hour items from API
  useEffect(() => {
    const loadItems = async () => {
      try {
        console.log('[HAPPY-HOUR] useEffect triggered, loading items...');
        const items = await loadHappyHourItems();
        console.log('[HAPPY-HOUR] Items loaded:', items.length);
        setHappyHourItems(items);
        setItemsLoaded(true);
      } catch (error) {
        console.error('[HAPPY-HOUR] Error in useEffect:', error);
        setItemsLoaded(true); // Set loaded to true even on error to show fallback UI
      }
    };
    
    loadItems();
  }, []);

  // Load settings from API on mount and when page gains focus
  useEffect(() => {
    const loadSettings = async (bypassCache: boolean = false) => {
      try {
        if (bypassCache) {
          clearHeroSettingsCache(); // Clear cache to force fresh fetch
        }
        
        // Load hero settings
        const settings = await getHeroSettingsAsync('happy-hour', bypassCache);
        
        // Load page content for video
        let pageContent = null;
        try {
          pageContent = await pageContentAPI.getBySlug('happy-hour');
        } catch (error) {
          console.warn('Failed to load page content for happy-hour:', error);
        }
        
        if (settings || pageContent) {
          // Use the fresh API settings directly, with fallbacks for missing fields
          setHeroData({
            id: 'happy-hour',
            pageName: settings?.pageName || 'Happy Hour',
            pageSlug: settings?.pageSlug || '/happy-hour',
            title: settings?.title || 'Happy Hour Specials',
            subtitle: settings?.subtitle || 'Daily 3PM - 6PM',
            description: settings?.description || 'Join us for amazing drink specials and appetizer deals every weekday!',
            backgroundImage: settings?.backgroundImage || '',
            backgroundVideo: settings?.backgroundVideo || pageContent?.videoUrl || '',
            mediaPreference: settings?.mediaPreference || 'auto',
            useLogo: settings?.useLogo !== undefined ? settings.useLogo : true,
            logoUrl: settings?.logoUrl || '/kockys-logo.png'
          });
        }
        setHeroLoaded(true);
      } catch (error) {
        console.error('[HAPPY-HOUR] Error loading hero settings:', error);
        setHeroLoaded(true); // Set loaded to true even on error
      }
    };

    loadSettings();
  }, []);

  // Group items by section with defensive programming
  const appetizerItems = (() => {
    try {
      if (!Array.isArray(happyHourItems)) {
        console.warn('[HAPPY-HOUR] happyHourItems is not an array:', happyHourItems);
        return [];
      }
      return happyHourItems.filter(item => {
        try {
          return item && item.category === 'appetizer';
        } catch (error) {
          console.error('[HAPPY-HOUR] Error filtering appetizer items:', error);
          return false;
        }
      });
    } catch (error) {
      console.error('[HAPPY-HOUR] Error creating appetizer items array:', error);
      return [];
    }
  })();

  const drinkItems = (() => {
    try {
      if (!Array.isArray(happyHourItems)) {
        console.warn('[HAPPY-HOUR] happyHourItems is not an array:', happyHourItems);
        return [];
      }
      return happyHourItems.filter(item => {
        try {
          return item && (item.category === 'cocktail' || item.category === 'beer' || item.category === 'wine');
        } catch (error) {
          console.error('[HAPPY-HOUR] Error filtering drink items:', error);
          return false;
        }
      });
    } catch (error) {
      console.error('[HAPPY-HOUR] Error creating drink items array:', error);
      return [];
    }
  })();

  console.log('[HAPPY-HOUR] Render - itemsLoaded:', itemsLoaded, 'totalItems:', Array.isArray(happyHourItems) ? happyHourItems.length : 0, 'appetizers:', appetizerItems.length, 'drinks:', drinkItems.length);
  
  // Additional debugging for length access
  try {
    console.log('[HAPPY-HOUR] Debug - happyHourItems type:', typeof happyHourItems, 'isArray:', Array.isArray(happyHourItems));
    console.log('[HAPPY-HOUR] Debug - appetizerItems type:', typeof appetizerItems, 'isArray:', Array.isArray(appetizerItems));
    console.log('[HAPPY-HOUR] Debug - drinkItems type:', typeof drinkItems, 'isArray:', Array.isArray(drinkItems));
  } catch (debugError) {
    console.error('[HAPPY-HOUR] Debug error:', debugError);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* Hero Section */}
      <EditableHeroSection
        {...heroData}
        isAdmin={false}
        onUpdate={() => {}}
        overlayOpacity={0.35}
      />

      {/* Happy Hour Schedule */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-4">Happy Hour Schedule</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">The best deals in town, every weekday!</p>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Daily Hours</h3>
              <p className="text-2xl font-bold text-primary mb-1">3:00 PM - 6:00 PM</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monday through Friday</p>
            </motion.div>
            
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tag className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Drink Specials</h3>
              <p className="text-2xl font-bold text-primary mb-1">Up to 50% Off</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Selected cocktails, beer & wine</p>
            </motion.div>
            
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Food Deals</h3>
              <p className="text-2xl font-bold text-primary mb-1">$5 - $8 Appetizers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Perfect for sharing</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Sections */}
      <div className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Drink Specials */}
          <section className="py-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Drink Specials</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Premium drinks at unbeatable prices</p>
              </div>
            </div>
            
            {!itemsLoaded ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-gray-500 dark:text-gray-400">Loading items...</p>
              </div>
            ) : (Array.isArray(drinkItems) && drinkItems.length > 0) ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drinkItems.map((item) => {
                  try {
                    return <MenuCard key={item?.id || Math.random()} item={item} />;
                  } catch (error) {
                    console.error('[HAPPY-HOUR] Error rendering drink item:', item, error);
                    return null;
                  }
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-500 dark:text-gray-400">No items in this section yet</p>
              </div>
            )}
          </section>

          {/* Appetizer Specials */}
          <section className="py-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Appetizer Specials</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Delicious bites to complement your drinks</p>
              </div>
            </div>
            
            {!itemsLoaded ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-gray-500 dark:text-gray-400">Loading items...</p>
              </div>
            ) : (Array.isArray(appetizerItems) && appetizerItems.length > 0) ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appetizerItems.map((item) => {
                  try {
                    return <MenuCard key={item?.id || Math.random()} item={item} />;
                  } catch (error) {
                    console.error('[HAPPY-HOUR] Error rendering appetizer item:', item, error);
                    return null;
                  }
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-500 dark:text-gray-400">No items in this section yet</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Extended Happy Hour */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-4xl font-bold mb-4">Extended Happy Hour</h2>
            <p className="text-2xl mb-2">Every Friday: 3PM - 7PM</p>
            <p className="text-xl mb-8 text-gray-100">Start your weekend right with an extra hour of happy prices!</p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h3 className="font-bold mb-2">Live Music Fridays</h3>
                <p className="text-sm">Local bands perform from 5PM onwards</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h3 className="font-bold mb-2">Trivia Thursdays</h3>
                <p className="text-sm">Win prizes while enjoying happy hour deals</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}