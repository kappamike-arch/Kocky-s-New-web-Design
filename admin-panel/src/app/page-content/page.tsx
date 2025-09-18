'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  FileText,
  Edit,
  Trash2,
  Upload,
  Image,
  Video,
  Globe,
  Eye,
  EyeOff,
  Save,
  X,
  Plus,
  Settings,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface PageContent {
  id: string;
  slug: string;
  title: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroVideo?: string;
  heroLogo?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  customCss?: string;
  customJs?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PageContentManagement() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<PageContent>>({});
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'logo' | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await api.get('/page-content');
      setPages(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: PageContent) => {
    setEditingPage(page);
    setFormData(page);
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingPage) {
        await api.put(`/page-content/${editingPage.id}`, formData);
        toast.success('Page updated successfully');
      } else {
        await api.post('/page-content', formData);
        toast.success('Page created successfully');
      }
      setShowEditDialog(false);
      fetchPages();
    } catch (error) {
      toast.error('Failed to save page');
    }
  };

  const handleToggleStatus = async (page: PageContent) => {
    try {
      await api.patch(`/page-content/${page.id}/toggle-status`);
      toast.success(`Page ${page.isActive ? 'deactivated' : 'activated'}`);
      fetchPages();
    } catch (error) {
      toast.error('Failed to toggle page status');
    }
  };

  const handleFileUpload = async (pageId: string, file: File, type: 'image' | 'video' | 'logo') => {
    const formData = new FormData();
    const fieldName = type === 'image' ? 'heroImage' : type === 'video' ? 'heroVideo' : 'heroLogo';
    formData.append(fieldName, file);

    try {
      await api.post(`/page-content/${pageId}/upload-hero-${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Hero ${type} uploaded successfully`);
      fetchPages();
    } catch (error) {
      toast.error(`Failed to upload hero ${type}`);
    }
  };

  const navigationTabs = [
    { slug: 'home', name: 'Home', description: 'Main landing page' },
    { slug: 'menu', name: 'Menu', description: 'Restaurant menu page' },
    { slug: 'happy-hour', name: 'Happy Hour', description: 'Happy hour specials' },
    { slug: 'brunch', name: 'Brunch', description: 'Weekend brunch menu' },
    { slug: 'gallery', name: 'Gallery', description: 'Photo gallery' },
    { slug: 'reservations', name: 'Reservations', description: 'Table reservations' },
    { slug: 'food-truck', name: 'Food Truck', description: 'Mobile food service' },
    { slug: 'mobile-bar', name: 'Mobile Bar', description: 'Mobile bar service' },
    { slug: 'catering', name: 'Catering', description: 'Catering services' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Page Content Management</h1>
        <p className="text-muted-foreground">
          Manage content for all navigation tabs and pages
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Pages</CardTitle>
          <CardDescription>
            Edit content, images, and settings for each navigation tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading pages...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Hero Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {navigationTabs.map(tab => {
                  const page = pages.find(p => p.slug === tab.slug);
                  return (
                    <TableRow key={tab.slug}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tab.name}</div>
                          <div className="text-sm text-muted-foreground">{tab.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{page?.heroTitle || 'Not set'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {page?.heroImage && (
                            <span className="text-green-600" title="Has hero image">
                              <Image className="h-4 w-4" />
                            </span>
                          )}
                          {page?.heroVideo && (
                            <span className="text-blue-600" title="Has hero video">
                              <Video className="h-4 w-4" />
                            </span>
                          )}
                          {page?.heroLogo && (
                            <span className="text-purple-600" title="Has hero logo">
                              <Globe className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {page ? (
                          <Button
                            variant={page.isActive ? "default" : "secondary"}
                            size="sm"
                            onClick={() => handleToggleStatus(page)}
                          >
                            {page.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">Not created</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {page ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(page)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <input
                                type="file"
                                id={`image-${page.id}`}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleFileUpload(page.id, e.target.files[0], 'image');
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`image-${page.id}`)?.click()}
                                title="Upload hero image"
                              >
                                <Image className="h-4 w-4" />
                              </Button>
                              <input
                                type="file"
                                id={`video-${page.id}`}
                                className="hidden"
                                accept="video/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleFileUpload(page.id, e.target.files[0], 'video');
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`video-${page.id}`)?.click()}
                                title="Upload hero video"
                              >
                                <Video className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingPage(null);
                                setFormData({
                                  slug: tab.slug,
                                  title: tab.name,
                                  isActive: true
                                });
                                setShowEditDialog(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Create
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Edit Page Content' : 'Create Page Content'}
            </DialogTitle>
            <DialogDescription>
              Configure the content and settings for this page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="slug">Page Slug</Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                disabled={!!editingPage}
                placeholder="page-slug"
              />
            </div>

            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Page Title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={formData.heroTitle || ''}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  placeholder="Welcome to Our Restaurant"
                />
              </div>

              <div>
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  value={formData.heroSubtitle || ''}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  placeholder="Experience fine dining at its best"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Page Content (HTML)</Label>
              <Textarea
                id="content"
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter page content (HTML supported)"
                rows={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle || ''}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="Page title for search engines"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
                <Input
                  id="metaDescription"
                  value={formData.metaDescription || ''}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Page description for search engines"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customCss">Custom CSS (Optional)</Label>
              <Textarea
                id="customCss"
                value={formData.customCss || ''}
                onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
                placeholder="/* Custom CSS for this page */"
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="customJs">Custom JavaScript (Optional)</Label>
              <Textarea
                id="customJs"
                value={formData.customJs || ''}
                onChange={(e) => setFormData({ ...formData, customJs: e.target.value })}
                placeholder="// Custom JavaScript for this page"
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive || false}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Page is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
