'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toNumber, formatPrice, parseMenuItems, parseJsonArray } from '@/lib/utils/prisma-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus, Edit, Trash2, Upload, Image as ImageIcon, Star, DollarSign,
  Clock, Eye, EyeOff, Save, X, Coffee, Wine, Utensils, Menu,
  ArrowUp, ArrowDown, Copy, Filter, Search
} from 'lucide-react';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/config/server';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  menuType: 'REGULAR' | 'HAPPY_HOUR' | 'BRUNCH' | 'SPECIALS';
  sectionId?: string;
  section?: MenuSection;
  price: number;
  happyHourPrice?: number;
  image?: string;
  servingSize?: string;
  preparationTime?: number;
  available: boolean;
  featured: boolean;
  sortOrder: number;
  tags: string[];
  allergens: string[];
}

interface MenuSection {
  id: string;
  name: string;
  description?: string;
  menuType: 'REGULAR' | 'HAPPY_HOUR' | 'BRUNCH' | 'SPECIALS';
  displayMode?: 'FULL_DETAILS' | 'TITLE_ONLY';
  sortOrder: number;
  isActive: boolean;
}

export default function MenuManagementPage() {
  const [menuType, setMenuType] = useState<'REGULAR' | 'HAPPY_HOUR' | 'BRUNCH' | 'SPECIALS'>('REGULAR');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogImageInputRef = useRef<HTMLInputElement>(null);

  const [itemForm, setItemForm] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    category: 'APPETIZER',
    menuType: 'REGULAR',
    price: 0,
    happyHourPrice: undefined,
    servingSize: '',
    preparationTime: 15,
    available: true,
    featured: false,
    sortOrder: 0,
    tags: [],
    allergens: []
  });

  const [sectionForm, setSectionForm] = useState<Partial<MenuSection>>({
    name: '',
    description: '',
    menuType: 'REGULAR',
    displayMode: 'FULL_DETAILS',
    sortOrder: 0,
    isActive: true
  });

  const categories = [
    'APPETIZER', 'ENTREE', 'DESSERT', 'DRINK',
    'BEER', 'WINE', 'COCKTAIL', 'NON_ALCOHOLIC', 'SPECIAL'
  ];

  const menuTypeConfig = {
    REGULAR: { label: 'Regular Menu', icon: Utensils, color: 'blue' },
    HAPPY_HOUR: { label: 'Happy Hour', icon: Wine, color: 'purple' },
    BRUNCH: { label: 'Brunch', icon: Coffee, color: 'orange' },
    SPECIALS: { label: 'Specials', icon: Star, color: 'green' }
  };

  useEffect(() => {
    fetchData();
  }, [menuType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, sectionsRes] = await Promise.all([
        api.get('/enhanced-menu/items', { params: { menuType } }),
        api.get('/enhanced-menu/sections', { params: { menuType } })
      ]);
      // Parse menu items to convert Prisma Decimal fields to numbers
      const parsedItems = parseMenuItems(itemsRes.data.data || []);
      setItems(parsedItems);
      setSections(sectionsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      category: 'APPETIZER',
      menuType,
      sectionId: sections[0]?.id,
      price: 0,
      happyHourPrice: undefined,
      servingSize: '',
      preparationTime: 15,
      available: true,
      featured: false,
      sortOrder: items.length,
      tags: [],
      allergens: []
    });
    setImagePreview(null);
    setSelectedImageFile(null);
    setShowItemDialog(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      ...item,
      price: toNumber(item.price),
      happyHourPrice: item.happyHourPrice ? toNumber(item.happyHourPrice) : undefined,
      tags: parseJsonArray(item.tags),
      allergens: parseJsonArray(item.allergens)
    });
    // Validate image URL before setting preview
    if (item.image && item.image.trim() && !item.image.endsWith('-') && item.image.length > 5) {
      const imageUrl = getImageUrl(item.image);
      console.log('Setting image preview for item:', item.name, 'URL:', imageUrl);
      setImagePreview(imageUrl);
    } else {
      console.log('Invalid or missing image for item:', item.name, 'Image value:', item.image);
      setImagePreview(null);
    }
    setSelectedImageFile(null);
    setShowItemDialog(true);
  };

  const handleSaveItem = async () => {
    try {
      // Log the form values for debugging
      console.log('Saving item with form data:', itemForm);
      console.log('Category:', itemForm.category);
      console.log('SectionId:', itemForm.sectionId);
      
      // Validate required fields
      if (!itemForm.name || !itemForm.price || !itemForm.category) {
        toast.error('Please fill in all required fields (Name, Price, Category)');
        return;
      }
      
      let savedItem;
      if (editingItem) {
        const response = await api.put(`/enhanced-menu/items/${editingItem.id}`, itemForm);
        savedItem = response.data.data || response.data;
        toast.success('Menu item updated');
      } else {
        // Remove id field when creating a new item
        const { id, ...createData } = itemForm;
        console.log('Creating item with data:', createData);
        const response = await api.post('/enhanced-menu/items', createData);
        savedItem = response.data.data || response.data;
        toast.success('Menu item created');
      }
      
      // Upload image if a new file was selected
      if (selectedImageFile && savedItem?.id) {
        const formData = new FormData();
        formData.append('image', selectedImageFile);
        try {
          await api.post(`/enhanced-menu/items/${savedItem.id}/upload-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success('Image uploaded successfully');
        } catch (uploadError) {
          toast.error('Failed to upload image');
        }
      }
      
      setShowItemDialog(false);
      setImagePreview(null);
      setSelectedImageFile(null);
      fetchData();
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save menu item';
      toast.error(errorMessage);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    const confirmMessage = `Are you sure you want to delete "${item?.name || 'this item'}"?\n\nThis action cannot be undone.`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      await api.delete(`/enhanced-menu/items/${id}`);
      toast.success(`"${item?.name}" has been deleted`);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await api.patch(`/enhanced-menu/items/${item.id}/toggle-availability`);
      toast.success(`Item ${item.available ? 'made unavailable' : 'made available'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to toggle availability');
    }
  };

  const handleToggleFeatured = async (item: MenuItem) => {
    try {
      await api.patch(`/enhanced-menu/items/${item.id}/toggle-featured`);
      toast.success(`Item ${item.featured ? 'unfeatured' : 'featured'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to toggle featured status');
    }
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      await api.post(`/enhanced-menu/items/${itemId}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Image uploaded successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleDialogImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, WebP, or GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    if (dialogImageInputRef.current) {
      dialogImageInputRef.current.value = '';
    }
  };

  const handleDuplicateItem = (item: MenuItem) => {
    setEditingItem(null);
    setItemForm({
      ...item,
      name: `${item.name} (Copy)`,
      id: undefined,
      price: toNumber(item.price),
      happyHourPrice: item.happyHourPrice ? toNumber(item.happyHourPrice) : undefined,
      tags: parseJsonArray(item.tags),
      allergens: parseJsonArray(item.allergens)
    });
    // Validate image URL before setting preview
    if (item.image && item.image.trim() && !item.image.endsWith('-') && item.image.length > 5) {
      const imageUrl = getImageUrl(item.image);
      console.log('Setting image preview for item:', item.name, 'URL:', imageUrl);
      setImagePreview(imageUrl);
    } else {
      console.log('Invalid or missing image for item:', item.name, 'Image value:', item.image);
      setImagePreview(null);
    }
    setSelectedImageFile(null);
    setShowItemDialog(true);
  };

  const handleReorderItems = async (items: { id: string; sortOrder: number }[]) => {
    try {
      await api.put('/enhanced-menu/items/reorder', { items });
      toast.success('Menu order updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = selectedSection === 'all' || item.sectionId === selectedSection;
    return matchesSearch && matchesSection;
  });

  const groupedItems = sections.map(section => ({
    section,
    items: filteredItems.filter(item => item.sectionId === section.id)
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
        <p className="text-muted-foreground">
          Manage menu items for regular menu, happy hour, and brunch
        </p>
      </div>

      {/* Menu Type Tabs */}
      <Tabs value={menuType} onValueChange={(v) => setMenuType(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(menuTypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {config.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={menuType} className="mt-6">
          {/* Toolbar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center gap-4">
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections.map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSectionDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                  <Button onClick={handleCreateItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items by Section */}
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                Loading menu items...
              </CardContent>
            </Card>
          ) : groupedItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No sections yet</p>
                <Button onClick={() => setShowSectionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Section
                </Button>
              </CardContent>
            </Card>
          ) : (
            groupedItems.map(({ section, items }) => (
              <Card key={section.id} className="mb-4">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{section.name}</CardTitle>
                      {section.description && (
                        <CardDescription>{section.description}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSection(section);
                        setSectionForm(section);
                        setShowSectionDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No items in this section
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Price</TableHead>
                          {menuType === 'HAPPY_HOUR' && <TableHead>Happy Hour Price</TableHead>}
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.image ? (
                                <img
                                  src={getImageUrl(item.image)}
                                  alt={item.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {item.name}
                                  {item.featured && <Star className="h-4 w-4 text-yellow-500" />}
                                </div>
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {item.description}
                                </div>
                                {item.servingSize && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Serving: {item.servingSize}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{formatPrice(item.price)}</TableCell>
                            {menuType === 'HAPPY_HOUR' && (
                              <TableCell>
                                {item.happyHourPrice ? (
                                  <span className="text-green-600">
                                    {formatPrice(item.happyHourPrice)}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            )}
                            <TableCell>
                              <span className="text-xs px-2 py-1 rounded bg-muted">
                                {item.category}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant={item.available ? "default" : "secondary"}
                                  size="sm"
                                  onClick={() => handleToggleAvailability(item)}
                                >
                                  {item.available ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                </Button>
                                <Button
                                  variant={item.featured ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleToggleFeatured(item)}
                                >
                                  <Star className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <input
                                  type="file"
                                  id={`image-${item.id}`}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleImageUpload(item.id, e.target.files[0]);
                                    }
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById(`image-${item.id}`)?.click()}
                                  title="Upload image"
                                >
                                  <Upload className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditItem(item)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDuplicateItem(item)}
                                  title="Duplicate"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={(open) => {
        setShowItemDialog(open);
        if (!open) {
          setImagePreview(null);
          setSelectedImageFile(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the menu item
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Upload Section */}
            <div className="border rounded-lg p-4 space-y-3">
              <Label>Item Image</Label>
              <div className="flex gap-4">
                {imagePreview && (
                  <div className="relative w-24 h-24">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded border"
                      onError={(e) => {
                        console.error('Image preview failed to load:', imagePreview);
                        // Hide the broken image
                        setImagePreview(null);
                        toast.error('Failed to load image preview');
                      }}
                      onLoad={() => {
                        console.log('Image preview loaded successfully:', imagePreview);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -bottom-1 -right-1 h-5 w-5 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white z-10"
                      onClick={handleRemoveImage}
                      title="Remove Image"
                      aria-label="Remove uploaded image"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={dialogImageInputRef}
                    type="file"
                    id="dialog-image"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleDialogImageSelect}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => dialogImageInputRef.current?.click()}
                    className="w-full"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: JPG, PNG, WebP, GIF (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Grilled Chicken Sandwich"
                />
              </div>

              <div>
                <Label htmlFor="category">Category * (Current: {itemForm.category || 'None'})</Label>
                <Select
                  value={itemForm.category || ''}
                  onValueChange={(v) => {
                    console.log('Category changed to:', v);
                    setItemForm(prev => ({ ...prev, category: v }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Juicy grilled chicken breast with lettuce, tomato..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section">Section (Current: {sections.find(s => s.id === itemForm.sectionId)?.name || 'None'})</Label>
                <Select
                  value={itemForm.sectionId || ''}
                  onValueChange={(v) => {
                    console.log('Section changed to:', v);
                    setItemForm(prev => ({ ...prev, sectionId: v }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(section => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="servingSize">Serving Size</Label>
                <Input
                  id="servingSize"
                  value={itemForm.servingSize}
                  onChange={(e) => setItemForm({ ...itemForm, servingSize: e.target.value })}
                  placeholder="8 oz"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) })}
                />
              </div>

              {menuType === 'HAPPY_HOUR' && (
                <div>
                  <Label htmlFor="happyHourPrice">Happy Hour Price</Label>
                  <Input
                    id="happyHourPrice"
                    type="number"
                    step="0.01"
                    value={itemForm.happyHourPrice || ''}
                    onChange={(e) => setItemForm({ ...itemForm, happyHourPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="preparationTime">Prep Time (min)</Label>
                <Input
                  id="preparationTime"
                  type="number"
                  value={itemForm.preparationTime}
                  onChange={(e) => setItemForm({ ...itemForm, preparationTime: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={Array.isArray(itemForm.tags) ? itemForm.tags.join(', ') : ''}
                onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="spicy, vegetarian, gluten-free"
              />
            </div>

            <div>
              <Label htmlFor="allergens">Allergens (comma separated)</Label>
              <Input
                id="allergens"
                value={Array.isArray(itemForm.allergens) ? itemForm.allergens.join(', ') : ''}
                onChange={(e) => setItemForm({ ...itemForm, allergens: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="nuts, dairy, gluten"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={itemForm.available}
                  onCheckedChange={(checked) => setItemForm({ ...itemForm, available: checked })}
                />
                <Label htmlFor="available">Available</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={itemForm.featured}
                  onCheckedChange={(checked) => setItemForm({ ...itemForm, featured: checked })}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              <Save className="h-4 w-4 mr-2" />
              Save Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'Edit Section' : 'Add Section'}
            </DialogTitle>
            <DialogDescription>
              Create sections to organize your menu items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="sectionName">Section Name *</Label>
              <Input
                id="sectionName"
                value={sectionForm.name}
                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                placeholder="Appetizers"
              />
            </div>

            <div>
              <Label htmlFor="sectionDescription">Description</Label>
              <Textarea
                id="sectionDescription"
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                placeholder="Start your meal with our delicious appetizers"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="displayMode">Display Mode</Label>
              <Select
                value={sectionForm.displayMode || 'FULL_DETAILS'}
                onValueChange={(v) => setSectionForm({ ...sectionForm, displayMode: v as 'FULL_DETAILS' | 'TITLE_ONLY' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select display mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_DETAILS">
                    Show Details (title, description, price, image)
                  </SelectItem>
                  <SelectItem value="TITLE_ONLY">
                    Title Only (just the item name)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose how menu items in this section appear on the frontend
              </p>
            </div>

            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sectionForm.sortOrder}
                onChange={(e) => setSectionForm({ ...sectionForm, sortOrder: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="sectionActive"
                checked={sectionForm.isActive}
                onCheckedChange={(checked) => setSectionForm({ ...sectionForm, isActive: checked })}
              />
              <Label htmlFor="sectionActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  const formToSend = { ...sectionForm, menuType };
                  if (editingSection) {
                    await api.put(`/enhanced-menu/sections/${editingSection.id}`, formToSend);
                    toast.success('Section updated');
                  } else {
                    await api.post('/enhanced-menu/sections', formToSend);
                    toast.success('Section created');
                  }
                  setShowSectionDialog(false);
                  fetchData();
                } catch (error) {
                  toast.error('Failed to save section');
                }
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
