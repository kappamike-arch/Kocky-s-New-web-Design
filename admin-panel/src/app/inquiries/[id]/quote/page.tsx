'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Save, Send, Plus, Trash2, ArrowLeft,
  FileText, DollarSign, Calendar, User, Mail, Phone
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  serviceType: string;
  message: string;
  eventDate?: string;
  eventLocation?: string;
  guestCount?: number;
}

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export default function CreateQuotePage() {
  const params = useParams();
  const router = useRouter();
  const inquiryId = params.id as string;

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendAfterSave, setSendAfterSave] = useState(false);

  const [formData, setFormData] = useState({
    serviceDetails: '',
    validDays: 30,
    terms: `Payment Terms:
- 50% deposit required to confirm booking
- Balance due 7 days before event
- Cancellation policy applies

Service Includes:
- Professional staff
- Setup and breakdown
- All equipment and supplies

Additional Terms:
- Service subject to availability
- Prices valid for 30 days
- Travel fees may apply for distant locations`,
    notes: '',
  });

  const [items, setItems] = useState<QuoteItem[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      notes: '',
    },
  ]);

  useEffect(() => {
    fetchInquiry();
  }, [inquiryId]);

  const fetchInquiry = async () => {
    try {
      console.log(`[Quote Creation] Fetching inquiry with ID: ${inquiryId}`);
      const response = await api.get(`/crm/inquiries/${inquiryId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Quote Creation] API error: ${response.status} - ${errorText}`);
        
        if (response.status === 404) {
          toast.error(`Inquiry not found (ID: ${inquiryId})`);
        } else if (response.status === 500) {
          toast.error('Server error while fetching inquiry');
        } else {
          toast.error(`Failed to load inquiry: ${response.statusText}`);
        }
        return;
      }
      
      const responseData = await response.json();
      console.log('[Quote Creation] Inquiry data received:', responseData);
      
      // Handle both wrapped and unwrapped responses
      const data = responseData.data || responseData;
      
      if (!data) {
        toast.error('No inquiry data received');
        return;
      }
      
      setInquiry(data);
      
      // Pre-fill service details based on inquiry
      const details = [];
      if (data.serviceType) details.push(`Service Type: ${data.serviceType}`);
      if (data.eventDate) details.push(`Event Date: ${format(new Date(data.eventDate), 'MMMM dd, yyyy')}`);
      if (data.eventLocation) details.push(`Location: ${data.eventLocation}`);
      if (data.guestCount) details.push(`Guest Count: ${data.guestCount}`);
      
      setFormData(prev => ({
        ...prev,
        serviceDetails: details.join('\n'),
      }));

      // Pre-fill items based on service type
      const defaultItems = getDefaultItems(data.serviceType);
      setItems(defaultItems);
      
    } catch (error) {
      console.error('[Quote Creation] Error fetching inquiry:', error);
      toast.error(`Failed to load inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultItems = (serviceType: string): QuoteItem[] => {
    switch (serviceType) {
      case 'FOOD_TRUCK':
        return [
          { description: 'Food Truck Service (4 hours)', quantity: 1, unitPrice: 1500, total: 1500, notes: '' },
          { description: 'Additional Hour', quantity: 0, unitPrice: 350, total: 0, notes: '' },
          { description: 'Menu Package - Standard', quantity: 1, unitPrice: 25, total: 25, notes: 'Per person' },
        ];
      case 'MOBILE_BAR':
        return [
          { description: 'Mobile Bar Service (4 hours)', quantity: 1, unitPrice: 800, total: 800, notes: '' },
          { description: 'Professional Bartender', quantity: 2, unitPrice: 200, total: 400, notes: '' },
          { description: 'Premium Bar Package', quantity: 1, unitPrice: 500, total: 500, notes: '' },
        ];
      case 'CATERING':
        return [
          { description: 'Catering Service', quantity: 1, unitPrice: 0, total: 0, notes: '' },
          { description: 'Per Person Rate', quantity: 1, unitPrice: 45, total: 45, notes: '' },
          { description: 'Service Staff', quantity: 2, unitPrice: 150, total: 300, notes: '' },
        ];
      default:
        return [
          { description: '', quantity: 1, unitPrice: 0, total: 0, notes: '' },
        ];
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      { description: '', quantity: 1, unitPrice: 0, total: 0, notes: '' },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (sendNow = false) => {
    setSaving(true);
    setSendAfterSave(sendNow);

    try {
      console.log(`[Quote Creation] Creating quote for inquiry ${inquiryId}`);
      
      // Calculate valid until date
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + formData.validDays);
      
      // Calculate total amount from items
      const totalAmount = items
        .filter(item => item.description)
        .reduce((sum, item) => sum + item.total, 0);
      
      const requestBody = {
        amount: totalAmount,
        validUntil: validUntil.toISOString(),
        serviceDetails: formData.serviceDetails,
        terms: formData.terms,
        notes: formData.notes,
        quoteItems: items.filter(item => item.description).map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          notes: item.notes
        })),
        sendToCustomer: false
      };
      
      console.log('[Quote Creation] Request body:', requestBody);
      
      const response = await api.post(`/crm/inquiries/${inquiryId}/quotes`, requestBody);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Quote Creation] Failed to create quote: ${response.status} - ${errorText}`);
        
        if (response.status === 404) {
          toast.error('Inquiry not found');
        } else if (response.status === 400) {
          toast.error('Invalid quote data provided');
        } else {
          toast.error(`Failed to create quote: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      console.log('[Quote Creation] Quote created:', data);
      
      if (sendNow && data.id) {
        // Send the quote immediately
        const sendResponse = await api.post(`/quotes/${data.id}/send`, {
          message: 'Please find attached our quote for your requested service. We look forward to serving you!',
        });

        if (sendResponse.ok) {
          toast.success('Quote created and sent successfully!');
        } else {
          toast.success('Quote created but failed to send. You can send it later.');
        }
      } else {
        toast.success('Quote created successfully!');
      }

      router.push('/crm');
    } catch (error) {
      console.error('[Quote Creation] Error creating quote:', error);
      toast.error(`Failed to create quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          Inquiry not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/inquiries"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create Quote</h1>
            <p className="text-gray-600">Creating quote for inquiry from {inquiry.name}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{inquiry.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{inquiry.email}</p>
            </div>
          </div>
          {inquiry.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{inquiry.phone}</p>
              </div>
            </div>
          )}
        </div>
        {inquiry.companyName && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Company</p>
            <p className="font-medium">{inquiry.companyName}</p>
          </div>
        )}
      </div>

      {/* Quote Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Quote Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Service Details</label>
            <textarea
              value={formData.serviceDetails}
              onChange={(e) => setFormData({ ...formData, serviceDetails: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Describe the services to be provided..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Valid for (days)</label>
              <input
                type="number"
                value={formData.validDays}
                onChange={(e) => setFormData({ ...formData, validDays: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valid Until</label>
              <input
                type="text"
                value={format(new Date(Date.now() + formData.validDays * 24 * 60 * 60 * 1000), 'MMMM dd, yyyy')}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Line Items</h2>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Qty
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Unit Price
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Notes
                </th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border rounded text-center"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border rounded text-right"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    ${item.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => updateItem(index, 'notes', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="Optional notes"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                  Total:
                </td>
                <td className="px-4 py-3 text-right font-bold text-lg">
                  ${calculateTotal().toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Terms & Notes */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Terms</label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Internal Notes (not shown to customer)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Any internal notes about this quote..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit(false)}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Save as Draft
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Save & Send
        </button>
      </div>
    </div>
  );
}
