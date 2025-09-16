'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Send,
  Calendar,
  BarChart3,
  Eye,
  Copy,
  X
} from 'lucide-react';
import { api } from '@/lib/api/client';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  fromName?: string;
  fromEmail: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELLED';
  segmentTags: string[];
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  template?: {
    id: string;
    name: string;
  };
  _count?: {
    events: number;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/email/campaigns');
      const data = response.data;
      // Ensure we always have an array
      const campaigns = Array.isArray(data) ? data : [];
      setCampaigns(campaigns);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const response = await fetch(`/api/email/campaigns/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const handleSendNow = async (id: string) => {
    if (!confirm('Are you sure you want to send this campaign now?')) return;

    try {
      const response = await fetch(`/api/email/campaigns/${id}/send-now`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Campaign sent! ${result.sent} emails sent out of ${result.total} recipients.`);
        fetchCampaigns();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to send campaign:', error);
      alert('Failed to send campaign');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return;

    try {
      const response = await fetch(`/api/email/campaigns/${id}/cancel`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to cancel campaign:', error);
    }
  };

  const handleSchedule = async (id: string, scheduledAt: string) => {
    try {
      const response = await fetch(`/api/email/campaigns/${id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt })
      });

      if (response.ok) {
        setShowScheduleModal(false);
        setSelectedCampaign(null);
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to schedule campaign:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'SENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SENT': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit className="h-4 w-4" />;
      case 'SCHEDULED': return <Calendar className="h-4 w-4" />;
      case 'SENDING': return <Send className="h-4 w-4" />;
      case 'SENT': return <BarChart3 className="h-4 w-4" />;
      case 'CANCELLED': return <X className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Campaigns</h1>
            <p className="text-gray-600">Create and manage your email campaigns</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading campaigns...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No campaigns found
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {campaign.subject}
                        </div>
                        <div className="text-xs text-gray-400">
                          From: {campaign.fromName || campaign.fromEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.template?.name || 'No template'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1">{campaign.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.scheduledAt ? (
                        <div>
                          <div>{new Date(campaign.scheduledAt).toLocaleDateString()}</div>
                          <div className="text-xs">{new Date(campaign.scheduledAt).toLocaleTimeString()}</div>
                        </div>
                      ) : campaign.sentAt ? (
                        <div>
                          <div>Sent: {new Date(campaign.sentAt).toLocaleDateString()}</div>
                          <div className="text-xs">{new Date(campaign.sentAt).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        'Not scheduled'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        {campaign._count?.events || 0} events
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {campaign.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handleSendNow(campaign.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Send Now"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setShowScheduleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Schedule"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {campaign.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleCancel(campaign.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Campaign Modal */}
      {showAddModal && (
        <AddCampaignModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCampaigns();
          }}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedCampaign && (
        <ScheduleModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedCampaign(null);
          }}
          onSchedule={(scheduledAt) => handleSchedule(selectedCampaign.id, scheduledAt)}
        />
      )}
    </div>
  );
}

// Add Campaign Modal Component
function AddCampaignModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    fromName: '',
    fromEmail: process.env.NEXT_PUBLIC_EMAIL_FROM || 'no-reply@kockys.com',
    templateId: '',
    segmentTags: '',
    html: ''
  });
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/email-templates');
      const data = await response.json();
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          segmentTags: formData.segmentTags ? formData.segmentTags.split(',').map(t => t.trim()) : []
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  value={formData.fromName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="Kocky's Bar & Grill"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.fromEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template
              </label>
              <select
                value={formData.templateId}
                onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No template (use custom HTML)</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segment Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.segmentTags}
                onChange={(e) => setFormData(prev => ({ ...prev, segmentTags: e.target.value }))}
                placeholder="newsletter, vip, customer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to send to all consenting contacts
              </p>
            </div>

            {!formData.templateId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom HTML
                </label>
                <textarea
                  rows={10}
                  value={formData.html}
                  onChange={(e) => setFormData(prev => ({ ...prev, html: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter your HTML content..."
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Schedule Modal Component
function ScheduleModal({ 
  campaign, 
  onClose, 
  onSchedule 
}: { 
  campaign: Campaign; 
  onClose: () => void; 
  onSchedule: (scheduledAt: string) => void;
}) {
  const [scheduledAt, setScheduledAt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduledAt) {
      onSchedule(scheduledAt);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Schedule Campaign</h2>
        <p className="text-gray-600 mb-4">
          Schedule "{campaign.name}" to be sent at a specific time.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}






