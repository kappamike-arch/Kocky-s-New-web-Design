'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Image, Video, Type, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = 'https://staging.kockys.com/api';

interface ContentManagementProps {
  onSave?: (data: any) => void;
}

export default function ContentManagement({ onSave }: ContentManagementProps) {
  const [formData, setFormData] = useState({
    heroTitle: "Welcome to Kocky's",
    heroSubtitle: "Bar & Grill",
    heroDescription: "Where Great Food Meets Unforgettable Moments",
    aboutText: "This text appears on the About section of the homepage"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      console.log('🔍 ContentManagement: Fetching content from backend...');
      
      // Fetch hero content from hero-settings endpoint
      let heroData = null;
      try {
        const heroResponse = await fetch('API_BASE_URL/hero-settings/home', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (heroResponse.ok) {
          const heroResult = await heroResponse.json();
          console.log('🔍 ContentManagement: Hero data received:', heroResult);
          heroData = heroResult.settings || heroResult;
        }
      } catch (error) {
        console.log('🔍 ContentManagement: Hero settings not found, using defaults:', error);
      }
      
      // Fetch other settings
      const response = await fetch('API_BASE_URL/settings', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 ContentManagement: Settings data received:', data);
        
        // Update form data with live data from backend
        setFormData({
          heroTitle: heroData?.title || "Welcome to Kocky's",
          heroSubtitle: heroData?.subtitle || "Bar & Grill",
          heroDescription: heroData?.description || "Where Great Food Meets Unforgettable Moments",
          aboutText: data.siteDescription || "This text appears on the About section of the homepage"
        });
      } else {
        console.error('🔍 ContentManagement: Failed to fetch settings:', response.status);
        toast.error('Failed to load content from backend');
      }
    } catch (error) {
      console.error('🔍 ContentManagement: Error fetching content:', error);
      toast.error('Failed to load content from backend. Please check your connection.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save hero content to hero-settings endpoint
      const heroResponse = await fetch('API_BASE_URL/hero-settings/home', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          title: formData.heroTitle,
          subtitle: formData.heroSubtitle,
          description: formData.heroDescription,
          useLogo: false
        }),
        cache: 'no-store'
      });
      
      if (!heroResponse.ok) {
        throw new Error('Failed to save hero content');
      }
      
      // Save about text to settings endpoint
      const settingsResponse = await fetch('API_BASE_URL/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          siteDescription: formData.aboutText
        }),
        cache: 'no-store'
      });
      
      if (!settingsResponse.ok) {
        throw new Error('Failed to save about text');
      }
      
      if (onSave) {
        onSave(formData);
      }
      
      toast.success('Content saved successfully!');
      
      // Re-fetch content to ensure UI shows live data
      await fetchContent();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isInitialLoading) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h1 className="admin-h1">Content Management</h1>
          <p className="admin-help">Loading content from backend...</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-h1">Content Management</h1>
        <p className="admin-help">Manage all website content, sample data, and integrations</p>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <div className="flex overflow-x-auto">
          <button className="admin-tab active">
            <Type className="admin-icon" />
            Website Content
          </button>
          <button className="admin-tab">
            <FileText className="admin-icon" />
            Online Ordering
          </button>
          <button className="admin-tab">
            <FileText className="admin-icon" />
            Email & Payments
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="admin-content">
        {/* Home Page Hero Section */}
        <div className="admin-section">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                <Image className="admin-icon admin-icon-primary" />
                Home Page Hero
              </h3>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="hero-title">Title</label>
              <input
                id="hero-title"
                type="text"
                className="admin-input"
                placeholder="Welcome to Kocky's"
                value={formData.heroTitle}
                onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                aria-describedby="hero-title-help"
              />
              <div id="hero-title-help" className="admin-help">The main heading displayed on the homepage hero section</div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="hero-subtitle">Subtitle</label>
              <input
                id="hero-subtitle"
                type="text"
                className="admin-input"
                placeholder="Bar & Grill"
                value={formData.heroSubtitle}
                onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                aria-describedby="hero-subtitle-help"
              />
              <div id="hero-subtitle-help" className="admin-help">The secondary heading displayed below the main title</div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="hero-description">Description</label>
              <textarea
                id="hero-description"
                className="admin-textarea"
                placeholder="Where Great Food Meets Unforgettable Moments"
                value={formData.heroDescription}
                onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                rows={3}
                aria-describedby="hero-description-help"
              />
              <div id="hero-description-help" className="admin-help">A brief description of your restaurant that appears in the hero section</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="admin-button"
                aria-describedby="save-help"
              >
                <Save className="admin-icon" />
                {isLoading ? 'Saving...' : 'Save Hero Content'}
              </button>
              <div id="save-help" className="admin-help">Save your changes to the hero section</div>
              
              <button className="admin-button admin-button-secondary">
                <Upload className="admin-icon" />
                Upload Hero Image
              </button>
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <div className="admin-section">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                <FileText className="admin-icon admin-icon-primary" />
                About Us Text
              </h3>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="about-text">About Section Content</label>
              <textarea
                id="about-text"
                className="admin-textarea"
                placeholder="This text appears on the About section of the homepage"
                value={formData.aboutText}
                onChange={(e) => handleInputChange('aboutText', e.target.value)}
                rows={4}
                aria-describedby="about-text-help"
              />
              <div id="about-text-help" className="admin-help">Describe your restaurant's story, history, and what makes it special</div>
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className="admin-button"
            >
              <Save className="admin-icon" />
              {isLoading ? 'Saving...' : 'Save About Content'}
            </button>
          </div>
        </div>

        {/* Additional Content Sections */}
        <div className="admin-section">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                <Video className="admin-icon admin-icon-primary" />
                Media Management
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="admin-form-group">
                <label className="admin-label">Hero Video</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="video/*"
                    className="admin-input"
                  />
                  <button className="admin-btn admin-btn-secondary">
                    <Upload className="admin-icon" />
                    Upload
                  </button>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Hero Image</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-input"
                  />
                  <button className="admin-btn admin-btn-secondary">
                    <Upload className="admin-icon" />
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
