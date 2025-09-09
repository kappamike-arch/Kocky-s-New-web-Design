'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Image, Video, Trash2, CheckCircle, AlertCircle, X, FileUp, Eye, RefreshCw, Edit3, Save, Settings, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
const Cookies = require('js-cookie');

const HERO_SECTIONS = [
  { id: 'home', name: 'Home Page', imagePath: '/uploads/images/home-hero.jpg', videoPath: '/uploads/videos/home-hero.mp4' },
  { id: 'menu', name: 'Menu Page', imagePath: '/uploads/images/menu-hero.jpg', videoPath: '/uploads/videos/menu-hero.mp4' },
  { id: 'happy-hour', name: 'Happy Hour', imagePath: '/uploads/images/happy-hour-hero.jpg', videoPath: '/uploads/videos/happy-hour-hero.mp4' },
  { id: 'brunch', name: 'Brunch', imagePath: '/uploads/images/brunch-hero.jpg', videoPath: '/uploads/videos/brunch-hero.mp4' },
  { id: 'mobile-bar', name: 'Mobile Bar', imagePath: '/uploads/images/mobile-bar-hero.jpg', videoPath: '/uploads/videos/mobile-bar-hero.mp4' },
  { id: 'catering', name: 'Catering', imagePath: '/uploads/images/catering-hero.jpg', videoPath: '/uploads/videos/catering-hero.mp4' },
  { id: 'food-truck', name: 'Food Truck', imagePath: '/uploads/images/food-truck-hero.jpg', videoPath: '/uploads/videos/food-truck-hero.mp4' },
];

