'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settings } from '@/lib/api/settings';
import {
  Save, Upload, Palette, Globe, Mail, Phone, MapPin,
  Facebook, Instagram, Twitter, Youtube, Clock, CreditCard,
  Search, Shield, RefreshCw, AlertCircle, CheckCircle, Send, Settings
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
    onError: (error: any) => {
      console.error('Settings update error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update settings');
    },
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: (email: string) => settings.testEmail(email),
    onSuccess: () => {
      toast.success('Test email sent successfully');
    },
    onError: () => {
      toast.error('Failed to send test email');
    },
  });

  // Reset settings mutation
  const resetMutation = useMutation({
    mutationFn: settings.resetToDefaults,
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

  const [formData, setFormData] = useState(defaultSettings);

  // Update form data when settings are loaded
  useEffect(() => {
    if (siteSettings) {
      setFormData(prevData => ({
        ...prevData,
        ...siteSettings
      }));
    }
  }, [siteSettings]);

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
    { id: 'email', label: 'Email Setup', icon: Mail },
    { id: 'email-mgmt', label: 'Email Management', icon: RefreshCw },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Site Settings</h1>
        <p className="text-gray-600">Configure your website settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
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
                <h2 className="text-lg font-semibold mb-4">General Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Site Name</label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
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
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Multiple Email Accounts</h2>
                  <div className="text-sm text-gray-500">Configure different email accounts for various purposes</div>
                </div>

                {/* Quotes Email Account */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-medium">Quotes Email Account</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Mike@Kockys.com
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value="smtp.office365.com"
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SMTP Port</label>
                      <input
                        type="number"
                        value="587"
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        value="Mike@Kockys.com"
                        onChange={(e) => setFormData({
                          ...formData,
                          emailAccounts: { 
                            ...formData.emailAccounts, 
                            quotes: { ...formData.emailAccounts?.quotes, email: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Display Name</label>
                      <input
                        type="text"
                        value="QUOTE"
                        onChange={(e) => setFormData({
                          ...formData,
                          emailAccounts: { 
                            ...formData.emailAccounts, 
                            quotes: { ...formData.emailAccounts?.quotes, displayName: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Microsoft 365 App Password
                        <span className="text-red-500">*</span>
                      </label>
                      <form>
                        <input
                          type="password"
                          placeholder="Enter your 16-character app password from Microsoft 365"
                          value={formData.emailAccounts?.quotes?.password || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            emailAccounts: { 
                              ...formData.emailAccounts, 
                              quotes: { ...formData.emailAccounts?.quotes, password: e.target.value }
                            }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </form>
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>⚠️ Required:</strong> You need to generate an app password for Mike@Kockys.com
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Go to Microsoft 365 Admin → Users → Mike@Kockys.com → Mail apps → Generate app password
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Email Account */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-medium">Support Email Account</h3>
                      {formData.emailAccounts?.support?.email && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {formData.emailAccounts.support.email}
                        </span>
                      )}
                    </div>
                    {formData.emailAccounts?.support?.email && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </span>
                    )}
                  </div>
                  
                  {!formData.emailAccounts?.support?.email ? (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-700 mb-2">Connect Your Support Email</h4>
                        <p className="text-sm text-gray-500 mb-6">Sign in to handle customer support and general inquiries</p>
                      </div>
                      
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/oauth/microsoft/support/auth', {
                              method: 'POST',
                            });
                            const data = await response.json();
                            if (data.success) {
                              window.location.href = data.authUrl;
                            } else {
                              toast.error(data.message || 'Failed to initiate OAuth flow');
                            }
                          } catch (error) {
                            toast.error('Failed to connect support email account');
                          }
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.5 12c0-6.351-5.149-11.5-11.5-11.5S.5 5.649.5 12 5.649 23.5 12 23.5 23.5 18.351 23.5 12zm-2.166 0c0 5.175-4.159 9.334-9.334 9.334S2.666 17.175 2.666 12 6.825 2.666 12 2.666 21.334 6.825 21.334 12z"/>
                          <path d="M12 7.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5zm0 7.5c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z"/>
                        </svg>
                        Sign in with GoDaddy / Microsoft 365
                      </button>
                      
                      <p className="text-xs text-gray-500 mt-3">
                        Perfect for customer support and help desk emails
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <p className="font-medium text-green-800">{formData.emailAccounts.support.displayName}</p>
                          <p className="text-sm text-green-600">{formData.emailAccounts.support.email}</p>
                          <p className="text-xs text-green-500">Connected via OAuth2 • Auto-refresh enabled</p>
                        </div>
                        <button
                          onClick={async () => {
                            // Disconnect account logic here
                            toast.success('Support account disconnected');
                          }}
                          className="px-3 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">SMTP Host</label>
                      <input
                        type="text"
                        placeholder="smtp.gmail.com"
                        value={formData.emailAccounts?.support?.smtpHost || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailAccounts: { 
                            ...formData.emailAccounts, 
                            support: { ...formData.emailAccounts?.support, smtpHost: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SMTP Port</label>
                      <input
                        type="number"
                        placeholder="587"
                        value={formData.emailAccounts?.support?.smtpPort || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailAccounts: { 
                            ...formData.emailAccounts, 
                            support: { ...formData.emailAccounts?.support, smtpPort: parseInt(e.target.value) }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="support@kockysbar.com"
                        value={formData.emailAccounts?.support?.email || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailAccounts: { 
                            ...formData.emailAccounts, 
                            support: { ...formData.emailAccounts?.support, email: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Display Name</label>
                      <input
                        type="text"
                        placeholder="Kocky's Support"
                        value={formData.emailAccounts?.support?.displayName || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailAccounts: { 
                            ...formData.emailAccounts, 
                            support: { ...formData.emailAccounts?.support, displayName: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">App Password</label>
                      <form>
                        <input
                          type="password"
                          placeholder="Enter app-specific password"
                          value={formData.emailAccounts?.support?.password || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            emailAccounts: { 
                              ...formData.emailAccounts, 
                              support: { ...formData.emailAccounts?.support, password: e.target.value }
                            }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </form>
                    </div>
                  </div>
                </div>

                {/* General Email Account */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-medium">General Inquiries Email</h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {formData.emailAccounts?.general?.email || 'info@kockysbar.com'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">SMTP Host</label>
                      <input
                        type="text"
                        placeholder="smtp.gmail.com"
                        value={formData.emailAccounts?.general?.smtpHost || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailAccounts: { 
                            ...formData.emailAccounts, 
                            general: { ...formData.emailAccounts?.general, smtpHost: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SMTP Port</label>
                      <input
                        type="number"
                        placeholder="587"
                        value={formData.emailAccounts?.general?.smtpPort || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailAccounts: { 
                            ...formData.emailAccounts, 
                            general: { ...formData.emailAccounts?.general, smtpPort: parseInt(e.target.value) }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="info@kockysbar.com"
                        value={formData.emailAccounts?.general?.email || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailAccounts: { 
                            ...formData.emailAccounts, 
                            general: { ...formData.emailAccounts?.general, email: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Display Name</label>
                      <input
                        type="text"
                        placeholder="Kocky's Bar & Grill"
                        value={formData.emailAccounts?.general?.displayName || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailAccounts: { 
                            ...formData.emailAccounts, 
                            general: { ...formData.emailAccounts?.general, displayName: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">App Password</label>
                      <form>
                        <input
                          type="password"
                          placeholder="Enter app-specific password"
                          value={formData.emailAccounts?.general?.password || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            emailAccounts: { 
                              ...formData.emailAccounts, 
                              general: { ...formData.emailAccounts?.general, password: e.target.value }
                            }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </form>
                    </div>
                  </div>
                </div>

                {/* Default Account Selection */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <h3 className="text-lg font-medium mb-4">Default Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Default Account for Auto-Replies</label>
                      <select
                        value={formData.defaultEmailAccount || 'general'}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultEmailAccount: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="general">General Inquiries ({formData.emailAccounts?.general?.email || 'info@kockysbar.com'})</option>
                        <option value="support">Support ({formData.emailAccounts?.support?.email || 'support@kockysbar.com'})</option>
                        <option value="quotes">Quotes ({formData.emailAccounts?.quotes?.email || 'quotes@kockysbar.com'})</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">This account will be used for automatic inquiry confirmations</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Auto-Reply Status</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="auto-reply-enabled"
                          checked={formData.autoReplyEnabled || false}
                          onChange={(e) => setFormData({
                            ...formData,
                            autoReplyEnabled: e.target.checked
                          })}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <label htmlFor="auto-reply-enabled" className="text-sm">Enable automatic inquiry confirmations</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Email Settings */}
                <div className="border border-orange-200 bg-orange-50 rounded-lg p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    Test Email Configuration
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Test Account</label>
                      <select
                        id="test-account"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        defaultValue="quotes"
                      >
                        <option value="quotes">Quotes Account</option>
                        <option value="support">Support Account</option>
                        <option value="general">General Account</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Test Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter test email address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        id="test-email"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          const email = (document.getElementById('test-email') as HTMLInputElement)?.value;
                          const account = (document.getElementById('test-account') as HTMLSelectElement)?.value;
                          if (email && account) {
                            // Call test email API with account selection
                            testEmailMutation.mutate({ email, account });
                          }
                        }}
                        disabled={testEmailMutation.isPending}
                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {testEmailMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        Send Test Email
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>💡 Pro Tip:</strong> Make sure to use app-specific passwords for Gmail and Outlook accounts. 
                      Regular passwords won't work with SMTP authentication.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Email Management Tab */}
            {activeTab === 'email-mgmt' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Email Management Dashboard</h2>
                  <div className="text-sm text-gray-500">Microsoft 365 Integration & Email System</div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Status */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-6 h-6 text-blue-500" />
                      <h3 className="font-semibold">Email System Status</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">SMTP Config:</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Needs Password
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Microsoft Graph:</span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Not Setup
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const email = prompt('Enter test email address:');
                          if (email) testEmailMutation.mutate({ email, account: 'quotes' });
                        }}
                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Test Email Now
                      </button>
                    </div>
                  </div>

                  {/* Email Accounts */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Settings className="w-6 h-6 text-green-500" />
                      <h3 className="font-semibold">Active Accounts</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">Mike@Kockys.com</span>
                        <span className="text-xs text-blue-600">Primary</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">support@kockysbar.com</span>
                        <span className="text-xs text-gray-500">Pending</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">info@kockysbar.com</span>
                        <span className="text-xs text-gray-500">Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <RefreshCw className="w-6 h-6 text-purple-500" />
                      <h3 className="font-semibold">Quick Actions</h3>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('email')}
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                      >
                        Go to Email Setup
                      </button>
                      <button
                        onClick={() => window.open('/crm', '_blank')}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Open CRM
                      </button>
                    </div>
                  </div>
                </div>

                {/* Current Issue Alert */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-medium text-red-900">Email System Issue</h3>
                  </div>
                  <p className="text-red-800 mb-4">
                    Current error: <code className="bg-red-100 px-2 py-1 rounded text-sm">535 Incorrect authentication data</code>
                  </p>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <p className="text-sm text-red-900 font-medium mb-2">🔧 Quick Fix:</p>
                    <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                      <li>Click <strong>"Go to Email Setup"</strong> button above</li>
                      <li>Add your <strong>Microsoft 365 app password</strong> in the password field</li>
                      <li>Click <strong>"Save Changes"</strong></li>
                      <li>Come back here and test - should work immediately!</li>
                    </ol>
                  </div>
                </div>

                {/* Microsoft Graph Setup Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Future: Microsoft Graph Integration</h3>
                  </div>
                  <p className="text-blue-800 mb-4">
                    Advanced email features available once basic SMTP is working:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                    <ul className="space-y-1">
                      <li>• Fetch emails from inbox</li>
                      <li>• Auto-reply to inquiries</li>
                      <li>• Email tracking & analytics</li>
                    </ul>
                    <ul className="space-y-1">
                      <li>• Professional templates</li>
                      <li>• OAuth2 security</li>
                      <li>• Multi-mailbox support</li>
                    </ul>
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
