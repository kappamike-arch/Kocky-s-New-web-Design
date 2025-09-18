'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Image as ImageIcon, Type, Trash2, Check, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { heroSettingsAPI, HeroSettings } from '@/lib/api/hero-settings';
import { getImageUrl } from '@/config/server';

const defaultPages: HeroSettings[] = [
  {
    id: 'home',
    pageName: 'Home',
    pageSlug: '/',
    useLogo: true,
    logoUrl: null,
    title: "Welcome to Kocky's",
    subtitle: 'Bar & Grill',
    description: 'Where Great Food Meets Unforgettable Moments'
  },
  {
    id: 'menu',
    pageName: 'Menu',
    pageSlug: '/menu',
    useLogo: true,
    logoUrl: null,
    title: "Our Menu",
    subtitle: 'Delicious Food & Drinks',
    description: 'Discover our amazing selection'
  },
  {
    id: 'happy-hour',
    pageName: 'Happy Hour',
    pageSlug: '/happy-hour',
    useLogo: true,
    logoUrl: null,
    title: 'Happy Hour Specials',
    subtitle: 'Daily 3PM - 6PM',
    description: 'Join us for amazing deals on drinks and appetizers'
  },
  {
    id: 'brunch',
    pageName: 'Weekend Brunch',
    pageSlug: '/brunch',
    useLogo: true,
    logoUrl: null,
    title: 'Weekend Brunch',
    subtitle: 'Saturday & Sunday',
    description: 'Join us from 10am - 3pm for the best brunch in town'
  },
  {
    id: 'mobile',
    pageName: 'Mobile Bar',
    pageSlug: '/mobile-bar',
    useLogo: true,
    logoUrl: null,
    title: 'Mobile Bar Service',
    subtitle: 'We Come to You',
    description: 'Professional bartending for your special events'
  },
  {
    id: 'catering',
    pageName: 'Catering',
    pageSlug: '/catering',
    useLogo: true,
    logoUrl: null,
    title: 'Catering Services',
    subtitle: 'Events & Parties',
    description: 'Let us cater your next event'
  },
  {
    id: 'food-truck',
    pageName: 'Food Truck',
    pageSlug: '/services/food-truck',
    useLogo: false,
    logoUrl: null,
    title: 'Food Truck Service',
    subtitle: 'Bringing Kockys experience to your event',
    description: 'Professional catering on wheels for your special events'
  },
  {
    id: 'reservations',
    pageName: 'Reservations',
    pageSlug: '/reservations',
    useLogo: true,
    logoUrl: null,
    title: 'Make a Reservation',
    subtitle: 'Book Your Table',
    description: 'Reserve your spot today'
  },
  {
    id: 'about',
    pageName: 'About Us',
    pageSlug: '/about',
    useLogo: true,
    logoUrl: null,
    title: "About Kocky's",
    subtitle: 'Our Story',
    description: 'Family owned and operated since 2010'
  }
];

