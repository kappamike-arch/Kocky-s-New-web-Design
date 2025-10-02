'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';

interface GalleryImage {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  mimeType: string | null;
  order: number;
  isActive: boolean;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  // Fetch images
  const fetchImages = async () => {
    try {
      setLoading(true);
        const response = await api.get('/gallery/items');
      
      const data = response.data;
      
      if (data.success && data.data) {
        setImages(data.data);
        console.log('✅ Gallery: Loaded', data.data.length, 'images');
      } else {
        console.error('❌ Gallery: Failed to load images', data);
        toast.error('Failed to load gallery images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 Gallery Page: Component mounted, fetching images...');
    console.log('✅ Gallery useEffect is working! Client-side JavaScript is executing.');
    fetchImages();
  }, []);

  const handleAddMedia = () => {
    setEditingImage(null);
    setShowUploadModal(true);
  };

  const handleEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setShowUploadModal(true);
  };

  const handleDeleteImage = async (image: GalleryImage) => {
    if (confirm(`Are you sure you want to delete "${image.title || 'this image'}"?`)) {
      try {
        await api.delete(`/gallery/items/${image.id}`);
        toast.success('Image deleted successfully');
        fetchImages();
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  const handleToggleStatus = async (image: GalleryImage) => {
    try {
      await api.patch(`/gallery/items/${image.id}/toggle-status`);
      toast.success(`Image ${image.isActive ? 'deactivated' : 'activated'}`);
      fetchImages();
    } catch (error) {
      toast.error('Failed to update image status');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gallery Management</h1>
          <p className="text-gray-600">Manage your image and video gallery</p>
        </div>
        <Button 
          onClick={handleAddMedia}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Media
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gallery...</p>
          </div>
        </div>
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No media found</h3>
              <p className="text-gray-600 mb-4">Get started by uploading your first image or video.</p>
              <Button 
                onClick={handleAddMedia}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Upload Media
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {image.mimeType?.startsWith('video/') ? (
                  <video 
                    src={image.imageUrl} 
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img 
                    src={image.imageUrl} 
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm truncate">
                    {image.title || 'Untitled'}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleStatus(image)}
                      title={image.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {image.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditImage(image)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteImage(image)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {image.caption && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {image.caption}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{image.mimeType}</span>
                  <span>{image.size ? `${Math.round(image.size / 1024)}KB` : 'Unknown size'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingImage ? 'Edit Image' : 'Upload New Image'}
            </h2>
            <p className="text-gray-600 mb-4">
              {editingImage ? 'Edit image details' : 'Upload a new image to your gallery'}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowUploadModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.info('Upload functionality coming soon!');
                  setShowUploadModal(false);
                }}
                className="flex-1"
              >
                {editingImage ? 'Save Changes' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}