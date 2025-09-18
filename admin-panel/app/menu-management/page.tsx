'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toNumber, formatPrice, parseMenuItems, parseJsonArray } from '@/lib/utils/prisma-helpers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DropdownSelect } from '@/components/ui/dropdown-select';
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
  ArrowUp, ArrowDown, Copy, Filter, Search, AlertCircle, CheckCircle2
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

interface ValidationErrors {
  name?: string;
  price?: string;
  category?: string;
  sectionId?: string;
  description?: string;
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
    { value: 'APPETIZER', label: 'Appetizer' },
    { value: 'ENTREE', label: 'Entrée' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'DRINK', label: 'Drink' },
    { value: 'BEER', label: 'Beer' },
    { value: 'WINE', label: 'Wine' },
    { value: 'COCKTAIL', label: 'Cocktail' },
    { value: 'NON_ALCOHOLIC', label: 'Non-Alcoholic' },
    { value: 'SPECIAL', label: 'Special' }
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

  // Get unique sections only (filter duplicates)
  const getUniqueSections = () => {
    const uniqueSections = sections.filter((section, index, self) =>
      index === self.findIndex((s) => s.name === section.name && s.isActive)
    );
    return uniqueSections.map(section => ({
      value: section.id,
      label: section.name
    }));
  };

  // Validation function
  const validateField = (fieldName: string, value: any): string | undefined => {
    switch (fieldName) {
      case 'name':
        if (!value || value.trim() === '') {
          return 'Item name is required';
        }
        if (value.trim().length < 2) {
          return 'Item name must be at least 2 characters';
        }
        break;
      case 'price':
        if (value === undefined || value === null || value === '') {
          return 'Price is required';
        }
        if (parseFloat(value) < 0) {
          return 'Price cannot be negative';
        }
        break;
      case 'category':
        if (!value) {
          return 'Category is required';
        }
        break;
      case 'description':
        if (!value || value.trim() === '') {
          return 'Description is recommended for better customer experience';
        }
        break;
    }
    return undefined;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setItemForm(prev => ({ ...prev, [fieldName]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate field
    const error = validateField(fieldName, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, itemForm[fieldName as keyof MenuItem]);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    errors.name = validateField('name', itemForm.name);
    errors.price = validateField('price', itemForm.price);
    errors.category = validateField('category', itemForm.category);
    
    setValidationErrors(errors);
    setTouched({
      name: true,
      price: true,
      category: true
    });
    
    return !Object.values(errors).some(error => error && !error.includes('recommended'));
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
    setValidationErrors({});
    setTouched({});
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
    setValidationErrors({});
    setTouched({});
    setShowItemDialog(true);
  };

  const handleSaveItem = async () => {
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      // Log the form values for debugging
      console.log('Saving item with form data:', itemForm);
      
      // Prepare clean data for save
      const saveData = {
        name: itemForm.name,
        description: itemForm.description || '',
        category: itemForm.category,
        menuType: itemForm.menuType || menuType,
        sectionId: itemForm.sectionId,
        price: parseFloat(itemForm.price.toString()),
        happyHourPrice: itemForm.happyHourPrice ? parseFloat(itemForm.happyHourPrice.toString()) : null,
        servingSize: itemForm.servingSize || '',
        preparationTime: itemForm.preparationTime ? parseInt(itemForm.preparationTime.toString()) : null,
        available: itemForm.available !== false,
        featured: itemForm.featured === true,
        sortOrder: itemForm.sortOrder || 0,
        tags: itemForm.tags || [],
        allergens: itemForm.allergens || [],
        // Don't send the existing image URL or other fields we shouldn't update
        ...(itemForm.image && !itemForm.image.includes('&#x2F;') ? { image: itemForm.image } : {})
      };
      
      let savedItem;
      if (editingItem) {
        console.log('Updating item:', editingItem.id, 'with data:', saveData);
        const response = await api.put(`/enhanced-menu/items/${editingItem.id}`, saveData);
        savedItem = response.data.data || response.data;
        toast.success('✅ Menu item updated successfully!', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: 'white',
            fontWeight: 'bold',
          },
        });
      } else {
        console.log('Creating item with data:', saveData);
        const response = await api.post('/enhanced-menu/items', saveData);
        savedItem = response.data.data || response.data;
        toast.success('✅ Menu item created successfully!', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: 'white',
            fontWeight: 'bold',
          },
        });
      }
      