export default function MediaManagementPage() {
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({});
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { url: string; timestamp: number }>>({});
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({});
  const [mediaSelection, setMediaSelection] = useState<Record<string, 'image' | 'video' | 'auto'>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Save media selection preference
  const saveMediaSelection = async (sectionId: string, selection: 'image' | 'video' | 'auto') => {
    try {
      console.log(`[ADMIN] Saving media preference for ${sectionId}:`, selection);
      
      const token = Cookies.get('auth-token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update the backend with the media preference
      const response = await fetch(`http://72.167.227.205:5001/api/hero-settings/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mediaPreference: selection
        })
      });

      console.log(`[ADMIN] Save API response status:`, response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log(`[ADMIN] Save API response data:`, responseData);
        setMediaSelection(prev => ({ ...prev, [sectionId]: selection }));
        toast.success(`Media preference saved for ${sectionId}`);
        console.log(`[ADMIN] Media preference successfully saved: ${sectionId} -> ${selection}`);
      } else {
        if (response.status === 401) {
          Cookies.remove('auth-token');
          Cookies.remove('refresh-token');
          localStorage.removeItem('user');
          localStorage.removeItem('user-id');
          toast.error('Session expired, please log in again');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        const errorText = await response.text();
        console.error(`[ADMIN] Save failed with status ${response.status}:`, errorText);
        throw new Error(`Failed to save preference: ${response.status}`);
      }
    } catch (error) {
      console.error('[ADMIN] Error saving media preference:', error);
      toast.error('Failed to save media preference');
    }
  };

  // Toggle edit mode for a section
  const toggleEdit = (sectionId: string) => {
    setIsEditing(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Get what should be displayed based on uploads and selection
  const getDisplayType = (sectionId: string) => {
    const hasImage = uploadedFiles[`${sectionId}-image`];
    const hasVideo = uploadedFiles[`${sectionId}-video`];
    const selection = mediaSelection[sectionId] || 'auto';

    if (!hasImage && !hasVideo) return 'none';
    if (hasImage && !hasVideo) return 'image';
    if (!hasImage && hasVideo) return 'video';
    
    // Both exist - use selection
    if (selection === 'auto') return 'video'; // Default to video when both exist
    return selection;
  };

  // Load existing media preferences and files on mount
  useEffect(() => {
    const loadMediaSettings = async () => {
      for (const section of HERO_SECTIONS) {
        // Load media preference from API
        try {
          const token = Cookies.get('auth-token');
          if (token) {
            const response = await fetch(`http://72.167.227.205:5001/api/hero-settings/${section.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              console.log(`[ADMIN] Loaded media settings for ${section.id}:`, data);
              if (data.mediaPreference) {
                setMediaSelection(prev => ({ ...prev, [section.id]: data.mediaPreference }));
                console.log(`[ADMIN] Set media preference for ${section.id} to:`, data.mediaPreference);
              }
            }
          }
        } catch (err) {
          console.log(`No media preference found for ${section.id}`);
        }

        // Check for existing image
        try {
          const imageResponse = await fetch(`http://72.167.227.205:5001${section.imagePath}`, { method: 'HEAD' });
          if (imageResponse.ok) {
            setUploadedFiles(prev => ({
              ...prev,
              [`${section.id}-image`]: { 
                url: `http://72.167.227.205:5001${section.imagePath}`,
                timestamp: Date.now()
              }
            }));
          }
        } catch (err) {
          console.log(`No image found for ${section.id}`);
        }

        // Check for existing video
        try {
          const videoResponse = await fetch(`http://72.167.227.205:5001${section.videoPath}`, { method: 'HEAD' });
          if (videoResponse.ok) {
            setUploadedFiles(prev => ({
              ...prev,
              [`${section.id}-video`]: { 
                url: `http://72.167.227.205:5001${section.videoPath}`,
                timestamp: Date.now()
              }
            }));
          }
        } catch (err) {
          console.log(`No video found for ${section.id}`);
        }
      }
    };
    
    loadMediaSettings();
  }, []);

  const handleDragEnter = (e: React.DragEvent, sectionId: string, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [`${sectionId}-${type}`]: true }));
  };

  const handleDragLeave = (e: React.DragEvent, sectionId: string, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [`${sectionId}-${type}`]: false }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, sectionId: string, type: 'image' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [`${sectionId}-${type}`]: false }));

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(sectionId, files[0], type);
    }
  };

  const handleFileUpload = async (sectionId: string, file: File, type: 'image' | 'video') => {
    // Validate file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    // Validate file size
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
    if (file.size > maxSize) {
      toast.error(`File size too large. Max size: ${type === 'image' ? '5MB' : '50MB'}`);
      return;
    }

    const key = `${sectionId}-${type}`;
    setUploadStatus(prev => ({ ...prev, [key]: 'uploading' }));

    try {
      let fileUrl = '';
      
      if (type === 'video') {
        // Use backend API for video uploads
        const { heroSettingsAPI } = await import('../../lib/api/hero-settings');
        const result = await heroSettingsAPI.uploadVideo(sectionId, file);
        fileUrl = `http://72.167.227.205:5001${result.videoUrl}`;
      } else {
        // Use backend API for image uploads (same as videos)
        const { heroSettingsAPI } = await import('../../lib/api/hero-settings');
        console.log(`🖼️ Uploading image for ${sectionId}:`, file.name, file.type, file.size);
        const result = await heroSettingsAPI.uploadImage(sectionId, file);
        console.log(`✅ Image upload result for ${sectionId}:`, result);
        fileUrl = `http://72.167.227.205:5001${result.imageUrl}`;
      }
      
      // Update uploaded files with the new file URL
      setUploadedFiles(prev => ({
        ...prev,
        [key]: { url: fileUrl, timestamp: Date.now() }
      }));
      
      toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`);
      setUploadStatus(prev => ({ ...prev, [key]: 'success' }));
        
        // Auto show preview after successful upload
        setShowPreview(prev => ({ ...prev, [key]: true }));
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setUploadStatus(prev => ({ ...prev, [key]: 'idle' }));
        }, 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      console.error('Full error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('Upload failed. Please try again.');
      setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
    }
  };

  const UploadZone = ({ section, type }: { section: any; type: 'image' | 'video' }) => {
    const key = `${section.id}-${type}`;
    const isActive = dragActive[key];
    const status = uploadStatus[key];
    const path = type === 'image' ? section.imagePath : section.videoPath;
    const Icon = type === 'image' ? Image : Video;
    const uploadedFile = uploadedFiles[key];
    const isShowingPreview = showPreview[key];

    return (
      <div className="space-y-2">
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
            ${isActive ? 'border-primary bg-primary/5 scale-105' : 'border-gray-300 hover:border-primary'}
            ${status === 'uploading' ? 'pointer-events-none opacity-75' : ''}
            ${status === 'success' ? 'border-green-500 bg-green-50' : ''}
            ${status === 'error' ? 'border-red-500 bg-red-50' : ''}
            ${uploadedFile ? 'border-solid' : ''}
          `}
          onDragEnter={(e) => handleDragEnter(e, section.id, type)}
          onDragLeave={(e) => handleDragLeave(e, section.id, type)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, section.id, type)}
          onClick={() => {
            if (status === 'success') {
              console.log(`🔄 Click to replace existing ${type} for ${section.id}`);
              setUploadStatus(prev => ({ ...prev, [key]: 'idle' }));
            }
            fileInputRefs.current[key]?.click();
          }}
        >
          {/* Upload Progress Overlay */}
          {status === 'uploading' && (
            <div className="absolute inset-0 bg-white/90 rounded-lg flex flex-col items-center justify-center z-10">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="text-sm font-medium">Uploading...</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Icon className={`h-10 w-10 ${isActive ? 'text-primary' : uploadedFile ? 'text-green-600' : 'text-gray-400'}`} />
              {uploadedFile && (
                <CheckCircle className="h-5 w-5 text-green-500 absolute -top-1 -right-1" />
              )}
              {status === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-500 absolute -top-1 -right-1" />
              )}
            </div>

            <div className="text-center">
              <p className="font-medium text-gray-700">
                {type === 'image' ? 'Hero Image' : 'Hero Video (Optional)'}
              </p>
              {uploadedFile ? (
                <p className="text-sm text-green-600 mt-1">
                  ✓ File uploaded
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop or click to upload
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {type === 'image' 
                  ? 'JPG, PNG, WebP (max 5MB)'
                  : 'MP4, WebM (max 50MB)'
                }
              </p>
            </div>

            <div className="bg-gray-100 px-3 py-1 rounded-full">
              <code className="text-xs">{path}</code>
            </div>

            {/* Preview Toggle Button */}
            {uploadedFile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(prev => ({ ...prev, [key]: !prev[key] }));
                }}
                className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-sm"
              >
                <Eye className="h-4 w-4" />
                {isShowingPreview ? 'Hide' : 'Show'} Preview
              </button>
            )}
          </div>

          <input
            ref={(el) => { fileInputRefs.current[key] = el; }}
            type="file"
            accept={type === 'image' ? 'image/*' : 'video/*'}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(section.id, file, type);
            }}
          />
        </div>

        {/* Preview Section */}
        {uploadedFile && isShowingPreview && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">Preview</h4>
              <button
                onClick={() => {
                  // Force refresh the preview
                  const newUrl = `${uploadedFile.url}?t=${Date.now()}`;
                  setUploadedFiles(prev => ({
                    ...prev,
                    [key]: { ...prev[key], url: newUrl }
                  }));
                }}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
            </div>
            <div className="relative overflow-hidden rounded-md bg-black/5">
              {type === 'image' ? (
                <img
                  src={uploadedFile.url}
                  alt={`${section.name} preview`}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/placeholder/400/200';
                  }}
                />
              ) : (
                <video
                  src={uploadedFile.url}
                  className="w-full h-40 object-cover"
                  controls
                  muted
                  onError={(e) => {
                    console.error('Video preview failed:', e);
                  }}
                />
              )}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {type === 'image' ? 'Image' : 'Video'}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Uploaded: {new Date(uploadedFile.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Media Management</h1>
        <p className="text-gray-600">Upload and preview hero images and videos for different pages</p>
      </div>

      {/* Status Bar */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-900 mb-1">Upload Status</h3>
            <p className="text-sm text-green-700">
              {Object.keys(uploadedFiles).length} files uploaded successfully
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(
                Object.keys(uploadedFiles).reduce((acc, key) => ({ ...acc, [key]: true }), {})
              )}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Show All Previews
            </button>
            <button
              onClick={() => setShowPreview({})}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              Hide All Previews
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
          <FileUp className="h-5 w-5 mr-2" />
          Upload Features:
        </h3>
        <div className="text-blue-800 space-y-2 text-sm">
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>Drag & Drop:</strong> Drag files directly onto upload zones</li>
            <li><strong>Preview:</strong> See uploaded files instantly with preview button</li>
            <li><strong>Status Indicators:</strong> Green checkmark shows successful uploads</li>
            <li><strong>Auto-detection:</strong> System automatically detects existing files</li>
            <li><strong>Live Updates:</strong> Changes appear immediately on the frontend</li>
          </ul>
        </div>
      </div>

      {/* Hero Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {HERO_SECTIONS.map((section) => {
          const hasImage = uploadedFiles[`${section.id}-image`];
          const hasVideo = uploadedFiles[`${section.id}-video`];
          const displayType = getDisplayType(section.id);
          const editing = isEditing[section.id];
          
          return (
          <div key={section.id} className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{section.name}</h3>
              <div className="flex items-center gap-2">
                {/* Display status indicator */}
                {displayType !== 'none' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Monitor className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">
                      Showing: {displayType === 'image' ? 'Image' : 'Video'}
                    </span>
                  </div>
                )}
                
                {/* Edit button */}
                {(hasImage || hasVideo) && (
                  <button
                    onClick={() => toggleEdit(section.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit media settings"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Media Selection Controls (shown when editing and both media types exist) */}
            {editing && hasImage && hasVideo && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Choose Display Media
                </h4>
                <div className="flex gap-3">
                  {['image', 'video', 'auto'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`${section.id}-media`}
                        value={option}
                        checked={mediaSelection[section.id] === option}
                        onChange={() => setMediaSelection(prev => ({ ...prev, [section.id]: option as any }))}
                        className="text-blue-600"
                      />
                      <span className="text-sm capitalize">
                        {option === 'auto' ? 'Auto (Video Priority)' : option}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      saveMediaSelection(section.id, mediaSelection[section.id] || 'auto');
                      setIsEditing(prev => ({ ...prev, [section.id]: false }));
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(prev => ({ ...prev, [section.id]: false }))}
                    className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Image Upload Zone */}
              <UploadZone section={section} type="image" />
              
              {/* Video Upload Zone */}
              <UploadZone section={section} type="video" />
            </div>
          </div>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
        <h3 className="font-semibold mb-4 flex items-center">
          💡 Pro Tips:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Upload Guidelines:</h4>
            <ul className="list-disc ml-5 space-y-1 text-gray-700">
              <li>Green checkmark = File uploaded successfully</li>
              <li>Click "Show Preview" to verify uploads</li>
              <li>Files are saved with correct naming automatically</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Troubleshooting:</h4>
            <ul className="list-disc ml-5 space-y-1 text-gray-700">
              <li>If preview doesn't show, click "Refresh"</li>
              <li>Clear browser cache if old images persist</li>
              <li>Videos may take a moment to process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}