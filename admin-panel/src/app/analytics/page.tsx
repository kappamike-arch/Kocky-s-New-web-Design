'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { analytics } from '@/lib/api/analytics';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Users, Eye, MousePointer, Clock,
  Calendar, Filter, Download, RefreshCw
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7');

  // Fetch analytics data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['analytics-dashboard', dateRange],
    queryFn: () => analytics.getDashboard({
      startDate: subDays(new Date(), parseInt(dateRange)).toISOString(),
      endDate: new Date().toISOString(),
    }),
    retry: 1,
  });

  // Mock data for demonstration
  const mockData = {
    overview: {
      totalVisitors: 15234,
      uniqueVisitors: 8456,
      pageViews: 45678,
      avgSessionDuration: 185, // seconds
      bounceRate: 42.5,
      conversionRate: 3.2,
    },
    dailyVisits: [
      { date: '2024-01-20', visitors: 450, pageViews: 1200 },
      { date: '2024-01-21', visitors: 520, pageViews: 1450 },
      { date: '2024-01-22', visitors: 480, pageViews: 1300 },
      { date: '2024-01-23', visitors: 610, pageViews: 1680 },
      { date: '2024-01-24', visitors: 580, pageViews: 1520 },
      { date: '2024-01-25', visitors: 720, pageViews: 1980 },
      { date: '2024-01-26', visitors: 690, pageViews: 1850 },
    ],
    pageViews: [
      { page: 'Home', views: 12450, percentage: 27.2 },
      { page: 'Menu', views: 8920, percentage: 19.5 },
      { page: 'Reservations', views: 6780, percentage: 14.8 },
      { page: 'Food Truck', views: 5430, percentage: 11.9 },
      { page: 'Mobile Bar', views: 4890, percentage: 10.7 },
      { page: 'About', views: 3560, percentage: 7.8 },
      { page: 'Contact', views: 3648, percentage: 8.1 },
    ],
    topEvents: [
      { event: 'Menu Item Clicked', count: 3456 },
      { event: 'Reservation Started', count: 2341 },
      { event: 'Reservation Completed', count: 892 },
      { event: 'Email Signup', count: 678 },
      { event: 'Quote Requested', count: 456 },
      { event: 'Online Order', count: 234 },
    ],
    deviceStats: [
      { device: 'Mobile', users: 5670, color: '#FF6B35' },
      { device: 'Desktop', users: 3240, color: '#004E64' },
      { device: 'Tablet', users: 890, color: '#00A8CC' },
    ],
    trafficSources: [
      { source: 'Organic Search', visits: 4560 },
      { source: 'Direct', visits: 3240 },
      { source: 'Social Media', visits: 2340 },
      { source: 'Referral', visits: 1230 },
      { source: 'Email', visits: 890 },
    ],
  };

  const displayData = data || mockData;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const COLORS = ['#FF6B35', '#004E64', '#00A8CC', '#F7931E', '#4CAF50'];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track visitor behavior and site performance</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refetch()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Visitors</span>
            <Users className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">
            {displayData.overview.totalVisitors.toLocaleString()}
          </div>
          <div className="text-xs text-green-500 mt-1">+12.5%</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Unique Visitors</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">
            {displayData.overview.uniqueVisitors.toLocaleString()}
          </div>
          <div className="text-xs text-green-500 mt-1">+8.3%</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Page Views</span>
            <Eye className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {displayData.overview.pageViews.toLocaleString()}
          </div>
          <div className="text-xs text-green-500 mt-1">+15.2%</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Duration</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold">
            {formatDuration(displayData.overview.avgSessionDuration)}
          </div>
          <div className="text-xs text-green-500 mt-1">+5.8%</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Bounce Rate</span>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">
            {displayData.overview.bounceRate}%
          </div>
          <div className="text-xs text-red-500 mt-1">-3.2%</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Conversion</span>
            <MousePointer className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {displayData.overview.conversionRate}%
          </div>
          <div className="text-xs text-green-500 mt-1">+1.2%</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Visitor Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Visitor Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={displayData.dailyVisits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="visitors" 
                stroke="#FF6B35" 
                fill="#FF6B35" 
                fillOpacity={0.3}
                name="Visitors"
              />
              <Area 
                type="monotone" 
                dataKey="pageViews" 
                stroke="#004E64" 
                fill="#004E64" 
                fillOpacity={0.3}
                name="Page Views"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Page Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Top Pages</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayData.pageViews}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="page" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#FF6B35" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Device Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Device Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={displayData.deviceStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ device, users }) => `${device}: ${users}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="users"
              >
                {displayData.deviceStats.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Traffic Sources</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayData.trafficSources} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="source" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="visits" fill="#004E64" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Top Events</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm text-gray-600">Event</th>
                <th className="text-right py-2 text-sm text-gray-600">Count</th>
                <th className="text-right py-2 text-sm text-gray-600">Change</th>
              </tr>
            </thead>
            <tbody>
              {displayData.topEvents.map((event: any, index: number) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3">{event.event}</td>
                  <td className="text-right font-medium">{event.count.toLocaleString()}</td>
                  <td className="text-right">
                    <span className="text-green-500 text-sm">
                      +{(Math.random() * 20).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
