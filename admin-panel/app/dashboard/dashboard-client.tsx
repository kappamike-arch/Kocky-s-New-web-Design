'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { auth } from '@/lib/api/auth';

interface Stats {
  revenue: { total: number; today: number };
  orders: { total: number; today: number };
  reservations: { total: number; today: number };
  users: { total: number };
}

export default function DashboardClient() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check authentication - ensure we're on client side and mounted
    if (!mounted) return;
    
    // Small delay to ensure cookies are set
    setTimeout(() => {
      console.log('Dashboard: Checking authentication...');
      const isAuth = auth.isAuthenticated();
      console.log('Is authenticated:', isAuth);
      
      if (!isAuth) {
        console.log('Dashboard: Not authenticated, redirecting to login...');
        router.push('/login');
        return;
      }

      const currentUser = auth.getCurrentUser();
      console.log('Dashboard: Current user:', currentUser);
      
      if (currentUser) {
        setUser(currentUser);
        fetchStats();
      } else {
        console.log('Dashboard: No user data found, redirecting to login...');
        router.push('/login');
      }
    }, 100);
  }, [mounted, router]);

  const fetchStats = async () => {
    try {
      console.log('Fetching dashboard stats...');
      const response = await api.get('/admin/dashboard');
      console.log('Stats response:', response.data);
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      
      // If it's an authentication error, redirect to login
      if (error.response?.status === 401 || error.statusCode === 401) {
        console.log('Auth error in fetchStats, redirecting to login...');
        router.push('/login');
        return;
      }
      
      // Use mock data if API fails
      setStats({
        revenue: { total: 45678.90, today: 2345.67 },
        orders: { total: 892, today: 34 },
        reservations: { total: 234, today: 12 },
        users: { total: 3456 },
      });
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading secure dashboard...</div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Calendar', path: '/calendar', icon: '📆', color: 'bg-teal-500' },
    { name: 'CRM', path: '/crm', icon: '💼', color: 'bg-red-500' },
    { name: 'Reservations', path: '/reservations', icon: '📅', color: 'bg-blue-500' },
    { name: 'Orders', path: '/orders', icon: '🛒', color: 'bg-green-500' },
    { name: 'Menu Management', path: '/menu', icon: '🍔', color: 'bg-yellow-500' },
    { name: 'Users', path: '/users', icon: '👥', color: 'bg-purple-500' },
    { name: 'Food Truck', path: '/food-truck', icon: '🚚', color: 'bg-orange-500' },
    { name: 'Mobile Bar', path: '/mobile-bar', icon: '🍹', color: 'bg-pink-500' },
    { name: 'Gallery', path: '/gallery', icon: '📸', color: 'bg-indigo-500' },
    { name: 'Content', path: '/content', icon: '📝', color: 'bg-gray-500' },
    { name: 'Settings', path: '/settings', icon: '⚙️', color: 'bg-gray-600' },
    { name: 'Analytics', path: '/analytics', icon: '📊', color: 'bg-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name || 'Admin'}!
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening at Kocky's today</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.revenue.today.toFixed(2)}
                  </p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Today's Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.orders.today}</p>
                </div>
                <div className="text-3xl">🛒</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Today's Reservations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.reservations.today}</p>
                </div>
                <div className="text-3xl">📅</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 text-center group"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${item.color} text-white text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="font-medium text-gray-900">{item.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


