'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings,
  ShoppingCart,
  Calendar,
  Truck,
  Wine,
  PartyPopper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Image from 'next/image';
import themeConfig from '@/lib/theme-config';

const navigation = [
  { name: 'Menu', href: '/menu' },
  { name: 'Happy Hour', href: '/happy-hour' },
  { name: 'Brunch', href: '/brunch' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Events', href: '/events' },
  { name: 'Reservations', href: '/reservations' },
  {
    name: 'Services',
    href: '#',
    children: [
      { name: 'Food Truck', href: '/services/food-truck', icon: Truck },
      { name: 'Mobile Bar', href: '/services/mobile-bar', icon: Wine },
      { name: 'Catering', href: '/services/catering', icon: ShoppingCart },
    ],
  },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Order Online', href: '/order', highlight: true },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const session = null; // Disabled useSession to prevent errors
  const status = 'unauthenticated';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {/* Kocky's Logo with proper responsive sizing */}
              <img 
                src="/kockys-logo.png"
                alt="Kocky's Bar & Grill"
                width="200"
                height="60"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                style={{
                  minHeight: '40px',
                  maxHeight: '56px',
                  imageRendering: 'auto',
                  WebkitFontSmoothing: 'antialiased',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                }}
                onError={(e) => {
                  // Try fallback to text if logo fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (typeof document !== 'undefined') {
                    const textFallback = document.getElementById('header-text-fallback');
                    if (textFallback) textFallback.style.display = 'flex';
                  }
                }}
              />
              {/* Text fallback (hidden by default) */}
              <div id="header-text-fallback" className="hidden items-center">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                  <span className="text-red-600">Kocky's</span>
                  <span className="text-yellow-500 ml-1">Bar & Grill</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {navigation.map((item) =>
              item.children ? (
                <div key={item.name} className="relative">
                  <button
                    className="flex items-center space-x-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                    onClick={() => setServicesOpen(!servicesOpen)}
                  >
                    <span>{item.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
                      >
                        <div className="py-1">
                          {item.children.map((child) => {
                            const Icon = child.icon;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setServicesOpen(false)}
                              >
                                <Icon className="mr-3 h-4 w-4" />
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    item.highlight
                      ? "text-primary hover:text-primary/80"
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          {/* Right side - Theme Toggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="space-y-1 pb-4 pt-2">
                {navigation.map((item) =>
                  item.children ? (
                    <div key={item.name}>
                      <button
                        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-base font-medium text-foreground/70 hover:bg-accent hover:text-foreground"
                        onClick={() => setServicesOpen(!servicesOpen)}
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          servicesOpen && "rotate-180"
                        )} />
                      </button>
                      {servicesOpen && (
                        <div className="ml-4 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="flex items-center rounded-md px-2 py-2 text-sm font-medium text-foreground/60 hover:bg-accent hover:text-foreground"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "block rounded-md px-2 py-2 text-base font-medium",
                        item.highlight
                          ? "text-primary hover:bg-accent hover:text-primary"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}