      // Upload image if a new file was selected
      if (selectedImageFile && savedItem?.id) {
        const formData = new FormData();
        formData.append('image', selectedImageFile);
        try {
          const uploadResponse = await api.post(`/enhanced-menu/items/${savedItem.id}/upload-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadResponse.data.success) {
            toast.success('🖼️ Image uploaded successfully!', {
              duration: 2000,
              position: 'top-center',
            });
          }
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          toast.error(`Failed to upload image: ${uploadError.response?.data?.message || uploadError.message}`, {
            duration: 4000,
            position: 'top-center',
          });
        }
      }
      
      setShowItemDialog(false);
      setImagePreview(null);
      setSelectedImageFile(null);
      setValidationErrors({});
      setTouched({});
      fetchData();
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save menu item';
      toast.error(`❌ ${errorMessage}`, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: 'white',
        },
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    const confirmMessage = `Are you sure you want to delete "${item?.name || 'this item'}"?\n\nThis action cannot be undone.`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      await api.delete(`/enhanced-menu/items/${id}`);
      toast.success(`"${item?.name}" has been deleted`, {
        duration: 3000,
        position: 'top-center',
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to delete menu item', {
        duration: 3000,
        position: 'top-center',
      });
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
    setValidationErrors({});
    setTouched({});
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
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
          {Object.entries(menuTypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger 
                key={key} 
                value={key} 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-orange-600"
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{config.label}</span>
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
                  <Button 
                    onClick={handleCreateItem}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
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
                      <div className="flex items-center gap-2">
                        <CardTitle>{section.name}</CardTitle>
                        <Badge variant={section.displayMode === 'TITLE_ONLY' ? 'secondary' : 'default'}>
                          {section.displayMode === 'TITLE_ONLY' ? 'Title Only' : 'Full Details'}
                        </Badge>
                      </div>
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
                                  className={item.available ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'}
                                >
                                  {item.available ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                </Button>
                                <Button
                                  variant={item.featured ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleToggleFeatured(item)}
                                  className={item.featured ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
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
          setValidationErrors({});
          setTouched({});
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Fill in the details for the menu item. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Image Upload Section */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
              <Label className="text-gray-900 dark:text-gray-100 font-medium">Item Image</Label>
              <div className="flex gap-4 items-start">
                {imagePreview ? (
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded border border-gray-600"
                      onError={(e) => {
                        console.error('Image preview failed to load:', imagePreview);
                        console.error('Error details:', e);
                        // Hide the broken image
                        setImagePreview(null);
                        toast.error(`Failed to load image preview: ${imagePreview ? imagePreview.split('/').pop() : 'unknown'}`);
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
                ) : (
                  <div className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
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
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    <span>{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                  </Button>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Accepted formats: JPG, PNG, WebP, GIF (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900 dark:text-gray-100 font-medium">
                  Item Name *
                </Label>
                <Input
                  id="name"
                  value={itemForm.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  placeholder="e.g., Crispy Chicken Wings"
                  className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    touched.name && validationErrors.name ? 'border-red-500' : ''
                  }`}
                />
                {touched.name && validationErrors.name && (
                  <p className="text-red-500 dark:text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <DropdownSelect
                  label="Category *"
                  options={categories}
                  value={itemForm.category}
                  onValueChange={(value) => handleFieldChange('category', value)}
                  placeholder="Select a category..."
                  className={touched.category && validationErrors.category ? 'border-red-500' : ''}
                />
                {touched.category && validationErrors.category && (
                  <p className="text-red-500 dark:text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.category}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900 dark:text-gray-100 font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={itemForm.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onBlur={() => handleFieldBlur('description')}
                placeholder="e.g., Juicy grilled chicken breast served with lettuce, tomato, and our special sauce"
                rows={3}
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                  touched.description && validationErrors.description ? 'border-yellow-500' : ''
                }`}
              />
              {touched.description && validationErrors.description && (
                <p className="text-yellow-600 dark:text-yellow-400 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <DropdownSelect
                  label="Section"
                  options={getUniqueSections()}
                  value={itemForm.sectionId}
                  onValueChange={(value) => handleFieldChange('sectionId', value)}
                  placeholder="Select a section..."
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Organize your menu items by section
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servingSize" className="text-gray-900 dark:text-gray-100 font-medium">
                  Serving Size
                </Label>
                <Input
                  id="servingSize"
                  value={itemForm.servingSize}
                  onChange={(e) => setItemForm({ ...itemForm, servingSize: e.target.value })}
                  placeholder="e.g., 2 pieces, 8 oz, 1 bowl"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Optional: Specify portion size or quantity
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-900 dark:text-gray-100 font-medium">
                  Price *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    onBlur={() => handleFieldBlur('price')}
                    placeholder="0.00"
                    className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-8 ${
                      touched.price && validationErrors.price ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {touched.price && validationErrors.price && (
                  <p className="text-red-500 dark:text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.price}
                  </p>
                )}
              </div>

              {menuType === 'HAPPY_HOUR' && (
                <div className="space-y-2">
                  <Label htmlFor="happyHourPrice" className="text-gray-900 dark:text-gray-100 font-medium">
                    Happy Hour Price
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                    <Input
                      id="happyHourPrice"
                      type="number"
                      step="0.01"
                      value={itemForm.happyHourPrice || ''}
                      onChange={(e) => setItemForm({ ...itemForm, happyHourPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="0.00"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-8"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="preparationTime" className="text-gray-900 dark:text-gray-100 font-medium">
                  Prep Time
                </Label>
                <div className="relative">
                  <Input
                    id="preparationTime"
                    type="number"
                    value={itemForm.preparationTime}
                    onChange={(e) => setItemForm({ ...itemForm, preparationTime: parseInt(e.target.value) })}
                    placeholder="15"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">min</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gray-900 dark:text-gray-100 font-medium">
                Tags
              </Label>
              <Input
                id="tags"
                value={Array.isArray(itemForm.tags) ? itemForm.tags.join(', ') : ''}
                onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="e.g., spicy, vegetarian, gluten-free"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Separate multiple tags with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergens" className="text-gray-900 dark:text-gray-100 font-medium">
                Allergens
              </Label>
              <Input
                id="allergens"
                value={Array.isArray(itemForm.allergens) ? itemForm.allergens.join(', ') : ''}
                onChange={(e) => setItemForm({ ...itemForm, allergens: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="e.g., nuts, dairy, gluten"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                List any allergens present in this item
              </p>
            </div>

            <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Switch
                  id="available"
                  checked={itemForm.available}
                  onCheckedChange={(checked) => setItemForm({ ...itemForm, available: checked })}
                  className="data-[state=checked]:bg-green-600"
                />
                <Label htmlFor="available" className="text-gray-900 dark:text-gray-100 cursor-pointer flex items-center gap-2">
                  {itemForm.available ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Available
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-gray-500" />
                      Unavailable
                    </>
                  )}
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="featured"
                  checked={itemForm.featured}
                  onCheckedChange={(checked) => setItemForm({ ...itemForm, featured: checked })}
                  className="data-[state=checked]:bg-yellow-500"
                />
                <Label htmlFor="featured" className="text-gray-900 dark:text-gray-100 cursor-pointer flex items-center gap-2">
                  {itemForm.featured ? (
                    <>
                      <Star className="h-4 w-4 text-yellow-500" />
                      Featured
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 text-gray-500" />
                      Not Featured
                    </>
                  )}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowItemDialog(false)}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveItem}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 text-base font-semibold"
              size="lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {editingItem ? 'Update Item' : 'Save Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'Edit Section' : 'Add Section'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create sections to organize your menu items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sectionName" className="text-white font-medium">Section Name *</Label>
              <Input
                id="sectionName"
                value={sectionForm.name}
                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                placeholder="e.g., Appetizers, Main Courses, Desserts"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionDescription" className="text-white font-medium">Description</Label>
              <Textarea
                id="sectionDescription"
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                placeholder="e.g., Start your meal with our delicious appetizers"
                rows={2}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayMode" className="text-white font-medium">Display Mode</Label>
              <Select
                value={sectionForm.displayMode || 'FULL_DETAILS'}
                onValueChange={(v) => setSectionForm({ ...sectionForm, displayMode: v as 'FULL_DETAILS' | 'TITLE_ONLY' })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select display mode" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="FULL_DETAILS" className="text-white hover:bg-gray-700">
                    Show Details (title, description, price, image)
                  </SelectItem>
                  <SelectItem value="TITLE_ONLY" className="text-white hover:bg-gray-700">
                    Title Only (just the item name)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Choose how menu items in this section appear on the frontend
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder" className="text-white font-medium">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sectionForm.sortOrder}
                onChange={(e) => setSectionForm({ ...sectionForm, sortOrder: parseInt(e.target.value) })}
                className="bg-gray-800 border-gray-700 text-white focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg">
              <Switch
                id="sectionActive"
                checked={sectionForm.isActive}
                onCheckedChange={(checked) => setSectionForm({ ...sectionForm, isActive: checked })}
                className="data-[state=checked]:bg-green-600"
              />
              <Label htmlFor="sectionActive" className="text-white cursor-pointer">
                {sectionForm.isActive ? 'Active' : 'Inactive'}
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowSectionDialog(false)}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  const formToSend = { ...sectionForm, menuType };
                  if (editingSection) {
                    await api.put(`/enhanced-menu/sections/${editingSection.id}`, formToSend);
                    toast.success('✅ Section updated successfully!', {
                      duration: 3000,
                      position: 'top-center',
                    });
                  } else {
                    await api.post('/enhanced-menu/sections', formToSend);
                    toast.success('✅ Section created successfully!', {
                      duration: 3000,
                      position: 'top-center',
                    });
                  }
                  setShowSectionDialog(false);
                  fetchData();
                } catch (error) {
                  toast.error('❌ Failed to save section', {
                    duration: 3000,
                    position: 'top-center',
                  });
                }
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
              size="lg"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}