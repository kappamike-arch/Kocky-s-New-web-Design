'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Upload,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  X,
  Image as ImageIcon,
  Check,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
const Cookies = require('js-cookie');
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GalleryImage {
  id: string;
  title: string | null;
  caption: string | null;
  url: string;
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

// Sortable Image Item Component
function SortableImageItem({ image, onEdit, onToggle, onDelete }: { 
  image: GalleryImage; 
  onEdit: (image: GalleryImage) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 ${
        isDragging ? 'shadow-2xl scale-105 z-50' : 'hover:shadow-xl'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 p-2 bg-black/70 rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>

      {/* Active Status Badge */}
      <div className="absolute top-2 right-2 z-20">
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            image.isActive
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {image.isActive ? 'Active' : 'Hidden'}
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square bg-gray-900">
        <img
          src={`https://staging.kockys.com${image.thumbnailUrl || image.imageUrl}`}
          alt={image.title || 'Gallery image'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {image.title && (
            <h3 className="text-white font-medium truncate">{image.title}</h3>
          )}
          {image.caption && (
            <p className="text-gray-300 text-sm truncate">{image.caption}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(image)}
              className="h-8"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onToggle(image.id, !image.isActive)}
              className="h-8"
            >
              {image.isActive ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(image.id)}
              className="h-8"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch images
  const fetchImages = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token') || Cookies.get('auth-token');
      const response = await fetch('https://staging.kockys.com/api/gallery/items', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setImages(data.data);
        console.log('✅ Admin Gallery: Loaded', data.data.length, 'images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadFiles(files);
      
      // Generate previews
      const previews: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push(e.target.result as string);
            if (previews.length === files.length) {
              setUploadPreviews(previews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Upload images
  const handleUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    Array.from(uploadFiles).forEach(file => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('auth-token') || Cookies.get('auth-token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      const response = await fetch('https://staging.kockys.com/api/gallery/bulk-upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchImages();
        setUploadDialogOpen(false);
        setUploadFiles(null);
        setUploadPreviews([]);
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  // Update image
  const handleUpdateImage = async () => {
    if (!editingImage) return;

    try {
      const token = localStorage.getItem('auth-token') || Cookies.get('auth-token');
      const response = await fetch(`https://staging.kockys.com/api/gallery/items/${editingImage.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          title: editingImage.title,
          caption: editingImage.caption,
          isActive: editingImage.isActive,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Image updated successfully');
        fetchImages();
        setEditingImage(null);
      } else {
        toast.error('Failed to update image');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    }
  };

  // Toggle image active status
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('auth-token') || Cookies.get('auth-token');
      const response = await fetch(`https://staging.kockys.com/api/gallery/items/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(isActive ? 'Image activated' : 'Image hidden');
        fetchImages();
      } else {
        toast.error('Failed to update image status');
      }
    } catch (error) {
      console.error('Error toggling image:', error);
      toast.error('Failed to update image status');
    }
  };

  // Delete image
  const handleDeleteImage = async () => {
    if (!deleteImageId) return;

    try {
      const response = await fetch(`https://staging.kockys.com/api/gallery/items/${deleteImageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Image deleted successfully');
        fetchImages();
        setDeleteImageId(null);
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) {
      toast.error('No images selected');
      return;
    }

    try {
      const response = await fetch('https://staging.kockys.com/api/gallery/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedImages }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchImages();
        setSelectedImages([]);
      } else {
        toast.error('Failed to delete images');
      }
    } catch (error) {
      console.error('Error deleting images:', error);
      toast.error('Failed to delete images');
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.id === active.id);
      const newIndex = images.findIndex(img => img.id === over.id);
      
      const newImages = arrayMove(images, oldIndex, newIndex);
      
      // Update order values
      const reorderedImages = newImages.map((img, index) => ({
        ...img,
        order: index
      }));
      
      setImages(reorderedImages);

      // Save new order to backend
      try {
        const response = await fetch('https://staging.kockys.com/api/gallery/items/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: reorderedImages.map((img, index) => ({
              id: img.id,
              order: index
            }))
          }),
        });

        const data = await response.json();
        
        if (!data.success) {
          toast.error('Failed to save new order');
          fetchImages(); // Revert to server state
        }
      } catch (error) {
        console.error('Error reordering images:', error);
        toast.error('Failed to save new order');
        fetchImages(); // Revert to server state
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Gallery Management</h1>
        <p className="text-gray-400">Upload and manage your photo gallery</p>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6 bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setUploadDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
              
              {selectedImages.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedImages.length})
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-400">
              {images.length} total images • {images.filter(img => img.isActive).length} active
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : images.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-20 text-center">
            <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No images yet</h3>
            <p className="text-gray-500 mb-4">Upload your first gallery images to get started</p>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map(img => img.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image) => (
                <SortableImageItem
                  key={image.id}
                  image={image}
                  onEdit={setEditingImage}
                  onToggle={handleToggleActive}
                  onDelete={setDeleteImageId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-3xl bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Upload Gallery Images</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="images" className="text-gray-300">Select Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can select multiple images at once. Max 20 images, 10MB each.
              </p>
            </div>

            {uploadPreviews.length > 0 && (
              <div>
                <Label className="text-gray-300 mb-2 block">Preview</Label>
                <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                  {uploadPreviews.map((preview, index) => (
                    <div key={index} className="aspect-square bg-gray-800 rounded overflow-hidden">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {uploadFiles?.length} image(s) selected
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setUploadDialogOpen(false);
                setUploadFiles(null);
                setUploadPreviews([]);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadFiles || uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingImage} onOpenChange={(open) => !open && setEditingImage(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Edit Image</DialogTitle>
          </DialogHeader>

          {editingImage && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-800 rounded overflow-hidden relative group">
                <img
                  src={`https://staging.kockys.com${editingImage.imageUrl}`}
                  alt={editingImage.title || 'Gallery image'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Image failed to load:', editingImage.imageUrl);
                    e.currentTarget.src = '/api/placeholder/400/300';
                  }}
                />
                {/* Replace Image Button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Replace Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && editingImage) {
                          try {
                            const token = localStorage.getItem('auth-token') || Cookies.get('auth-token');
                            const formData = new FormData();
                            formData.append('image', file);
                            
                            const response = await fetch(`https://staging.kockys.com/api/gallery/items/${editingImage.id}`, {
                              method: 'PUT',
                              body: formData,
                              headers: {
                                'Authorization': `Bearer ${token}`
                              },
                              credentials: 'include'
                            });
                            
                            const data = await response.json();
                            if (data.success) {
                              toast.success('Image replaced successfully!');
                              setEditingImage({...editingImage, imageUrl: data.data.imageUrl});
                              fetchImages(); // Refresh the gallery
                            } else {
                              toast.error('Failed to replace image');
                            }
                          } catch (error) {
                            console.error('Error replacing image:', error);
                            toast.error('Failed to replace image');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="title" className="text-white font-medium">Title</Label>
                <Input
                  id="title"
                  value={editingImage.title || ''}
                  onChange={(e) => setEditingImage({
                    ...editingImage,
                    title: e.target.value
                  })}
                  placeholder="Enter image title"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="caption" className="text-white font-medium">Caption</Label>
                <Textarea
                  id="caption"
                  value={editingImage.caption || ''}
                  onChange={(e) => setEditingImage({
                    ...editingImage,
                    caption: e.target.value
                  })}
                  placeholder="Enter image caption (optional)"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingImage.isActive}
                  onCheckedChange={(checked) => setEditingImage({
                    ...editingImage,
                    isActive: checked
                  })}
                />
                <Label htmlFor="active" className="text-white font-medium">
                  Show on website
                </Label>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setEditingImage(null)}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateImage}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteImageId} onOpenChange={(open) => !open && setDeleteImageId(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Delete Image?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. The image will be permanently deleted from the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteImage}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}





