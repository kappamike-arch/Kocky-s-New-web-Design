'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Plus, Trash2, Save, ArrowLeft, 
  DollarSign, Calendar, User, Mail, Phone,
  Building, MapPin, FileText, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useQuoteActions } from '@/hooks/useQuoteActions';
import { QuoteActionBar } from './QuoteActionBar';
import { 
  calculateQuoteTotals, 
  formatCurrency, 
  createDefaultQuoteItem,
  QuoteItem,
  QuoteCalculationOptions 
} from '@/lib/quotes/calcTotals';

export interface QuoteDTO {
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
    guestCount?: number;
  };
  quoteItems: QuoteItem[];
}

export interface InquiryDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  serviceType: string;
  eventDate?: string;
  eventLocation?: string;
  guestCount?: number;
  message?: string;
}

export interface QuoteComposerProps {
  mode: 'create' | 'edit';
  quoteId?: string;
  initialQuote?: QuoteDTO;
  inquiryContext?: InquiryDTO | null;
  onSaved?: (quote: QuoteDTO) => void;
}

export function QuoteComposer({ 
  mode, 
  quoteId, 
  initialQuote, 
  inquiryContext,
  onSaved 
}: QuoteComposerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<QuoteDTO | null>(initialQuote || null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [formData, setFormData] = useState({
    serviceDetails: '',
    terms: '',
    notes: '',
    validDays: 30,
  });
  const [calculationOptions, setCalculationOptions] = useState<QuoteCalculationOptions>({
    taxRate: 0,
    gratuityRate: 0,
    discount: 0,
    discountType: 'FIXED'
  });

  const { getQuote, saveQuote } = useQuoteActions();

  useEffect(() => {
    if (mode === 'edit' && quoteId && !initialQuote) {
      fetchQuote();
    } else if (mode === 'create' && inquiryContext) {
      initializeFromInquiry();
    }
  }, [mode, quoteId, initialQuote, inquiryContext]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await getQuote(quoteId!);
      
      if (response.success && response.quote) {
        const quoteData = response.quote;
        setQuote(quoteData);
        setItems(quoteData.quoteItems || []);
        setFormData({
          serviceDetails: quoteData.serviceDetails || '',
          terms: quoteData.terms || '',
          notes: quoteData.notes || '',
          validDays: 30,
        });
      } else {
        throw new Error('Quote not found');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Failed to load quote');
      router.push('/quotes');
    } finally {
      setLoading(false);
    }
  };

  const initializeFromInquiry = () => {
    if (!inquiryContext) return;

    const defaultItem = createDefaultQuoteItem();
    defaultItem.description = `${inquiryContext.serviceType} Service`;
    if (inquiryContext.guestCount) {
      defaultItem.quantity = inquiryContext.guestCount;
      defaultItem.unitPrice = 25; // Default price per person
      defaultItem.total = defaultItem.quantity * defaultItem.unitPrice;
    }

    setItems([defaultItem]);
    setFormData({
      serviceDetails: `${inquiryContext.serviceType} Service${inquiryContext.eventLocation ? ` at ${inquiryContext.eventLocation}` : ''}${inquiryContext.guestCount ? ` for ${inquiryContext.guestCount} guests` : ''}`,
      terms: 'Standard terms and conditions',
      notes: inquiryContext.message || '',
      validDays: 30,
    });
  };

  const addItem = () => {
    setItems([...items, createDefaultQuoteItem()]);
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };
    
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

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const totals = calculateQuoteTotals(items, calculationOptions);
      
      const payload = {
        id: mode === 'edit' ? quoteId : undefined,
        serviceDetails: formData.serviceDetails,
        terms: formData.terms,
        notes: formData.notes,
        validDays: formData.validDays,
        amount: totals.total,
        items: items.filter(item => item.description.trim() !== ''),
      };

      const response = await saveQuote(payload);
      
      if (response.success) {
        toast.success('Quote saved successfully');
        if (onSaved) {
          onSaved(response.quote || response.data);
        }
        if (mode === 'create') {
          router.push(`/quotes/${response.quote?.id || response.data?.id}/edit`);
        }
      } else {
        throw new Error('Failed to save quote');
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateQuoteTotals(items, calculationOptions);

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

  if (mode === 'edit' && !quote) {
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

  const displayQuote = quote || {
    id: 'new',
    quoteNumber: 'NEW',
    amount: 0,
    status: 'DRAFT',
    validUntil: new Date().toISOString(),
    serviceDetails: '',
    inquiry: inquiryContext || {
      id: '',
      name: 'New Customer',
      email: '',
      serviceType: 'GENERAL'
    },
    quoteItems: []
  };

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
                  {mode === 'edit' ? 'Edit' : 'Create'} Quote {displayQuote.quoteNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  {displayQuote.inquiry.name} • {displayQuote.inquiry.serviceType}
                </p>
              </div>
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
                    <span className="text-gray-900">{displayQuote.inquiry.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{displayQuote.inquiry.email}</span>
                  </div>
                </div>
                {displayQuote.inquiry.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{displayQuote.inquiry.phone}</span>
                    </div>
                  </div>
                )}
                {displayQuote.inquiry.companyName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{displayQuote.inquiry.companyName}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{displayQuote.inquiry.serviceType}</span>
                  </div>
                </div>
                {displayQuote.inquiry.eventDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(displayQuote.inquiry.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                {displayQuote.inquiry.eventLocation && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Location
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{displayQuote.inquiry.eventLocation}</span>
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
                            {formatCurrency(item.total)}
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
                  <span className="font-medium">{displayQuote.quoteNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    displayQuote.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    displayQuote.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                    displayQuote.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {displayQuote.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-medium">
                    {new Date(displayQuote.validUntil).toLocaleDateString()}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <QuoteActionBar
        quoteId={quoteId || 'new'}
        quoteNumber={displayQuote.quoteNumber}
        customerEmail={displayQuote.inquiry.email}
        onSave={handleSave}
        disabled={saving}
      />
    </div>
  );
}
















