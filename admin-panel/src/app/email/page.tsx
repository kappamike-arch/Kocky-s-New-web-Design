'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { auth } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { listTemplates } from '@/lib/email-templates-api';
import { ensureArray, apiJson, ListResp, extractArray } from '@/lib/api';
import { LoadingPage, SkeletonStats, SkeletonList } from '@/components/Skeleton';
import { EmptyTemplates, EmptyCampaigns, EmptyContacts, EmptyEmailDashboard } from '@/components/EmptyState';

interface EmailStats {
  contacts: number;
  templates: number;
  campaigns: number;
  openRate: number;
}

interface Contact {
  id: string;
  email: string;
  name?: string;
  subscribed: boolean;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  isActive: boolean;
}

export default function EmailDashboard() {
  const [stats, setStats] = useState<EmailStats>({
    contacts: 0,
    templates: 0,
    campaigns: 0,
    openRate: 0
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchEmailData();
  }, [router]);

  const fetchEmailData = async () => {
    try {
      // Fetch all email data in parallel
      const [contactsRes, campaignsRes, templatesRes, analyticsRes] = await Promise.allSettled([
        apiJson<ListResp<Contact>>('/email/contacts?limit=5'),
        apiJson<ListResp<Campaign>>('/email/campaigns'),
        listTemplates(),
        api.get('/email/analytics')
      ]);

      // Process contacts
      if (contactsRes.status === 'fulfilled') {
        const contacts = extractArray<Contact>(contactsRes.value);
        setContacts(contacts);
      } else {
        setContacts([]);
      }

      // Process campaigns
      if (campaignsRes.status === 'fulfilled') {
        const campaigns = extractArray<Campaign>(campaignsRes.value);
        setCampaigns(campaigns);
      } else {
        setCampaigns([]);
      }

      // Process templates
      if (templatesRes.status === 'fulfilled') {
        const templates = ensureArray<Template>(templatesRes.value.templates);
        setTemplates(templates);
      } else {
        setTemplates([]);
      }

      // Process analytics for stats
      if (analyticsRes.status === 'fulfilled') {
        const analytics = analyticsRes.value.data.data;
        setStats({
          contacts: analytics?.subscribers?.total || 0,
          templates: templatesRes.status === 'fulfilled' ? (templatesRes.value.templates || []).length : 0,
          campaigns: analytics?.campaigns?.total || 0,
          openRate: analytics?.emails?.successRate ? parseFloat(analytics.emails.successRate) : 0
        });
      }

    } catch (error) {
      console.error('Error fetching email data:', error);
      if ((error as Error).message === "UNAUTHORIZED") {
        router.push("/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading email dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
          <p className="mt-2 text-gray-600">Manage your email marketing campaigns and subscribers</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{stats.contacts}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Templates</p>
                <p className="text-2xl font-bold">{stats.templates}</p>
              </div>
              <div className="text-3xl">📧</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campaigns</p>
                <p className="text-2xl font-bold">{stats.campaigns}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold">{stats.openRate}%</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Link
              href="/email/contacts"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">👥</span>
              Manage Contacts
            </Link>
            <Link
              href="/email-studio"
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span className="mr-2">🎨</span>
              Visual Studio
            </Link>
            <Link
              href="/email-templates/editor"
              className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <span className="mr-2">⚙️</span>
              Template Editor
            </Link>
            <Link
              href="/email-templates/new"
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span className="mr-2">+</span>
              Create Template
            </Link>
            <Link
              href="/email/campaigns/new"
              className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <span className="mr-2">+</span>
              New Campaign
            </Link>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contacts */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Contacts</h3>
              <p className="text-sm text-gray-500">Manage your email subscribers and contacts</p>
            </div>
            <div className="p-6">
              {contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{contact.name || contact.email}</p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        contact.subscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {contact.subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyContacts />
              )}
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Templates</h3>
              <p className="text-sm text-gray-500">Create and manage email templates</p>
            </div>
            <div className="p-6">
              {templates.length > 0 ? (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-gray-500">{template.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Link 
                          href={`/admin/email-templates/${template.id}/edit`}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          ✏️ Edit
                        </Link>
                        <button 
                          onClick={() => window.open(`/admin/email-templates/${template.id}/preview`, '_blank')}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                        >
                          👁️ Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyTemplates />
              )}
            </div>
          </div>

          {/* Campaigns */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Campaigns</h3>
              <p className="text-sm text-gray-500">Create and send email campaigns</p>
            </div>
            <div className="p-6">
              {campaigns.length > 0 ? (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{campaign.name}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>Sent: {campaign.sent}</div>
                        <div>Opened: {campaign.opened}</div>
                        <div>Clicked: {campaign.clicked}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyCampaigns />
              )}
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Analytics</h3>
              <p className="text-sm text-gray-500">View email performance and analytics</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Subscribers</span>
                  <span className="font-medium">{stats.contacts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Templates</span>
                  <span className="font-medium">{stats.templates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Campaigns</span>
                  <span className="font-medium">{stats.campaigns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium">{stats.openRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Recent Activity</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-4">No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
}
