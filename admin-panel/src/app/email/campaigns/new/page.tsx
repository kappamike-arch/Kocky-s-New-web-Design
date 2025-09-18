'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { auth } from '@/lib/api/auth';
import { listTemplates } from '@/lib/email-templates-api';
import { ensureArray, apiJson, ListResp, extractArray } from '@/lib/api';
import { LoadingPage, SkeletonForm } from '@/components/Skeleton';
import { EmptyTemplates } from '@/components/EmptyState';

interface Template {
  id: string;
  name: string;
  subject: string;
  isActive: boolean;
}

interface Contact {
  id: string;
  email: string;
  name?: string;
  subscribed: boolean;
}

export default function CreateCampaign() {
  const [form, setForm] = useState({
    name: '',
    subject: '',
    templateId: '',
    recipientType: 'all', // 'all', 'segment', 'manual'
    recipientEmails: '',
    scheduledDate: '',
    status: 'draft'
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesRes, contactsRes] = await Promise.allSettled([
        listTemplates(),
        apiJson<ListResp<Contact>>('/email/contacts?limit=100')
      ]);

      // Process templates
      if (templatesRes.status === 'fulfilled') {
        const templatesData = ensureArray<Template>(templatesRes.value.templates);
        setTemplates(templatesData);
      } else {
        setTemplates([]);
      }

      // Process contacts
      if (contactsRes.status === 'fulfilled') {
        const contactsData = extractArray<Contact>(contactsRes.value);
        setContacts(contactsData);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if ((error as Error).message === "UNAUTHORIZED") {
        router.push("/login");
        return;
      }
      setTemplates([]);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // For now, just show success message since we don't have a campaigns API
      alert('Campaign created successfully! (This is a demo - no actual campaign was created)');
      router.push('/email/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading campaign form..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Email Campaign</h1>
              <p className="mt-2 text-gray-600">Set up a new email marketing campaign</p>
            </div>
            <Link
              href="/email/campaigns"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Campaigns
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter campaign name"
              />
            </div>

            {/* Subject Line */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line
              </label>
              <input
                type="text"
                id="subject"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email subject"
              />
            </div>

            {/* Template Selection */}
            <div>
              <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <select
                id="templateId"
                required
                value={form.templateId}
                onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.subject}
                  </option>
                ))}
              </select>
                  {templates.length === 0 && (
                    <div className="mt-4">
                      <EmptyTemplates />
                    </div>
                  )}
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all"
                    name="recipientType"
                    value="all"
                    checked={form.recipientType === 'all'}
                    onChange={(e) => setForm({ ...form, recipientType: e.target.value })}
                    className="mr-2"
                  />
                  <label htmlFor="all" className="text-sm text-gray-700">
                    All subscribers ({contacts.filter(c => c.subscribed).length} contacts)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="manual"
                    name="recipientType"
                    value="manual"
                    checked={form.recipientType === 'manual'}
                    onChange={(e) => setForm({ ...form, recipientType: e.target.value })}
                    className="mr-2"
                  />
                  <label htmlFor="manual" className="text-sm text-gray-700">
                    Manual email list
                  </label>
                </div>
                {form.recipientType === 'manual' && (
                  <textarea
                    value={form.recipientEmails}
                    onChange={(e) => setForm({ ...form, recipientEmails: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email addresses separated by commas"
                    rows={3}
                  />
                )}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                Schedule (Optional)
              </label>
              <input
                type="datetime-local"
                id="scheduledDate"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to send immediately
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/email/campaigns"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
