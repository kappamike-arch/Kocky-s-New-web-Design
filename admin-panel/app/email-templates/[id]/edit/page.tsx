'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Save, Eye, ArrowLeft, Code, FileText, 
  Image, DollarSign, Variable, Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  logoUrl?: string;
  footerText?: string;
  paymentLink?: string;
  isActive: boolean;
}

export default function EditEmailTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeTab, setActiveTab] = useState<'html' | 'text' | 'settings'>('html');

  useEffect(() => {
    if (templateId && templateId !== 'new') {
      fetchTemplate();
    } else {
      // New template
      setTemplate({
        id: '',
        name: '',
        subject: '',
        htmlContent: '',
        textContent: '',
        variables: [],
        logoUrl: '/api/uploads/logos/kockys-logo.png',
        footerText: 'Kocky\'s Bar & Grill | 123 Main Street | (555) 123-4567',
        paymentLink: '',
        isActive: true,
      });
      setLoading(false);
    }
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/api/email-templates/${templateId}`);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data.template);
      } else {
        toast.error('Template not found');
        router.push('/email-templates');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;

    setSaving(true);
    try {
      const url = templateId === 'new' 
        ? '${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/api/email-templates'
        : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/api/email-templates/${templateId}`;
      
      const method = templateId === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        toast.success('Template saved successfully');
        router.push('/email-templates');
      } else {
        toast.error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!template) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/api/email-templates/${templateId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleData: {
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            serviceName: 'Mobile Bar Service',
            eventDate: new Date().toLocaleDateString(),
            eventLocation: '123 Main Street, City',
            guestCount: '100',
            confirmationCode: 'ABC123',
            quoteNumber: 'Q-2024-0001',
            totalAmount: '$2,500',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            paymentLink: template.paymentLink || 'https://payment.kockys.com/pay/ABC123',
            logoUrl: template.logoUrl,
            footerText: template.footerText,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewHtml(data.preview.html);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error previewing template:', error);
      
      // Generate preview locally if API fails
      const previewData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        serviceName: 'Mobile Bar Service',
        eventDate: new Date().toLocaleDateString(),
        eventLocation: '123 Main Street, City',
        guestCount: '100',
        confirmationCode: 'ABC123',
        quoteNumber: 'Q-2024-0001',
        totalAmount: '$2,500',
        paymentLink: template.paymentLink || 'https://payment.kockys.com/pay/ABC123',
        logoUrl: template.logoUrl,
        footerText: template.footerText,
      };

      let preview = template.htmlContent;
      Object.entries(previewData).forEach(([key, value]) => {
        preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
      });
      
      setPreviewHtml(preview);
      setShowPreview(true);
    }
  };

  const addVariable = (variable: string) => {
    if (!template) return;
    const cursorPosition = (document.getElementById('htmlContent') as HTMLTextAreaElement)?.selectionStart || 0;
    const newContent = 
      template.htmlContent.slice(0, cursorPosition) + 
      `{{${variable}}}` + 
      template.htmlContent.slice(cursorPosition);
    
    setTemplate({ ...template, htmlContent: newContent });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          Template not found
        </div>
      </div>
    );
  }

  const availableVariables = [
    'customerName', 'customerEmail', 'serviceName', 'eventDate',
    'eventLocation', 'guestCount', 'confirmationCode', 'quoteNumber',
    'totalAmount', 'validUntil', 'paymentLink', 'logoUrl', 'footerText'
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/email-templates"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {templateId === 'new' ? 'Create Email Template' : 'Edit Email Template'}
            </h1>
            <p className="text-gray-600">Customize your automated email template</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Template Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Template Name</label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="e.g., inquiry_confirmation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email Subject</label>
            <input
              type="text"
              value={template.subject}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="e.g., Thank you for contacting {{customerName}}!"
            />
          </div>
        </div>
      </div>

      {/* Template Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Template Content</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1 rounded ${activeTab === 'html' ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              <Code className="w-4 h-4 inline mr-1" /> HTML
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1 rounded ${activeTab === 'text' ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              <FileText className="w-4 h-4 inline mr-1" /> Text
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1 rounded ${activeTab === 'settings' ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              Settings
            </button>
          </div>
        </div>

        {activeTab === 'html' && (
          <div>
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Available Variables (click to insert):</p>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => addVariable(variable)}
                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                  >
                    {`{{${variable}}}`}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="htmlContent"
              value={template.htmlContent}
              onChange={(e) => setTemplate({ ...template, htmlContent: e.target.value })}
              className="w-full h-96 px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary"
              placeholder="Enter HTML content..."
            />
          </div>
        )}

        {activeTab === 'text' && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Plain text version (optional):</p>
            <textarea
              value={template.textContent || ''}
              onChange={(e) => setTemplate({ ...template, textContent: e.target.value })}
              className="w-full h-96 px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary"
              placeholder="Enter plain text content..."
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Image className="w-4 h-4 inline mr-1" /> Logo URL
              </label>
              <input
                type="text"
                value={template.logoUrl || ''}
                onChange={(e) => setTemplate({ ...template, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="/api/uploads/logos/kockys-logo.png"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Footer Text
              </label>
              <input
                type="text"
                value={template.footerText || ''}
                onChange={(e) => setTemplate({ ...template, footerText: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Kocky's Bar & Grill | 123 Main St | (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" /> Payment Link Template
              </label>
              <input
                type="text"
                value={template.paymentLink || ''}
                onChange={(e) => setTemplate({ ...template, paymentLink: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="https://payment.kockys.com/pay/{{quoteNumber}}"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {`{{quoteNumber}}`} or {`{{confirmationCode}}`} as variables in the URL
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={template.isActive}
                  onChange={(e) => setTemplate({ ...template, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Template is Active</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Email Preview</h2>
                <p className="text-sm text-gray-600">
                  Subject: {template.subject.replace(/{{[^}]+}}/g, (match) => {
                    const key = match.slice(2, -2);
                    const sampleData: any = {
                      customerName: 'John Doe',
                      quoteNumber: 'Q-2024-0001',
                    };
                    return sampleData[key] || match;
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[600px]"
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
