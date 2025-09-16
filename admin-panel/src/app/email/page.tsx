'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Mail, 
  Send, 
  BarChart3, 
  Plus,
  FileText,
  Settings
} from 'lucide-react';

export default function EmailMarketingPage() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalCampaigns: 0,
    totalTemplates: 0,
    openRate: 0
  });

  useEffect(() => {
    // Fetch stats from API
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [contactsRes, campaignsRes, templatesRes] = await Promise.all([
        fetch('/api/email/contacts?limit=1'),
        fetch('/api/email/campaigns'),
        fetch('/api/email-templates')
      ]);

      const contactsData = await contactsRes.json();
      const campaignsData = await campaignsRes.json();
      const templatesData = await templatesRes.json();

      setStats({
        totalContacts: contactsData.pagination?.total || 0,
        totalCampaigns: campaignsData.length || 0,
        totalTemplates: templatesData.length || 0,
        openRate: 0 // TODO: Calculate from events
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const menuItems = [
    {
      title: 'Contacts',
      description: 'Manage your email subscribers and contacts',
      icon: Users,
      href: '/email/contacts',
      color: 'bg-blue-500',
      stats: stats.totalContacts
    },
    {
      title: 'Templates',
      description: 'Create and manage email templates',
      icon: FileText,
      href: '/email-templates',
      color: 'bg-green-500',
      stats: stats.totalTemplates
    },
    {
      title: 'Campaigns',
      description: 'Create and send email campaigns',
      icon: Send,
      href: '/email/campaigns',
      color: 'bg-purple-500',
      stats: stats.totalCampaigns
    },
    {
      title: 'Analytics',
      description: 'View email performance and analytics',
      icon: BarChart3,
      href: '/email/analytics',
      color: 'bg-orange-500',
      stats: `${stats.openRate}%`
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Marketing</h1>
        <p className="text-gray-600">Manage your email marketing campaigns and subscribers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Templates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Send className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/email/contacts"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Link>
          <Link
            href="/email-templates"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Link>
          <Link
            href="/email/campaigns"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Main Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 ${item.color} rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.stats}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <p className="text-gray-500 text-center">No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
}






