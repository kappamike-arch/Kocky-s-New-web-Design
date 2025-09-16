'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Edit, Eye, Save, Plus, Trash2, 
  Image, DollarSign, Code, FileText, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { api } from '@/lib/api/client';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: any[];
  logoUrl?: string;
  footerText?: string;
  paymentLink?: string;
  isActive: boolean;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    fetchTemplates();
    initializeDefaultTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      console.log('🔍 fetchTemplates: Starting API call...');
      const response = await api.get('/email-templates');
      console.log('🔍 fetchTemplates: API response:', response.data);
      
      // Backend returns { success: true, templates: [...] }
      const templates = response.data?.templates || [];
      console.log('🔍 fetchTemplates: Templates extracted:', templates);
      setTemplates(templates);
    } catch (error) {
      console.error('🔍 fetchTemplates: Error occurred:', error);
      console.error('🔍 fetchTemplates: Error response:', error.response?.data);
      
      // Show mock templates for testing Edit buttons
      const mockTemplates: EmailTemplate[] = [
        {
          id: 'mock-inquiry',
          name: 'Inquiry Confirmation',
          subject: 'Thanks for your inquiry — we got it!',
          htmlContent: '<h1>Thank you for your inquiry!</h1>',
          variables: ['customerName', 'serviceName'],
          isActive: true
        },
        {
          id: 'mock-quote',
          name: 'Quote Request Confirmation',
          subject: 'Your quote from Kocky\'s (##{{quoteNumber}})',
          htmlContent: '<h1>Your quote is ready!</h1>',
          variables: ['customerName', 'quoteNumber', 'totalAmount'],
          isActive: true
        },
        {
          id: 'mock-mobile-bar',
          name: 'Mobile Bar Booking Confirmation',
          subject: 'Mobile Bar booking received',
          htmlContent: '<h1>Your Mobile Bar booking is confirmed!</h1>',
          variables: ['customerName', 'eventDate', 'eventTime', 'eventLocation'],
          isActive: true
        }
      ];
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultTemplates = async () => {
    try {
      console.log('🔍 initializeDefaultTemplates: Starting...');
      const response = await api.post('/email-templates/initialize');
      console.log('🔍 initializeDefaultTemplates: Response:', response.data);
      if (response.data && response.data.templates && response.data.templates.length > 0) {
        toast.success(`Initialized ${response.data.templates.length} default templates`);
        fetchTemplates();
      }
    } catch (error) {
      console.error('🔍 initializeDefaultTemplates: Error occurred:', error);
      console.error('🔍 initializeDefaultTemplates: Error response:', error.response?.data);
      toast.error('Failed to initialize templates');
    }
  };

  const previewTemplate = async (template: EmailTemplate) => {
    try {
      const response = await api.post(`/email-templates/${template.id}/preview`, {
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
          paymentLink: 'https://payment.kockys.com/pay/ABC123',
          logoUrl: template.logoUrl || '/api/uploads/logos/kockys-logo.png',
          footerText: template.footerText || 'Kocky\'s Bar & Grill | 123 Main St | (555) 123-4567',
        },
      });

      setPreviewHtml(response.data.preview.html);
      setShowPreview(true);
      setSelectedTemplate(template);
    } catch (error) {
      console.error('Error previewing template:', error);
      toast.error('Failed to preview template');
    }
  };

  const saveTemplate = async (template: EmailTemplate) => {
    try {
      await api.put(`/email-templates/${template.id}`, template);
      toast.success('Template saved successfully');
      fetchTemplates();
      setShowEditor(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await api.delete(`/email-templates/${id}`);
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const getTemplateIcon = (name: string) => {
    if (name.includes('confirmation')) return <Mail className="w-5 h-5" />;
    if (name.includes('quote')) return <FileText className="w-5 h-5" />;
    if (name.includes('payment')) return <DollarSign className="w-5 h-5" />;
    return <Mail className="w-5 h-5" />;
  };

  const getTemplateStudioName = (template: EmailTemplate) => {
    // Map database template names to Email Template Studio names
    const name = template.name.toLowerCase();
    if (name.includes('inquiry') || name.includes('confirmation')) return 'inquiry';
    if (name.includes('quote')) return 'quote';
    if (name.includes('mobile') || name.includes('bar')) return 'mobileBar';
    return 'inquiry'; // default fallback
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <p className="text-gray-600">Manage and customize automated email templates</p>
        </div>
        <Link
          href="/email-templates/new"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Template
        </Link>
      </div>

      {/* Office 365 Configuration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Mail className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900">Office 365 Email Configuration</h3>
            <p className="text-blue-700 text-sm mt-1">
              Emails are sent through your Microsoft Office 365 account (via GoDaddy).
            </p>
            <p className="text-blue-600 text-sm mt-2">
              <strong>Current Settings:</strong> SMTP Host: smtp.office365.com | Port: 587 | From: info@kockys.com
            </p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No email templates found</p>
            <button
              onClick={initializeDefaultTemplates}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Initialize Default Templates
            </button>
          </div>
        ) : (
          templates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTemplateIcon(template.name)}
                  <div>
                    <h3 className="font-semibold capitalize">
                      {template.name.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {template.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                {template.isActive && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.subject}
              </p>

              {/* Features */}
              <div className="flex gap-2 mb-4">
                {template.logoUrl && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                    <Image className="w-3 h-3" /> Logo
                  </span>
                )}
                {template.paymentLink && (
                  <span className="text-xs bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Payment
                  </span>
                )}
                {template.textContent && (
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Text
                  </span>
                )}
              </div>

              {/* Variables */}
              {template.variables && template.variables.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {(template.variables as string[]).slice(0, 3).map((variable) => (
                      <span
                        key={variable}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                      >
                        {`{{${variable}}}`}
                      </span>
                    ))}
                    {template.variables.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{template.variables.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => previewTemplate(template)}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <Link
                  href={`/email-studio/${getTemplateStudioName(template)}`}
                  className="flex-1 px-3 py-2 bg-primary text-white rounded hover:bg-primary-dark flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Template Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {selectedTemplate && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    <strong>Subject:</strong> {selectedTemplate.subject}
                  </p>
                </div>
              )}
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
