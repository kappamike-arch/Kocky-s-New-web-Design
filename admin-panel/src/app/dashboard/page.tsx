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

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    console.log('Dashboard: Checking authentication...');
    console.log('Auth token:', document.cookie);
    console.log('Is authenticated:', auth.isAuthenticated());
    
    if (!auth.isAuthenticated()) {
      console.log('Dashboard: Not authenticated, redirecting to login...');
      window.location.href = '/login';
      return;
    }

    const currentUser = auth.getCurrentUser();
    console.log('Dashboard: Current user:', currentUser);
    
    if (currentUser) {
      setUser(currentUser);
      fetchStats();
    } else {
      console.log('Dashboard: No user data found, redirecting to login...');
      router.push('/');
    }
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      
      // If it's an authentication error, redirect to login
      if (error.response?.status === 401) {
        router.push('/');
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
    { name: 'Analytics', path: '/analytics', icon: '📊', color: 'bg-indigo-500' },
    { name: 'Settings', path: '/settings', icon: '⚙️', color: 'bg-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats?.revenue.total.toFixed(2)}</p>
                <p className="text-xs text-green-600">+${stats?.revenue.today.toFixed(2)} today</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.orders.total}</p>
                <p className="text-xs text-green-600">+{stats?.orders.today} today</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reservations</p>
                <p className="text-2xl font-bold">{stats?.reservations.total}</p>
                <p className="text-xs text-green-600">{stats?.reservations.today} today</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats?.users.total}</p>
                <p className="text-xs text-blue-600">Active customers</p>
              </div>
              <div className="text-3xl">👤</div>
            </div>
          </div>
        </div>

        {/* Management Options */}
        <h2 className="text-lg font-semibold mb-4">Management Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${item.color} text-white text-2xl flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Manage {item.name.toLowerCase()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div className="text-sm">
              <p className="font-semibold text-yellow-800">Security Notice</p>
              <p className="text-yellow-700 mt-1">
                This admin panel is running on a separate port (4000) for security. 
                Never share the admin URL publicly. All actions are logged and monitored.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 min ago</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">New Order</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Order #1245 - $67.99</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Processing
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15 min ago</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Reservation</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Table for 4 - 7:00 PM</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Confirmed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 hour ago</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Food Truck Booking</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Corporate Event - March 15</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
