'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, MapPin, Phone, Star, ChefHat, Truck, Users, Calendar, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/api/cms';
import { analytics } from '@/lib/api/analytics';
import { HeroSection } from '@/components/sections/HeroSection';

export default function HomePage() {
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

  // Fetch featured menu items
  const { data: featuredItems } = useQuery({
    queryKey: ['featured-items'],
    queryFn: () => cms.getFeaturedItems(6),
  });

  // Fetch active theme
  const { data: theme } = useQuery({
    queryKey: ['theme'],
    queryFn: () => cms.getActiveTheme(),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section with API-driven content */}
      <HeroSection 
        pageId="home"
        height="full"
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
