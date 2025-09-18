"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api/auth';
import { apiJson } from '@/lib/api';
import { LoadingPage } from '@/components/Skeleton';

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  html: string;
  text?: string;
  variables: any;
  isActive: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateSettings {
  // Header Settings
  headerTitle: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  headerPadding: string;
  logoUrl: string;
  
  // Footer Settings
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  copyrightYear: string;
  socialMediaLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  footerBackgroundColor: string;
  footerTextColor: string;
  
  // General Settings
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export default function TemplateEditor() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [settings, setSettings] = useState<TemplateSettings>({
    // Header Settings
    headerTitle: "Your Request Received!",
    headerBackgroundColor: "#1a1a1a",
    headerTextColor: "#ffffff",
    headerPadding: "20px",
    logoUrl: "",
    
    // Footer Settings
    businessName: "Kocky's Bar & Grill",
    businessAddress: "123 Main Street, City, State 12345",
    businessPhone: "(555) 123-4567",
    businessEmail: "info@kockys.com",
    copyrightYear: "2024",
    socialMediaLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: ""
    },
    footerBackgroundColor: "#333333",
    footerTextColor: "#ffffff",
    
    // General Settings
    primaryColor: "#d4af37",
    secondaryColor: "#1a1a1a",
    fontFamily: "Arial, sans-serif"
  });
  
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchTemplates();
  }, [router]);

  const fetchTemplates = async () => {
    try {
      const response = await apiJson<{templates: EmailTemplate[]}>('/email-templates');
      setTemplates(response.templates || []);
      if (response.templates && response.templates.length > 0) {
        setSelectedTemplate(response.templates[0]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewHtml = () => {
    if (!selectedTemplate) return "";

    const headerHtml = `
      <div class="header" style="background-color: ${settings.headerBackgroundColor}; color: ${settings.headerTextColor}; padding: ${settings.headerPadding}; text-align: center;">
        ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="${settings.businessName} Logo" class="logo" style="max-width: 200px; margin-bottom: 10px;">` : ''}
        <h1 style="margin: 0; font-size: 24px;">${settings.headerTitle}</h1>
      </div>
    `;

    const footerHtml = `
      <div class="footer" style="background-color: ${settings.footerBackgroundColor}; color: ${settings.footerTextColor}; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 5px 0;"><strong>${settings.businessName}</strong></p>
        <p style="margin: 5px 0;">${settings.businessAddress}</p>
        <p style="margin: 5px 0;">Phone: ${settings.businessPhone} | Email: ${settings.businessEmail}</p>
        ${Object.entries(settings.socialMediaLinks).some(([_, url]) => url) ? `
          <div style="margin: 10px 0;">
            ${settings.socialMediaLinks.facebook ? `<a href="${settings.socialMediaLinks.facebook}" style="color: ${settings.footerTextColor}; margin: 0 5px;">Facebook</a>` : ''}
            ${settings.socialMediaLinks.instagram ? `<a href="${settings.socialMediaLinks.instagram}" style="color: ${settings.footerTextColor}; margin: 0 5px;">Instagram</a>` : ''}
            ${settings.socialMediaLinks.twitter ? `<a href="${settings.socialMediaLinks.twitter}" style="color: ${settings.footerTextColor}; margin: 0 5px;">Twitter</a>` : ''}
            ${settings.socialMediaLinks.linkedin ? `<a href="${settings.socialMediaLinks.linkedin}" style="color: ${settings.footerTextColor}; margin: 0 5px;">LinkedIn</a>` : ''}
          </div>
        ` : ''}
        <p style="margin: 5px 0;">© ${settings.copyrightYear} ${settings.businessName}. All rights reserved.</p>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: ${settings.fontFamily}; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: ${settings.primaryColor}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          ${headerHtml}
          <div class="content">
            <p>Dear {{customerName}},</p>
            <p>Thank you for your inquiry! This is a preview of how your email template will look.</p>
            <p><strong>Confirmation Code:</strong> {{confirmationCode}}</p>
            <p>Best regards,<br>The ${settings.businessName} Team</p>
          </div>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;
  };

  useEffect(() => {
    setPreviewHtml(generatePreviewHtml());
  }, [settings, selectedTemplate]);

  const updateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const updatedHtml = selectedTemplate.html
        .replace(/<div class="header"[^>]*>[\s\S]*?<\/div>/, 
          `<div class="header" style="background-color: ${settings.headerBackgroundColor}; color: ${settings.headerTextColor}; padding: ${settings.headerPadding}; text-align: center;">
            ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="${settings.businessName} Logo" class="logo" style="max-width: 200px; margin-bottom: 10px;">` : ''}
            <h1 style="margin: 0; font-size: 24px;">${settings.headerTitle}</h1>
          </div>`)
        .replace(/<div class="footer"[^>]*>[\s\S]*?<\/div>/, 
          `<div class="footer" style="background-color: ${settings.footerBackgroundColor}; color: ${settings.footerTextColor}; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 5px 0;"><strong>${settings.businessName}</strong></p>
            <p style="margin: 5px 0;">${settings.businessAddress}</p>
            <p style="margin: 5px 0;">Phone: ${settings.businessPhone} | Email: ${settings.businessEmail}</p>
            ${Object.entries(settings.socialMediaLinks).some(([_, url]) => url) ? `
              <div style="margin: 10px 0;">
                ${settings.socialMediaLinks.facebook ? `<a href="${settings.socialMediaLinks.facebook}" style="color: ${settings.footerTextColor}; margin: 0 5px;">Facebook</a>` : ''}
                ${settings.socialMediaLinks.instagram ? `<a href="${settings.socialMediaLinks.instagram}" style="color: ${settings.footerTextColor}; margin: 0 5px;">Instagram</a>` : ''}
                ${settings.socialMediaLinks.twitter ? `<a href="${settings.socialMediaLinks.twitter}" style="color: ${settings.footerTextColor}; margin: 0 5px;">Twitter</a>` : ''}
                ${settings.socialMediaLinks.linkedin ? `<a href="${settings.socialMediaLinks.linkedin}" style="color: ${settings.footerTextColor}; margin: 0 5px;">LinkedIn</a>` : ''}
              </div>
            ` : ''}
            <p style="margin: 5px 0;">© ${settings.copyrightYear} ${settings.businessName}. All rights reserved.</p>
          </div>`);

      await apiJson(`/email-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          html: updatedHtml,
          subject: selectedTemplate.subject
        })
      });

      alert('Template updated successfully!');
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Error updating template');
    }
  };

  const updateAllTemplates = async () => {
    try {
      for (const template of templates) {
        const updatedHtml = template.html
          .replace(/<div class="header"[^>]*>[\s\S]*?<\/div>/, 
            `<div class="header" style="background-color: ${settings.headerBackgroundColor}; color: ${settings.headerTextColor}; padding: ${settings.headerPadding}; text-align: center;">
              ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="${settings.businessName} Logo" class="logo" style="max-width: 200px; margin-bottom: 10px;">` : ''}
              <h1 style="margin: 0; font-size: 24px;">${settings.headerTitle}</h1>
            </div>`)
          .replace(/<div class="footer"[^>]*>[\s\S]*?<\/div>/, 
            `<div class="footer" style="background-color: ${settings.footerBackgroundColor}; color: ${settings.footerTextColor}; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 5px 0;"><strong>${settings.businessName}</strong></p>
              <p style="margin: 5px 0;">${settings.businessAddress}</p>
              <p style="margin: 5px 0;">Phone: ${settings.businessPhone} | Email: ${settings.businessEmail}</p>
              ${Object.entries(settings.socialMediaLinks).some(([_, url]) => url) ? `
                <div style="margin: 10px 0;">
                  ${settings.socialMediaLinks.facebook ? `<a href="${settings.socialMediaLinks.facebook}" style="color: ${settings.footerTextColor}; margin: 0 5px;">Facebook</a>` : ''}
                  ${settings.socialMediaLinks.instagram ? `<a href="${settings.socialMediaLinks.instagram}" style="color: ${settings.footerTextColor}; margin: 0 5px;">Instagram</a>` : ''}
                  ${settings.socialMediaLinks.twitter ? `<a href="${settings.socialMediaLinks.twitter}" style="color: ${settings.footerTextColor}; margin: 0 5px;">Twitter</a>` : ''}
                  ${settings.socialMediaLinks.linkedin ? `<a href="${settings.socialMediaLinks.linkedin}" style="color: ${settings.footerTextColor}; margin: 0 5px;">LinkedIn</a>` : ''}
                </div>
              ` : ''}
              <p style="margin: 5px 0;">© ${settings.copyrightYear} ${settings.businessName}. All rights reserved.</p>
            </div>`);

        await apiJson(`/email-templates/${template.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            html: updatedHtml,
            subject: template.subject
          })
        });
      }

      alert('All templates updated successfully!');
      fetchTemplates();
    } catch (error) {
      console.error('Error updating templates:', error);
      alert('Error updating templates');
    }
  };

  if (loading) {
    return <LoadingPage message="Loading template editor..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Template Editor</h1>
          <p className="mt-2 text-gray-600">Customize headers, footers, and styling for all your email templates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Template Settings</h2>
            
            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template to Preview
              </label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value);
                  setSelectedTemplate(template || null);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Header Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Header Settings</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title Text</label>
                  <input
                    type="text"
                    value={settings.headerTitle}
                    onChange={(e) => setSettings({...settings, headerTitle: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={settings.headerBackgroundColor}
                    onChange={(e) => setSettings({...settings, headerBackgroundColor: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={settings.headerTextColor}
                    onChange={(e) => setSettings({...settings, headerTextColor: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
                  <input
                    type="text"
                    value={settings.headerPadding}
                    onChange={(e) => setSettings({...settings, headerPadding: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="20px"
                  />
                </div>
              </div>
            </div>

            {/* Footer Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Footer Settings</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                  <input
                    type="text"
                    value={settings.businessAddress}
                    onChange={(e) => setSettings({...settings, businessAddress: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={settings.businessPhone}
                    onChange={(e) => setSettings({...settings, businessPhone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) => setSettings({...settings, businessEmail: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Year</label>
                  <input
                    type="text"
                    value={settings.copyrightYear}
                    onChange={(e) => setSettings({...settings, copyrightYear: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer Background</label>
                  <input
                    type="color"
                    value={settings.footerBackgroundColor}
                    onChange={(e) => setSettings({...settings, footerBackgroundColor: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Links</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Facebook</label>
                    <input
                      type="url"
                      value={settings.socialMediaLinks.facebook || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialMediaLinks: {...settings.socialMediaLinks, facebook: e.target.value}
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Instagram</label>
                    <input
                      type="url"
                      value={settings.socialMediaLinks.instagram || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialMediaLinks: {...settings.socialMediaLinks, instagram: e.target.value}
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://instagram.com/yourpage"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Twitter</label>
                    <input
                      type="url"
                      value={settings.socialMediaLinks.twitter || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialMediaLinks: {...settings.socialMediaLinks, twitter: e.target.value}
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://twitter.com/yourpage"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-xs text-gray-500 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={settings.socialMediaLinks.linkedin || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialMediaLinks: {...settings.socialMediaLinks, linkedin: e.target.value}
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={updateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Selected Template
              </button>
              <button
                onClick={updateAllTemplates}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Update All Templates
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-96 border-0"
                title="Email Template Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

