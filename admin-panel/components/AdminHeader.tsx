'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Calendar, ShoppingBag, Menu as MenuIcon, Users, 
  Truck, Wine, BarChart, Settings, LogOut, ChevronLeft, Image, Type, Briefcase, CalendarDays,
  FileText, Package, ImageIcon
} from 'lucide-react';
import { auth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

export default function AdminHeader() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const userData = JSON.parse(atob(token));
        setUser(userData);
      } catch {
        router.push('/');
      }
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local data and redirect
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Content', path: '/content', icon: Type },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'CRM', path: '/crm', icon: Briefcase },
    { name: 'Quotes', path: '/quotes', icon: FileText },
    { name: 'Quote Config', path: '/quote-config', icon: Package },
    { name: 'Reservations', path: '/reservations', icon: Calendar },
    { name: 'Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Menu', path: '/menu', icon: MenuIcon },
    { name: 'Gallery', path: '/gallery', icon: ImageIcon },
    { name: 'Hero Settings', path: '/hero-settings', icon: Type },
    { name: 'Service Settings', path: '/service-settings', icon: Settings },
    { name: 'Media', path: '/media', icon: Image },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Food Truck', path: '/food-truck', icon: Truck },
    { name: 'Mobile Bar', path: '/mobile-bar', icon: Wine },
    { name: 'Analytics', path: '/analytics', icon: BarChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Don't show header on login page
  if (pathname === '/') return null;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {pathname !== '/dashboard' && (
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}
            <h1 className="text-xl font-bold">Kocky's Admin</h1>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              SECURE
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 inline-block mr-1" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.role}: {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-t px-4 py-2 flex overflow-x-auto space-x-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                pathname === item.path
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              <Icon className="w-3 h-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

