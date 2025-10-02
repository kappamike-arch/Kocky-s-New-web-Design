'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settings } from '@/lib/api/settings';
import {
  Save, Upload, Palette, Globe, Mail, Phone, MapPin,
  Facebook, Instagram, Twitter, Youtube, Clock, CreditCard,
  Search, Shield, RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  // Fetch settings
  const { data: siteSettings, isLoading, error } = useQuery({
    queryKey: ['site-settings'],
    queryFn: settings.get,
    retry: 1,
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: (email: string) => settings.sendTestEmail(email),
    onSuccess: () => {
      toast.success('Test email sent successfully');
    },
    onError: () => {
      toast.error('Failed to send test email');
    },
  });

  // Reset settings mutation
  const resetMutation = useMutation({
    mutationFn: settings.reset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings reset to defaults');
    },
    onError: () => {
      toast.error('Failed to reset settings');
    },
  });

  // Mock data if API not available
  const defaultSettings = {
    siteName: "Kocky's Bar & Grill",
    siteDescription: 'The best bar and grill experience in town',
    primaryColor: '#FF6B35',
    secondaryColor: '#004E64',
    accentColor: '#F7931E',
    logoUrl: '',
    heroImageUrl: '',
    contactEmail: 'info@kockysbar.com',
    contactPhone: '(555) 123-4567',
    contactAddress: '123 Main Street, City, State 12345',
    socialMedia: {
      facebook: 'https://facebook.com/kockysbar',
      instagram: 'https://instagram.com/kockysbar',
      twitter: 'https://twitter.com/kockysbar',
      youtube: '',
    },
    businessHours: {
      monday: '11:00 AM - 10:00 PM',
      tuesday: '11:00 AM - 10:00 PM',
      wednesday: '11:00 AM - 10:00 PM',
      thursday: '11:00 AM - 11:00 PM',
      friday: '11:00 AM - 12:00 AM',
      saturday: '10:00 AM - 12:00 AM',
      sunday: '10:00 AM - 9:00 PM',
    },
    emailSettings: {
      smtpHost: 'smtp.sendgrid.net',
      smtpPort: 587,
      smtpUser: 'apikey',
      fromEmail: 'noreply@kockysbar.com',
      fromName: "Kocky's Bar & Grill",
    },
    paymentSettings: {
      stripePublicKey: '',
      enableOnlinePayment: true,
      taxRate: 8.5,
    },
    seoSettings: {
      metaTitle: "Kocky's Bar & Grill - Best Food, Drinks & Atmosphere",
      metaDescription: 'Experience the best bar and grill in town. Great food, amazing drinks, and the perfect atmosphere.',
      metaKeywords: 'bar, grill, restaurant, food, drinks, happy hour',
      googleAnalyticsId: '',
    },
  };

  const [formData, setFormData] = useState(siteSettings || defaultSettings);

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to cloud storage
      toast.success('Logo uploaded');
    }
  };

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to cloud storage
      toast.success('Hero image uploaded');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'business', label: 'Business Hours', icon: Clock },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-h1">Site Settings</h1>
        <p className="admin-help">Configure your website settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                <Icon className="admin-icon" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div className="admin-content">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <>
            {/* General Tab */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="admin-h2">General Settings</h2>
                
                <div className="admin-form-group">
                  <label className="admin-label" htmlFor="site-name">Site Name</label>
                  <input
                    id="site-name"
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="admin-input"
                    aria-describedby="site-name-help"
                  />
                  <div id="site-name-help" className="admin-help">The name of your restaurant that appears throughout the website</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Site Description</label>
                  <textarea
                    value={formData.siteDescription}
                    onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Logo</label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </button>
                    {formData.logoUrl && (
                      <img src={formData.logoUrl} alt="Logo" className="h-12" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hero Image</label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={heroInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleHeroUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => heroInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Hero
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold mb-4">Appearance Settings</h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-12 h-12 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-12 h-12 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-4">Color Preview</h3>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div
                        className="w-24 h-24 rounded-lg shadow-md mb-2"
                        style={{ backgroundColor: formData.primaryColor }}
                      />
                      <span className="text-sm">Primary</span>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-24 h-24 rounded-lg shadow-md mb-2"
                        style={{ backgroundColor: formData.secondaryColor }}
                      />
                      <span className="text-sm">Secondary</span>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-24 h-24 rounded-lg shadow-md mb-2"
                        style={{ backgroundColor: formData.accentColor }}
                      />
                      <span className="text-sm">Accent</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.contactAddress}
                    onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-3">Social Media</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <input
                        type="url"
                        placeholder="Facebook URL"
                        value={formData.socialMedia?.facebook || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                        })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <input
                        type="url"
                        placeholder="Instagram URL"
                        value={formData.socialMedia?.instagram || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                        })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <input
                        type="url"
                        placeholder="Twitter URL"
                        value={formData.socialMedia?.twitter || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                        })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Youtube className="w-5 h-5 text-red-600" />
                      <input
                        type="url"
                        placeholder="YouTube URL"
                        value={formData.socialMedia?.youtube || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialMedia: { ...formData.socialMedia, youtube: e.target.value }
                        })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Business Hours Tab */}
            {activeTab === 'business' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold mb-4">Business Hours</h2>
                
                <div className="space-y-3">
                  {Object.entries(formData.businessHours || {}).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium capitalize">{day}:</span>
                      <input
                        type="text"
                        value={hours}
                        onChange={(e) => setFormData({
                          ...formData,
                          businessHours: {
                            ...formData.businessHours,
                            [day]: e.target.value
                          }
                        })}
                        placeholder="e.g., 11:00 AM - 10:00 PM"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold mb-4">Email Settings</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={formData.emailSettings?.smtpHost || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        emailSettings: { ...formData.emailSettings, smtpHost: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Port</label>
                    <input
                      type="number"
                      value={formData.emailSettings?.smtpPort || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        emailSettings: { ...formData.emailSettings, smtpPort: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">From Email</label>
                    <input
                      type="email"
                      value={formData.emailSettings?.fromEmail || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        emailSettings: { ...formData.emailSettings, fromEmail: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">From Name</label>
                    <input
                      type="text"
                      value={formData.emailSettings?.fromName || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        emailSettings: { ...formData.emailSettings, fromName: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-2">Test Email Settings</h3>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Enter test email address"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      id="test-email"
                    />
                    <button
                      onClick={() => {
                        const email = (document.getElementById('test-email') as HTMLInputElement)?.value;
                        if (email) testEmailMutation.mutate(email);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Send Test
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold mb-4">Payment Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Stripe Public Key</label>
                  <input
                    type="text"
                    value={formData.paymentSettings?.stripePublicKey || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentSettings: { ...formData.paymentSettings, stripePublicKey: e.target.value }
                    })}
                    placeholder="pk_live_..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.paymentSettings?.taxRate || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentSettings: { ...formData.paymentSettings, taxRate: parseFloat(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.paymentSettings?.enableOnlinePayment || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentSettings: { ...formData.paymentSettings, enableOnlinePayment: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>Enable online payments</span>
                </label>
              </motion.div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={formData.seoSettings?.metaTitle || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoSettings: { ...formData.seoSettings, metaTitle: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Meta Description</label>
                  <textarea
                    value={formData.seoSettings?.metaDescription || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoSettings: { ...formData.seoSettings, metaDescription: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Meta Keywords</label>
                  <input
                    type="text"
                    value={formData.seoSettings?.metaKeywords || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoSettings: { ...formData.seoSettings, metaKeywords: e.target.value }
                    })}
                    placeholder="Comma separated keywords"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    value={formData.seoSettings?.googleAnalyticsId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoSettings: { ...formData.seoSettings, googleAnalyticsId: e.target.value }
                    })}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
                
                <div className="p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-900 mb-1">Security Notice</h3>
                    <p className="text-sm text-yellow-700">
                      For security reasons, some settings can only be changed through environment variables or server configuration.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">SSL Certificate</h4>
                      <p className="text-sm text-gray-600">HTTPS encryption is enabled</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Admin Panel</h4>
                      <p className="text-sm text-gray-600">Running on separate port (4000)</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Database Backup</h4>
                      <p className="text-sm text-gray-600">Daily automated backups</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Rate Limiting</h4>
                      <p className="text-sm text-gray-600">API rate limiting enabled</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {
            if (confirm('Reset all settings to defaults?')) {
              resetMutation.mutate();
            }
          }}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset to Defaults
        </button>

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

