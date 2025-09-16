'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
// import { useBusinessInfo } from '@/contexts/SettingsContext';

const footerLinks = {
  menu: [
    { name: 'Food Menu', href: '/menu' },
    { name: 'Drinks Menu', href: '/menu#drinks' },
    { name: 'Happy Hour', href: '/happy-hour' },
    { name: 'Menu', href: '/menu' },
  ],
  services: [
    { name: 'Reservations', href: '/reservations' },
    { name: 'Food Truck', href: '/services/food-truck' },
    { name: 'Mobile Bar', href: '/services/mobile-bar' },
    { name: 'Catering', href: '/services/catering' },
    { name: 'Private Events', href: '/contact' },
  ],
  company: [
    { name: 'Contact', href: '/contact' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Gallery', href: '/gallery' },
  ],
  legal: [
    { name: 'Contact Us', href: '/contact' },
  ],
};

export function Footer() {
  // Use static data instead of context to avoid build issues
  const siteName = "Kocky's Bar & Grill";
  const email = "info@kockys.com";
  const phone = "(555) 123-4567";
  const fullAddress = "123 Main Street, City, State 12345";
  const socialMedia = {
    facebook: "https://facebook.com/kockys",
    instagram: "https://instagram.com/kockys",
    twitter: "https://twitter.com/kockys",
  };
  const businessHours = {
    monday: 'Mon: 11:00 AM - 10:00 PM',
    tuesday: 'Tue: 11:00 AM - 10:00 PM',
    wednesday: 'Wed: 11:00 AM - 10:00 PM',
    thursday: 'Thu: 11:00 AM - 10:00 PM',
    friday: 'Fri: 11:00 AM - 11:00 PM',
    saturday: 'Sat: 10:00 AM - 2:00 AM',
    sunday: 'Sun: 10:00 AM - 10:00 PM',
  };
  const isLoading = false;

  // State for client-side business hours to avoid hydration mismatch
  const [todayHours, setTodayHours] = useState('Mon-Sun: 11:00 AM - 2:00 AM');

  // Set business hours on client-side only
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hours = businessHours?.[today as keyof typeof businessHours];
    
    if (typeof hours === 'string') {
      setTodayHours(hours);
    } else {
      setTodayHours('Mon-Sun: 11:00 AM - 2:00 AM');
    }
  }, []);

  // Build social links dynamically from settings
  const socialLinks = [];
  if (socialMedia?.facebook) {
    socialLinks.push({ 
      name: 'Facebook', 
      href: socialMedia.facebook, 
      icon: Facebook 
    });
  }
  if (socialMedia?.instagram) {
    socialLinks.push({ 
      name: 'Instagram', 
      href: socialMedia.instagram, 
      icon: Instagram 
    });
  }
  if (socialMedia?.twitter) {
    socialLinks.push({ 
      name: 'Twitter', 
      href: socialMedia.twitter, 
      icon: Twitter 
    });
  }
  if (socialMedia?.youtube) {
    socialLinks.push({ 
      name: 'YouTube', 
      href: socialMedia.youtube, 
      icon: Youtube 
    });
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand and Contact Info */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">
                {siteName}
              </span>
            </Link>
            
            <p className="text-gray-400 text-base">
              The best bar and grill in town. Great food, amazing drinks, and the perfect atmosphere for any occasion.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{fullAddress}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href={`tel:${phone?.replace(/\D/g, '')}`} className="text-sm hover:text-white transition-colors">
                  {phone}
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href={`mailto:${email}`} className="text-sm hover:text-white transition-colors">
                  {email}
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm">
                  Today: {todayHours}
                </span>
              </div>
            </div>
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-6">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            )}
          </div>
          
          {/* Links */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Menu
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.menu.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-base hover:text-white transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Services
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.services.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-base hover:text-white transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-base hover:text-white transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.legal.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-base hover:text-white transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; 2025 {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}