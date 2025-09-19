'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from 'react-hot-toast';

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export default function NewEmailTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const [template, setTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    category: 'general',
    subject: '',
    body: '',
    variables: []
  });

  const handleSave = async () => {
    if (!template.name || !template.subject || !template.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/email-templates', template);
      toast.success('Template created successfully');
      router.push('/email-templates');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!template.body) {
      toast.error('Please enter template body first');
      return;
    }

    try {
      // Simple preview - replace variables with sample data
      let previewBody = template.body || '';
      const sampleData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        serviceName: 'Mobile Bar Service',
        eventDate: '2024-01-15',
        eventLocation: '123 Main Street, City',
        guestCount: '100',
        confirmationCode: 'ABC123',
        quoteNumber: 'Q-2024-0001',
        totalAmount: '$2,500',
        validUntil: '2024-02-15',
        paymentLink: 'https://payment.kockys.com/pay/ABC123',
      };

      // Replace variables in the template
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        previewBody = previewBody.replace(regex, String(value));
      });

      setPreviewHtml(previewBody);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/email-templates"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Email Template</h1>
          <p className="text-gray-600">Create a new automated email template</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Template Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={template.name || ''}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Booking Confirmation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={template.category || 'general'}
                  onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="inquiry">Inquiry</option>
                  <option value="quote">Quote</option>
                  <option value="mobileBar">Mobile Bar</option>
                  <option value="booking">Booking</option>
                  <option value="catering">Catering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={template.subject || ''}
                  onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Your booking confirmation for {{serviceName}}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body *
                </label>
                <textarea
                  value={template.body || ''}
                  onChange={(e) => setTemplate({ ...template, body: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email template here. Use {{variableName}} for dynamic content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Variables
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p className="mb-2">You can use these variables in your template:</p>
                  <ul className="space-y-1">
                    <li><code className="bg-white px-1 rounded">{'{{customerName}}'}</code> - Customer's name</li>
                    <li><code className="bg-white px-1 rounded">{'{{customerEmail}}'}</code> - Customer's email</li>
                    <li><code className="bg-white px-1 rounded">{'{{serviceName}}'}</code> - Service name</li>
                    <li><code className="bg-white px-1 rounded">{'{{eventDate}}'}</code> - Event date</li>
                    <li><code className="bg-white px-1 rounded">{'{{eventLocation}}'}</code> - Event location</li>
                    <li><code className="bg-white px-1 rounded">{'{{guestCount}}'}</code> - Number of guests</li>
                    <li><code className="bg-white px-1 rounded">{'{{confirmationCode}}'}</code> - Confirmation code</li>
                    <li><code className="bg-white px-1 rounded">{'{{quoteNumber}}'}</code> - Quote number</li>
                    <li><code className="bg-white px-1 rounded">{'{{totalAmount}}'}</code> - Total amount</li>
                    <li><code className="bg-white px-1 rounded">{'{{validUntil}}'}</code> - Quote validity</li>
                    <li><code className="bg-white px-1 rounded">{'{{paymentLink}}'}</code> - Payment link</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Preview</h2>
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>

            {showPreview && previewHtml ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">Subject: {template.subject}</div>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml.replace(/\n/g, '<br>') }}
                />
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center text-gray-500">
                Click "Preview" to see how your template will look
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 mt-6">
        <Link
          href="/email-templates"
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Creating...' : 'Create Template'}
        </button>
      </div>
    </div>
  );
}
