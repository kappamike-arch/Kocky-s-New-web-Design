'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Save, ArrowLeft, Plus, Trash2, 
  DollarSign, Calendar, User, Mail, Phone,
  Building, MapPin, Clock, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api/client';

interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  amount: number;
  status: string;
  validUntil: string;
  serviceDetails: string;
  terms?: string;
  notes?: string;
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
    serviceType: string;
    eventDate?: string;
    eventLocation?: string;
  };
  quoteItems: QuoteItem[];
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function QuoteEditPage({ params }: PageProps) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [formData, setFormData] = useState({
    serviceDetails: '',
    terms: '',
    notes: '',
    validDays: 30,
  });

  useEffect(() => {
    fetchQuote();
  }, [params.id]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      console.log('Fetching quote with ID:', params.id);
      
      const response = await api.get(`/quotes/${params.id}`);
      console.log('API response:', response);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.success) {
        const data = response.data;
        const quote = data.quote;
        
        // Ensure numeric values are properly converted
        const processedQuote = {
          ...quote,
          amount: parseFloat(quote.amount) || 0,
        };
        
        // Process quote items to ensure numeric values
        const processedItems = (quote.quoteItems || []).map((item: any) => ({
          ...item,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          total: parseFloat(item.total) || 0,
        }));
        
        setQuote(processedQuote);
        setItems(processedItems);
        setFormData({
          serviceDetails: quote.serviceDetails || '',
          terms: quote.terms || '',
          notes: quote.notes || '',
          validDays: 30,
        });
      } else {
        console.log('Quote not found in response:', response.data);
        toast.error('Quote not found');
        router.push('/quotes');
      }
    } catch (error: any) {
      console.error('Error fetching quote:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      // Set a default quote structure to prevent crashes
      setQuote({
        id: params.id,
        quoteNumber: 'Loading...',
        amount: 0,
        status: 'DRAFT',
        validUntil: new Date().toISOString(),
        serviceDetails: '',
        inquiry: {
          id: '',
          name: 'Loading...',
          email: '',
          serviceType: 'Loading...'
        },
        quoteItems: []
      });
      
      if (error.response?.status === 404) {
        toast.error('Quote not found');
      } else {
        toast.error('Failed to load quote - showing default view');
      }
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      notes: ''
    }]);
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };
    
    // Ensure numeric values are properly converted
    if (field === 'quantity') {
      item.quantity = parseInt(value) || 1;
    } else if (field === 'unitPrice') {
      item.unitPrice = parseFloat(value) || 0;
    } else {
      item[field] = value;
    }
    
    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = item.quantity * item.unitPrice;
    }
    
    updatedItems[index] = item;
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const total = parseFloat(item.total) || 0;
      return sum + total;
    }, 0);
  };

  const saveQuote = async () => {
    try {
      setSaving(true);
      
      const totalAmount = calculateTotal();
      
      const response = await api.put(`/quotes/${params.id}`, {
        serviceDetails: formData.serviceDetails,
        terms: formData.terms,
        notes: formData.notes,
        validDays: formData.validDays,
        items: items.filter(item => item.description.trim() !== ''),
      });

      if (response.data && response.data.success) {
        toast.success('Quote updated successfully');
        router.push('/quotes');
      } else {
        throw new Error('Failed to update quote');
      }
    } catch (error: any) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h1>
          <p className="text-gray-600 mb-4">The quote you're looking for doesn't exist or has been deleted.</p>
          <Link href="/quotes" className="text-primary hover:underline">
            ← Back to Quotes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/quotes"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Quotes
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Edit Quote {quote.quoteNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  {quote.inquiry.name} • {quote.inquiry.serviceType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveQuote}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Quote'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{quote.inquiry.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{quote.inquiry.email}</span>
                  </div>
                </div>
                {quote.inquiry.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{quote.inquiry.phone}</span>
                    </div>
                  </div>
                )}
                {quote.inquiry.companyName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{quote.inquiry.companyName}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{quote.inquiry.serviceType}</span>
                  </div>
                </div>
                {quote.inquiry.eventDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(quote.inquiry.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                {quote.inquiry.eventLocation && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Location
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{quote.inquiry.eventLocation}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quote Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Quote Items
                </h2>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Item description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            ${(parseFloat(item.total) || 0).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updateItem(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Additional notes for this item"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quote Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quote Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Details
                  </label>
                  <textarea
                    value={formData.serviceDetails}
                    onChange={(e) => setFormData({ ...formData, serviceDetails: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Describe the services being quoted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Payment terms, cancellation policy, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Internal notes or special instructions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Valid For (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.validDays}
                    onChange={(e) => setFormData({ ...formData, validDays: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quote Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quote Number:</span>
                  <span className="font-medium">{quote.quoteNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quote.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    quote.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                    quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quote.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-medium">
                    {new Date(quote.validUntil).toLocaleDateString()}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">${(calculateTotal() || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/quotes/${quote.id}/edit`}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <FileText className="w-4 h-4" />
                  View Quote
                </Link>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <FileText className="w-4 h-4" />
                  Print Quote
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