export default function HeroSettingsPage() {
  const [pages, setPages] = useState<HeroSettings[]>(defaultPages);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    // Load settings from API
    loadSettings();
    // Clean up non-existent logos after loading
    setTimeout(() => {
      cleanupNonExistentLogos();
    }, 2000);
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await heroSettingsAPI.getAll();
      if (settings && settings.length > 0) {
        setPages(settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings from server');
      // Use default pages if API fails
      setPages(defaultPages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (pageId: string, file: File) => {
    try {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`File too large. Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Please upload an image file (JPEG, PNG, GIF, SVG, or WebP)`);
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('logo', file);
      
      console.log(`[Logo Upload] Uploading logo for ${pageId}...`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Upload the logo file to backend
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://72.167.227.205:5001/api'}/hero-settings/${pageId}/upload-logo`, {
        method: 'POST',
        body: formData
      });
      
      let uploadResult;
      const responseText = await uploadResponse.text();
      
      try {
        uploadResult = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse upload response:', responseText);
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`);
      }
      
      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(uploadResult?.message || `Upload failed: ${uploadResponse.statusText}`);
      }
      
      const logoUrl = uploadResult.data.logoUrl;
      console.log(`[Logo Upload] Successfully uploaded logo for ${pageId}:`, logoUrl);
      
      // Update local state with the uploaded logo URL
      setPages(prevPages => prevPages.map(page => 
        page.id === pageId 
          ? { ...page, logoUrl, useLogo: true }
          : page
      ));
      
      toast.success(`Logo uploaded for ${pages.find(p => p.id === pageId)?.pageName}`);
      
      // Reload settings to ensure sync
      setTimeout(loadSettings, 500);
      
    } catch (error: any) {
      console.error('Logo upload error:', error);
      
      // Try to get a more specific error message
      let message = 'Failed to upload logo';
      
      if (error.message) {
        message = error.message;
      }
      
      // Log the full error for debugging
      console.error('Full upload error details:', {
        error,
        pageId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      toast.error(message);
      
      // Revert on error
      loadSettings();
    }
  };

  // Validate logo exists
  const validateLogoExists = async (logoUrl: string): Promise<boolean> => {
    if (!logoUrl) return false;
    try {
      const fullUrl = getImageUrl(logoUrl);
      const response = await fetch(fullUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Logo validation failed:', error);
      return false;
    }
  };

  // Clean up non-existent logos
  const cleanupNonExistentLogos = async () => {
    const updatedPages = await Promise.all(
      pages.map(async (page) => {
        if (page.logoUrl) {
          const exists = await validateLogoExists(page.logoUrl);
          if (!exists) {
            console.log(`Cleaning up non-existent logo for ${page.pageName}: ${page.logoUrl}`);
            // Update the page to remove the non-existent logo
            try {
              await savePageSettings(page.id, { logoUrl: null, useLogo: false });
              return { ...page, logoUrl: null, useLogo: false };
            } catch (error) {
              console.error(`Failed to clean up logo for ${page.pageName}:`, error);
              return page;
            }
          }
        }
        return page;
      })
    );
    setPages(updatedPages);
  };

  const handleRemovePageLogo = async (pageId: string) => {
    // Update locally first
    setPages(prevPages => prevPages.map(page => 
      page.id === pageId 
        ? { ...page, logoUrl: '', useLogo: false }
        : page
    ));
    
    // Save to API
    try {
      await savePageSettings(pageId, { logoUrl: '', useLogo: false });
      toast.success('Logo removed');
    } catch (error) {
      toast.error('Failed to remove logo');
      // Revert on error
      loadSettings();
    }
  };

  const handlePageUpdate = (pageId: string, updates: Partial<HeroSettings>) => {
    setPages(prevPages => prevPages.map(page => 
      page.id === pageId ? { ...page, ...updates } : page
    ));
  };

  const savePageSettings = async (pageId: string, updates?: Partial<HeroSettings>) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    const pageToSave = updates ? { ...page, ...updates } : page;
    
    console.log('Saving page settings:', pageToSave); // Debug log
    
    try {
      await heroSettingsAPI.updatePage(pageId, pageToSave);
      return true;
    } catch (error) {
      console.error('Failed to save page settings:', error);
      throw error;
    }
  };

  const handleSavePageSettings = async (pageId: string) => {
    setIsSaving(pageId);
    try {
      await savePageSettings(pageId);
      toast.success(`Settings saved for ${pages.find(p => p.id === pageId)?.pageName}`);
    } catch (error) {
      toast.error('Failed to save settings to server');
    } finally {
      setIsSaving(null);
    }
  };

  const handleSaveAllSettings = async () => {
    setIsLoading(true);
    try {
      await heroSettingsAPI.saveAll(pages);
      toast.success('All settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings to server');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPage = pages.find(p => p.id === activeTab) || pages[0];

  if (isLoading && pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hero Section Settings</h1>
        <p className="text-gray-600 mt-2">
          Customize the hero section for each page independently. Upload unique logos or set custom titles per page.
        </p>
        <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded-lg text-sm">
          ℹ️ Changes are saved to the server and will reflect on the frontend immediately.
        </div>
      </div>

      {/* Page-specific Settings */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Page Settings</h2>
          <p className="text-gray-600 text-sm">
            Each page can have its own logo or title configuration
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex overflow-x-auto">
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => setActiveTab(page.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === page.id
                    ? 'bg-white border-b-2 border-black text-black'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {page.pageName}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {/* Page-specific Logo Upload */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Logo Settings</h3>
              <button
                onClick={() => handleSavePageSettings(currentPage.id)}
                disabled={isSaving === currentPage.id}
                className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center"
              >
                {isSaving === currentPage.id ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Page
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              {currentPage.logoUrl ? (
                <div className="relative">
                  <img 
                    src={getImageUrl(currentPage.logoUrl)} 
                    alt={`${currentPage.pageName} logo`} 
                    className="h-20 w-auto rounded-lg border bg-white p-2"
                    onError={(e: any) => {
                      console.error(`Logo display failed for ${currentPage.pageName}:`, currentPage.logoUrl);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA3NUMzNS4zIDc1IDI1IDY0LjcgMjUgNTBTMzUuMyAyNSA1MCAyNVM3NSAzNS4zIDc1IDUwUzY0LjcgNzUgNTAgNzVaTTUwIDMwQzM4LjEgMzAgMzAgMzguMSAzMCA1MFMzOC4xIDcwIDUwIDcwUzcwIDYxLjkgNzAgNTBTNjEuOSAzMCA1MCAzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                      toast.error(`Failed to load logo for ${currentPage.pageName}`);
                    }}
                  />
                  <button
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    onClick={() => handleRemovePageLogo(currentPage.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-white">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <div>
                <label htmlFor={`logo-upload-${currentPage.id}`} className="cursor-pointer">
                  <span className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 inline-flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo for {currentPage.pageName}
                  </span>
                </label>
                <input
                  ref={el => fileInputRefs.current[currentPage.id] = el}
                  id={`logo-upload-${currentPage.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(currentPage.id, file);
                  }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  This logo will only be used for the {currentPage.pageName} page
                </p>
              </div>
            </div>
          </div>

          {/* Display Mode Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${currentPage.useLogo ? 'bg-black text-white' : 'bg-gray-100'}`}>
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <label className="text-base font-medium">Use Logo</label>
                <p className="text-sm text-gray-600">
                  {currentPage.logoUrl 
                    ? 'Display the uploaded logo for this page' 
                    : 'No logo uploaded - will show default text'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={currentPage.useLogo}
                disabled={!currentPage.logoUrl}
                onChange={(e) => 
                  handlePageUpdate(currentPage.id, { useLogo: e.target.checked })
                }
              />
              <div className={`w-11 h-6 ${!currentPage.logoUrl ? 'bg-gray-100' : 'bg-gray-200'} peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black`}></div>
            </label>
          </div>

          {/* Text Settings */}
          <div className={`space-y-4 ${currentPage.useLogo && currentPage.logoUrl ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <Type className="h-5 w-5" />
              <label className="text-base font-medium">Text Content (Used when logo is disabled)</label>
            </div>
            
            <div>
              <label htmlFor={`title-${currentPage.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id={`title-${currentPage.id}`}
                type="text"
                value={currentPage.title || ''}
                onChange={(e) => 
                  handlePageUpdate(currentPage.id, { title: e.target.value })
                }
                placeholder="Enter page title (e.g., 'Weekend Brunch')"
                disabled={currentPage.useLogo && !!currentPage.logoUrl}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label htmlFor={`subtitle-${currentPage.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                id={`subtitle-${currentPage.id}`}
                type="text"
                value={currentPage.subtitle || ''}
                onChange={(e) => 
                  handlePageUpdate(currentPage.id, { subtitle: e.target.value })
                }
                placeholder="Enter subtitle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label htmlFor={`description-${currentPage.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id={`description-${currentPage.id}`}
                value={currentPage.description || ''}
                onChange={(e) => 
                  handlePageUpdate(currentPage.id, { description: e.target.value })
                }
                placeholder="Enter description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="border rounded-lg p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="text-center">
              <h4 className="text-sm text-gray-400 mb-4">PREVIEW</h4>
              
              {/* Show logo if enabled and available */}
              {currentPage.useLogo && currentPage.logoUrl ? (
                <img 
                  src={getImageUrl(currentPage.logoUrl)} 
                  alt="Logo preview" 
                  className="h-24 md:h-32 mx-auto mb-4"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.3))'
                  }}
                  onError={(e: any) => {
                    console.error('Logo preview failed:', currentPage.logoUrl);
                    e.target.style.display = 'none';
                    toast.error(`Logo preview failed for ${currentPage.pageName}. Please re-upload the logo.`);
                  }}
                />
              ) : currentPage.title ? (
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {currentPage.title}
                </h1>
              ) : (
                // Fallback to default Kocky's
                <div className="mb-4">
                  <span className="text-4xl md:text-5xl font-bold">
                    <span className="text-red-600">Kocky's</span>
                    <span className="text-yellow-500 ml-2">Bar & Grill</span>
                  </span>
                </div>
              )}
              
              {currentPage.subtitle && (
                <h2 className="text-xl md:text-2xl font-semibold mb-2 text-gray-200">
                  {currentPage.subtitle}
                </h2>
              )}
              {currentPage.description && (
                <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
                  {currentPage.description}
                </p>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              {currentPage.useLogo && currentPage.logoUrl ? (
                <>
                  <Check className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-900">Using custom logo for this page</span>
                </>
              ) : currentPage.title ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-900">Using custom title text</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-900">Using default "Kocky\'s" fallback</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save All Button */}
      <div className="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Changes are saved per page and synced with the server. Use "Save All" to ensure all pages are updated.
        </p>
        <button 
          onClick={handleSaveAllSettings}
          disabled={isLoading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Saving All...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Pages
            </>
          )}
        </button>
        
        <button
          onClick={cleanupNonExistentLogos}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clean Up Missing Logos
        </button>
      </div>
    </div>
  );
}