'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, Archive, Users, Receipt, Percent, Loader2, Settings, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const API_URL = '/api';

export default function QuoteConfigPage() {
  const [activeTab, setActiveTab] = useState('packages');
  const [loading, setLoading] = useState(false);
  const [configurations, setConfigurations] = useState({
    packages: [],
    items: [],
    labor: [],
    taxes: [],
    gratuities: []
  });

  // Modal states
  const [editModal, setEditModal] = useState({ open: false, type: '', item: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', item: null });

  // Fetch all configurations
  const fetchConfigurations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/quote-config/all`);
      const data = await response.json();
      if (data.success) {
        setConfigurations(data.data);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast.error('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  // Initialize defaults if needed
  const initializeDefaults = async () => {
    try {
      const response = await fetch(`${API_URL}/quote-config/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchConfigurations();
      }
    } catch (error) {
      console.error('Error initializing defaults:', error);
      toast.error('Failed to initialize defaults');
    }
  };

  // Handle edit action
  const handleEdit = (type: string, item: any) => {
    console.log('Edit clicked:', type, item);
    setEditModal({ open: true, type, item });
  };

  // Handle delete action
  const handleDelete = (type: string, item: any) => {
    console.log('Delete clicked:', type, item);
    setDeleteModal({ open: true, type, item });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteModal.item || !deleteModal.type) return;

    try {
      const response = await fetch(`${API_URL}/quote-config/${deleteModal.type}/${(deleteModal.item as any)?.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`${deleteModal.type} deleted successfully`);
        fetchConfigurations();
        setDeleteModal({ open: false, type: '', item: null });
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete item');
    }
  };

  // Save edit changes
  const saveEditChanges = async (formData: any) => {
    if (!editModal.type) return;

    try {
      const isNew = !editModal.item;
      const url = isNew
        ? `${API_URL}/quote-config/${editModal.type}`
        : `${API_URL}/quote-config/${editModal.type}/${(editModal.item as any)?.id}`;
      
      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`${editModal.type} ${isNew ? 'created' : 'updated'} successfully`);
        fetchConfigurations();
        setEditModal({ open: false, type: '', item: null });
      } else {
        toast.error(data.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const isConfigEmpty = Object.values(configurations).every((arr: any) => arr.length === 0);

  if (loading && isConfigEmpty) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'items', label: 'Items', icon: Archive },
    { id: 'labor', label: 'Labor', icon: Users },
    { id: 'taxes', label: 'Taxes', icon: Receipt },
    { id: 'gratuity', label: 'Gratuity', icon: Percent }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quote Configuration</h1>
          <p className="text-gray-600">Manage packages, items, labor, taxes, and gratuity settings</p>
        </div>
        {isConfigEmpty && (
          <button 
            onClick={initializeDefaults}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Initialize Defaults
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b">
          <div className="flex flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 ${
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

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'packages' && (
          <PackagesSection 
            packages={configurations.packages} 
            onEdit={(item) => handleEdit('packages', item)}
            onDelete={(item) => handleDelete('packages', item)}
            onAdd={() => handleEdit('packages', null)}
          />
        )}
        {activeTab === 'items' && (
          <ItemsSection 
            items={configurations.items} 
            onEdit={(item) => handleEdit('items', item)}
            onDelete={(item) => handleDelete('items', item)}
            onAdd={() => handleEdit('items', null)}
          />
        )}
        {activeTab === 'labor' && (
          <LaborSection 
            labor={configurations.labor} 
            onEdit={(item) => handleEdit('labor', item)}
            onDelete={(item) => handleDelete('labor', item)}
            onAdd={() => handleEdit('labor', null)}
          />
        )}
        {activeTab === 'taxes' && (
          <TaxesSection 
            taxes={configurations.taxes} 
            onEdit={(item) => handleEdit('taxes', item)}
            onDelete={(item) => handleDelete('taxes', item)}
            onAdd={() => handleEdit('taxes', null)}
          />
        )}
        {activeTab === 'gratuity' && (
          <GratuitySection 
            gratuities={configurations.gratuities} 
            onEdit={(item) => handleEdit('gratuities', item)}
            onDelete={(item) => handleDelete('gratuities', item)}
            onAdd={() => handleEdit('gratuities', null)}
          />
        )}
      </div>

      {/* Edit Modal */}
      <EditModal 
        open={editModal.open}
        type={editModal.type}
        item={editModal.item}
        onClose={() => setEditModal({ open: false, type: '', item: null })}
        onSave={saveEditChanges}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteModal.open} onOpenChange={(open) => !open && setDeleteModal({ open: false, type: '', item: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {deleteModal.type?.slice(0, -1)}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Edit Modal Component
function EditModal({ open, type, item, onClose, onSave }: any) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      // Set default values for new items
      setFormData(getDefaultFormData(type));
    }
  }, [item, type]);

  const getDefaultFormData = (type: string) => {
    switch (type) {
      case 'packages':
        return { name: '', description: '', category: 'MOBILE_BAR', price: '', priceType: 'PER_PERSON', minOrder: '' };
      case 'items':
        return { name: '', category: 'DRINKS', unitPrice: '', unit: 'EACH', taxable: true };
      case 'labor':
        return { role: '', description: '', rate: '', rateType: 'HOURLY', minHours: '' };
      case 'taxes':
        return { name: '', description: '', rate: '', isDefault: false };
      case 'gratuities':
        return { name: '', description: '', percentage: '', minGuestCount: '', isAutoApply: false, isDefault: false };
      default:
        return {};
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getModalTitle = () => {
    const action = item ? 'Edit' : 'Add';
    const typeLabel = type ? type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1) : '';
    return `${action} ${typeLabel}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-semibold">{getModalTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'packages' && (
            <>
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">Package Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-gray-700 font-medium">Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  value={formData.category || 'MOBILE_BAR'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="MOBILE_BAR">Mobile Bar</option>
                  <option value="FOOD_TRUCK">Food Truck</option>
                  <option value="CATERING">Catering</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-gray-700 font-medium">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label htmlFor="priceType" className="text-gray-700 font-medium">Price Type</Label>
                  <select
                    id="priceType"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={formData.priceType || 'PER_PERSON'}
                    onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                  >
                    <option value="PER_PERSON">Per Person</option>
                    <option value="PER_HOUR">Per Hour</option>
                    <option value="FLAT_RATE">Flat Rate</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {type === 'items' && (
            <>
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">Item Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-gray-700 font-medium">Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  value={formData.category || 'DRINKS'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="DRINKS">Drinks</option>
                  <option value="FOOD">Food</option>
                  <option value="RENTALS">Rentals</option>
                  <option value="SUPPLIES">Supplies</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitPrice" className="text-gray-700 font-medium">Unit Price</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice || ''}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    required
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label htmlFor="unit" className="text-gray-700 font-medium">Unit</Label>
                  <select
                    id="unit"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={formData.unit || 'EACH'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="EACH">Each</option>
                    <option value="DOZEN">Dozen</option>
                    <option value="CASE">Case</option>
                    <option value="HOUR">Hour</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="taxable"
                  checked={formData.taxable || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, taxable: checked })}
                />
                <Label htmlFor="taxable">Taxable</Label>
              </div>
            </>
          )}

          {type === 'labor' && (
            <>
              <div>
                <Label htmlFor="role" className="text-gray-700 font-medium">Role</Label>
                <Input
                  id="role"
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate" className="text-gray-700 font-medium">Rate</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={formData.rate || ''}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    required
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label htmlFor="rateType" className="text-gray-700 font-medium">Rate Type</Label>
                  <select
                    id="rateType"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={formData.rateType || 'HOURLY'}
                    onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                  >
                    <option value="HOURLY">Hourly</option>
                    <option value="DAILY">Daily</option>
                    <option value="EVENT">Per Event</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="minHours" className="text-gray-700 font-medium">Minimum Hours</Label>
                <Input
                  id="minHours"
                  type="number"
                  step="0.5"
                  value={formData.minHours || ''}
                  onChange={(e) => setFormData({ ...formData, minHours: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </>
          )}

          {type === 'taxes' && (
            <>
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">Tax Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="rate" className="text-gray-700 font-medium">Tax Rate (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  value={formData.rate || ''}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
                <Label htmlFor="isDefault">Set as Default</Label>
              </div>
            </>
          )}

          {type === 'gratuities' && (
            <>
              <div>
                <Label htmlFor="name">Gratuity Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="percentage">Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    step="0.1"
                    value={formData.percentage || ''}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minGuestCount">Min Guest Count</Label>
                  <Input
                    id="minGuestCount"
                    type="number"
                    value={formData.minGuestCount || ''}
                    onChange={(e) => setFormData({ ...formData, minGuestCount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAutoApply"
                    checked={formData.isAutoApply || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isAutoApply: checked })}
                  />
                  <Label htmlFor="isAutoApply">Auto-apply when conditions met</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                  />
                  <Label htmlFor="isDefault">Set as Default</Label>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
            >
              {item ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Packages Section
function PackagesSection({ packages, onEdit, onDelete, onAdd }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Packages</h2>
        <button 
          onClick={onAdd}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>
      <div className="space-y-2">
        {packages.map((pkg: any) => (
          <div key={pkg.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{pkg.name}</h3>
                <p className="text-sm text-gray-600">{pkg.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {pkg.category}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    ${parseFloat(pkg.price).toFixed(2)} / {pkg.priceType}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(pkg)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(pkg)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No packages configured. Click "Add Package" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

// Items Section
function ItemsSection({ items, onEdit, onDelete, onAdd }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Items</h2>
        <button 
          onClick={onAdd}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item: any) => (
          <div key={item.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {item.category}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    ${parseFloat(item.unitPrice).toFixed(2)} / {item.unit}
                  </span>
                  {item.taxable && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Taxable
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(item)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(item)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No items configured. Click "Add Item" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

// Labor Section
function LaborSection({ labor, onEdit, onDelete, onAdd }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Labor Costs</h2>
        <button 
          onClick={onAdd}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Labor
        </button>
      </div>
      <div className="space-y-2">
        {labor.map((item: any) => (
          <div key={item.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.role}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    ${parseFloat(item.rate).toFixed(2)} / {item.rateType}
                  </span>
                  {item.minHours && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      Min {parseFloat(item.minHours)} hours
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(item)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(item)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {labor.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No labor costs configured. Click "Add Labor" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

// Taxes Section
function TaxesSection({ taxes, onEdit, onDelete, onAdd }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tax Settings</h2>
        <button 
          onClick={onAdd}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Tax
        </button>
      </div>
      <div className="space-y-2">
        {taxes.map((tax: any) => (
          <div key={tax.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{tax.name}</h3>
                {tax.description && <p className="text-sm text-gray-600">{tax.description}</p>}
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {parseFloat(tax.rate).toFixed(2)}%
                  </span>
                  {tax.isDefault && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(tax)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(tax)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {taxes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No taxes configured. Click "Add Tax" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

// Gratuity Section
function GratuitySection({ gratuities, onEdit, onDelete, onAdd }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gratuity Settings</h2>
        <button 
          onClick={onAdd}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Gratuity
        </button>
      </div>
      <div className="space-y-2">
        {gratuities && gratuities.map((gratuity: any) => (
          <div key={gratuity.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{gratuity.name}</h3>
                {gratuity.description && <p className="text-sm text-gray-600">{gratuity.description}</p>}
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {parseFloat(gratuity.percentage).toFixed(1)}%
                  </span>
                  {gratuity.minGuestCount && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      Min {gratuity.minGuestCount} guests
                    </span>
                  )}
                  {gratuity.isAutoApply && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                      Auto-apply
                    </span>
                  )}
                  {gratuity.isDefault && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(gratuity)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(gratuity)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!gratuities || gratuities.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No gratuity settings configured. Click "Add Gratuity" to get started.
          </div>
        )}
      </div>
    </div>
  );
}