'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, MapPin, Phone, Star, ChefHat, Truck, Users, Calendar, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { useQuery } from '@tanstack/react-query'; // Disabled - not using queries
// import { cms } from '@/lib/api/cms'; // Disabled - GraphQL not available
import { analytics } from '@/lib/api/analytics';
import { getHeroSettingsAsync, clearHeroSettingsCache, getHeroSettingsWithDefaults } from '@/lib/hero-settings';
import { pageContentAPI } from '@/lib/api/page-content';
import { decodeHtmlEntities } from '@/lib/utils/htmlDecode';
import { HeroSection } from '@/components/sections/HeroSection';

export default function HomePage() {
  const [heroBackground, setHeroBackground] = useState<string>('');
  const [heroVideo, setHeroVideo] = useState<string | undefined>(undefined);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.5);
  const [videoError, setVideoError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fallbackTried, setFallbackTried] = useState(false);
  
  // API base (with /api) and media origin (Apache proxy)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://staging.kockys.com/api';
  const MEDIA_ORIGIN = process.env.NEXT_PUBLIC_MEDIA_URL || 'https://staging.kockys.com';
  
  // Hero settings state - use consistent initial state to avoid hydration mismatch
  const [heroData, setHeroData] = useState({
    title: "Welcome to Kockys Bar & Grill",
    subtitle: 'Amazing Food & Drinks',
    description: 'Come experience the best dining in town',
    useLogo: true,
    logoUrl: '/kockys-logo.png' // Use default logo initially
  });
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [heroSettings, setHeroSettings] = useState<any>(null);
  const [heroLoading, setHeroLoading] = useState(true);
  
  // CMS queries completely disabled - using static content instead
  const pageData = null;
  const featuredItems = null;
  const theme = null;

  // Load hero settings from API after mount to avoid hydration issues
  useEffect(() => {
    const loadSettings = async (bypassCache: boolean = false) => {
      try {
        setHeroLoading(true);
        
        if (bypassCache) {
          clearHeroSettingsCache();
        }
        
        // Load hero settings
        const settings = await getHeroSettingsAsync('home');
        
        // Load page content for video
        const pageContent = await pageContentAPI.getBySlug('home');
        
        if (settings || pageContent) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Loaded home hero settings from API:', settings);
            console.log('Loaded home page content:', pageContent);
          }
          
          // Set hero data from settings
          if (settings) {
            setHeroSettings(settings);
            setHeroData({
              title: settings.title,
              subtitle: settings.subtitle,
              description: settings.description,
              useLogo: settings.useLogo !== false,
              logoUrl: settings.logoUrl || '/kockys-logo.png'
            });
            
            // Set video from hero settings
            if (settings.backgroundVideo) {
              // Check if it's an uploaded file or static file
              if (settings.backgroundVideo.startsWith('/uploads/')) {
                setHeroVideo(`${MEDIA_ORIGIN.replace('/uploads', '')}${settings.backgroundVideo}`);
              } else {
                // Static file in public directory
                setHeroVideo(settings.backgroundVideo);
              }
              setVideoError(false);
            } else {
              // Use default video if no video is configured
              setHeroVideo('/videos/home-hero.mp4');
              setVideoError(false);
            }
              
              // Set background image from hero settings
              if (settings.backgroundImage) {
                // Check if it's an uploaded file or static file
                if (settings.backgroundImage.startsWith('/uploads/')) {
                  const backgroundUrl = `${MEDIA_ORIGIN.replace('/uploads', '')}${settings.backgroundImage}`;
                  console.log('Setting hero background:', backgroundUrl);
                  setHeroBackground(backgroundUrl);
                } else {
                  // Static file in public directory
                  console.log('Setting hero background (static):', settings.backgroundImage);
                  setHeroBackground(settings.backgroundImage);
                }
              }
          }
          
          // Set video/image from page content (fallback)
          if (pageContent && !settings?.backgroundVideo) {
            if (pageContent.heroVideo) {
              setHeroVideo(`${MEDIA_ORIGIN.replace('/uploads', '')}${pageContent.heroVideo}`);
              setVideoError(false);
            }
            if (pageContent.heroImage && !settings?.backgroundImage) {
              setHeroBackground(`${MEDIA_ORIGIN.replace('/uploads', '')}${pageContent.heroImage}`);
            }
          }
          
          setHeroLoaded(true);
        } else {
          // If no settings are loaded, use default video
          setHeroVideo('/videos/home-hero.mp4');
          setVideoError(false);
          setHeroLoaded(true);
        }
      } catch (error) {
        console.error('Error loading hero settings:', error);
        setHeroLoaded(true);
      } finally {
        setHeroLoading(false);
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

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }
    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Set hero background from CMS if available
    if (pageData) {
      if (pageData.backgroundType === 'IMAGE' && pageData.backgroundImage?.url) {
        setHeroBackground(pageData.backgroundImage.url);
      } else if (pageData.backgroundType === 'VIDEO' && pageData.backgroundVideo?.url) {
        setHeroVideo(pageData.backgroundVideo.url);
        setVideoError(false);
      } else if (pageData.backgroundType === 'COLOR') {
        setHeroBackground(pageData.backgroundColor || '#FF6B35');
      }
    }
  }, [pageData]);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video/Image Background */}
      {!heroLoading && heroSettings?.backgroundVideo ? (
        // Video background
        <HeroSection
          title={heroData.title}
          subtitle={heroData.subtitle}
          description={heroData.description}
          backgroundVideo={heroSettings.backgroundVideo}
          mediaPreference="video"
          overlayOpacity={overlayOpacity}
          height="full"
          showLogo={heroData.useLogo}
          logoUrl={heroData.logoUrl}
          ctaButtons={[
            {
              text: "View Our Menu",
              href: "/menu",
              variant: "default"
            },
            {
              text: "Make a Reservation",
              href: "/reservations",
              variant: "outline"
            }
          ]}
        />
      ) : !heroLoading && heroSettings?.backgroundImage ? (
        // Image background
        <HeroSection
          title={heroData.title}
          subtitle={heroData.subtitle}
          description={heroData.description}
          backgroundImage={heroSettings.backgroundImage}
          mediaPreference="image"
          overlayOpacity={overlayOpacity}
          height="full"
          showLogo={heroData.useLogo}
          logoUrl={heroData.logoUrl}
          ctaButtons={[
            {
              text: "View Our Menu",
              href: "/menu",
              variant: "default"
            },
            {
              text: "Make a Reservation",
              href: "/reservations",
              variant: "outline"
            }
          ]}
        />
      ) : (
        // Fallback: gradient background (loading or no media)
        <HeroSection
          title={heroData.title}
          subtitle={heroData.subtitle}
          description={heroData.description}
          backgroundImage={undefined}
          backgroundVideo={undefined}
          mediaPreference="auto"
          overlayOpacity={overlayOpacity}
          height="full"
          showLogo={heroData.useLogo}
          logoUrl={heroData.logoUrl}
          ctaButtons={[
            {
              text: "View Our Menu",
              href: "/menu",
              variant: "default"
            },
            {
              text: "Make a Reservation",
              href: "/reservations",
              variant: "outline"
            }
          ]}
        />
      )}


      {/* Featured Menu Items */}
      {featuredItems?.menuItems && featuredItems.menuItems.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-4">Featured Dishes</h2>
              <p className="text-xl text-gray-600">Our chef's special selections</p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {featuredItems.menuItems.map((item: any) => (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  {item.image?.url && (
                    <div className="h-48 relative">
                      <Image 
                        src={item.image.url} 
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-orange-500">${item.price}</span>
                      <Link href="/menu">
                        <button className="text-orange-500 hover:text-orange-600 font-semibold">
                          View Details →
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Everything you need for any occasion</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <ChefHat className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dine In</h3>
              <p className="text-gray-600">Experience our warm atmosphere and exceptional service</p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Food Truck</h3>
              <p className="text-gray-600">Bringing our famous flavors to your event</p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Catering</h3>
              <p className="text-gray-600">Perfect for parties, weddings, and corporate events</p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Events</h3>
              <p className="text-gray-600">Live music, trivia nights, and special occasions</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/services">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-colors"
              >
                Explore All Services
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Experience Kocky's?</h2>
          <p className="text-xl mb-8">Join us for an unforgettable dining experience</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-white/20 backdrop-blur px-6 py-3 rounded-full"
            >
              <Clock className="w-5 h-5" />
              <span>Open Daily 11AM - 11PM</span>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-white/20 backdrop-blur px-6 py-3 rounded-full"
            >
              <MapPin className="w-5 h-5" />
              <span>123 Main Street, Downtown</span>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-white/20 backdrop-blur px-6 py-3 rounded-full"
            >
              <Phone className="w-5 h-5" />
              <span>(555) 123-4567</span>
            </motion.div>
          </div>

          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/contact">
              <button className="px-8 py-4 bg-white text-orange-500 font-bold rounded-full hover:shadow-xl transition-shadow">
                Get Directions
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}