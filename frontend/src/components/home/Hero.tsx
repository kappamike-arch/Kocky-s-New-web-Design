'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, ShoppingBag } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074"
          alt="Restaurant interior"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
              Kocky's
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Experience the best bar & grill in town. Great food, amazing drinks, and unforgettable moments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="xl" variant="gradient" asChild>
              <Link href="/reservations">
                <Calendar className="mr-2 h-5 w-5" />
                Make a Reservation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20" asChild>
              <Link href="/order">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Order Online
              </Link>
            </Button>
          </div>

          {/* Quick Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Happy Hour</h3>
              <p className="text-gray-300 text-sm">Mon-Fri 4PM-7PM</p>
              <p className="text-orange-400 font-semibold mt-2">50% off selected drinks</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Live Music</h3>
              <p className="text-gray-300 text-sm">Every Friday & Saturday</p>
              <p className="text-orange-400 font-semibold mt-2">Starting at 8PM</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Special Events</h3>
              <p className="text-gray-300 text-sm">Food Truck & Mobile Bar</p>
              <p className="text-orange-400 font-semibold mt-2">Book for your event</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
