'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { auth } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { ensureArray, apiJson, ListResp, extractArray } from '@/lib/api';
import { LoadingPage, SkeletonList } from '@/components/Skeleton';
import { EmptyCampaigns } from '@/components/EmptyState';

interface Campaign {
  id: string;
  name: string;
  status: string;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
}

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchCampaigns();
  }, [router]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const resp = await apiJson<ListResp<Campaign>>('/email/campaigns');
      const campaigns = extractArray<Campaign>(resp);
      setCampaigns(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      if ((error as Error).message === "UNAUTHORIZED") {
        router.push("/login");
        return;
      }
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading campaigns..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
              <p className="mt-2 text-gray-600">Create and manage your email marketing campaigns</p>
            </div>
            <Link
              href="/email"
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back to Email Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/email/campaigns/new"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">+</span>
              Create Campaign
            </Link>
            <Link
              href="/email-templates"
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span className="mr-2">📧</span>
              Manage Templates
            </Link>
            <Link
              href="/email"
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span className="mr-2">📊</span>
              View Analytics
            </Link>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Campaigns</h3>
            <p className="text-sm text-gray-500">Your email marketing campaigns</p>
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
      </div>
    </div>
  );
}

