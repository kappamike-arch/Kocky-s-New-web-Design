'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { servicesAPI, ServiceSettings } from '@/lib/api/services';
import { 
  Wine, Truck, Save, Edit, Plus, Trash2, 
  Check, X, Settings, Package, Users, Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServiceSettingsPage() {
  const [activeService, setActiveService] = useState<'food-truck' | 'mobile-bar'>('mobile-bar');
  const [settings, setSettings] = useState<ServiceSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [activeService]);

  const loadSettings = async () => {
    try {
      const data = await servicesAPI.getSettings(activeService);
      // Ensure packages array exists
      const settingsWithPackages = {
        ...data,
        packages: data.packages || []
      };
      setSettings(settingsWithPackages);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await servicesAPI.updateSettings(activeService, settings);
      toast.success('Settings saved successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addPackage = () => {
    if (!settings) return;
    
    const newPackage = {
      id: `package-${Date.now()}`,
      name: 'New Package',
      price: 'Starting at $',
      duration: 'Hours',
      guests: 'Guests',
      features: ['Feature 1'],
      popular: false
    };
    
    setSettings({
      ...settings,
      packages: [...settings.packages, newPackage]
    });
  };

  const removePackage = (index: number) => {
    if (!settings) return;
    
    const updated = settings.packages.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      packages: updated
    });
  };

  const addFeature = (packageIndex: number) => {
    if (!settings) return;
    
    const updated = [...settings.packages];
    updated[packageIndex].features.push('New feature');
    setSettings({
      ...settings,
      packages: updated
    });
  };

  const removeFeature = (packageIndex: number, featureIndex: number) => {
    if (!settings) return;
    
    const updated = [...settings.packages];
    updated[packageIndex].features = updated[packageIndex].features.filter((_, i) => i !== featureIndex);
    setSettings({
      ...settings,
      packages: updated
    });
  };

  const updatePackageField = (index: number, field: string, value: any) => {
    if (!settings) return;
    
    const updated = [...settings.packages];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({
      ...settings,
      packages: updated
    });
  };

  const updateFeature = (packageIndex: number, featureIndex: number, value: string) => {
    if (!settings) return;
    
    const updated = [...settings.packages];
    updated[packageIndex].features[featureIndex] = value;
    setSettings({
      ...settings,
      packages: updated
    });
  };

  if (!settings) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Service Settings</h1>
        <p className="text-gray-600">Manage content for Food Truck and Mobile Bar services</p>
      </div>

      {/* Service Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveService('mobile-bar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeService === 'mobile-bar'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Wine className="inline-block w-5 h-5 mr-2" />
              Mobile Bar Service
            </button>
            <button
              onClick={() => setActiveService('food-truck')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeService === 'food-truck'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Truck className="inline-block w-5 h-5 mr-2" />
              Food Truck Service
            </button>
          </nav>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {activeService === 'mobile-bar' ? 'Mobile Bar' : 'Food Truck'} Page Content
          </h2>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadSettings(); // Reset changes
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X className="inline-block w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Content
              </button>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Service Packages */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Service Packages</h3>
              {isEditing && (
                <button
                  onClick={addPackage}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Package
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {(settings.packages || []).map((pkg, pkgIndex) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Package Name</label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => updatePackageField(pkgIndex, 'name', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                        <input
                          type="text"
                          value={pkg.price}
                          onChange={(e) => updatePackageField(pkgIndex, 'price', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                        <input
                          type="text"
                          value={pkg.duration}
                          onChange={(e) => updatePackageField(pkgIndex, 'duration', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Guest Count</label>
                        <input
                          type="text"
                          value={pkg.guests}
                          onChange={(e) => updatePackageField(pkgIndex, 'guests', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removePackage(pkgIndex)}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Popular Badge */}
                  <div className="mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pkg.popular || false}
                        onChange={(e) => updatePackageField(pkgIndex, 'popular', e.target.checked)}
                        disabled={!isEditing}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Mark as Popular</span>
                    </label>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-gray-600">Features</label>
                      {isEditing && (
                        <button
                          onClick={() => addFeature(pkgIndex)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          + Add Feature
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {pkg.features.map((feature, featIndex) => (
                        <div key={featIndex} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(pkgIndex, featIndex, e.target.value)}
                            disabled={!isEditing}
                            className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                          {isEditing && (
                            <button
                              onClick={() => removeFeature(pkgIndex, featIndex)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.isActive}
                onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                disabled={!isEditing}
                className="w-5 h-5 rounded"
              />
              <span className="font-medium">
                Service is Active
                <span className="block text-sm text-gray-500">
                  {settings.isActive ? 'Service is visible on the website' : 'Service is hidden from the website'}
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

