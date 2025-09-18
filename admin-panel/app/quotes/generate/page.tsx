'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TemplateSelector } from '@/components/quote-templates/TemplateSelector';
import { ClassicProfessionalTemplate } from '@/components/quote-templates/ClassicProfessional';
import { SleekModernTemplate } from '@/components/quote-templates/SleekModern';
import { ElegantVisualTemplate } from '@/components/quote-templates/ElegantVisual';
import { TemplateType } from '@/components/quote-templates';
import { QuoteTemplateProps } from '@/components/quote-templates/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Eye, 
  Download, 
  Send, 
  Plus, 
  Trash2, 
  Save,
  DollarSign,
  Percent,
  FileText,
  User,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api/client';

export const dynamic = 'force-dynamic';

function QuoteGeneratorInner() {
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get('inquiryId');

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(
    TemplateType.CLASSIC_PROFESSIONAL
  );
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Quote Data State
  const [quoteData, setQuoteData] = useState<QuoteTemplateProps>({
    quoteNumber: `Q-${Date.now().toString().slice(-6)}`,
    customer: {
      name: '',
      email: '',
      phone: '',
      company: '',
    },
    event: {
      date: new Date().toISOString().split('T')[0],
      location: '',
      type: 'Catering',
      guestCount: 0,
    },
    items: [],
    pricing: {
      subtotal: 0,
      tax: 0,
      taxRate: 0.0875, // 8.75% default
      gratuity: 0,
      gratuityRate: 0.18, // 18% default
      total: 0,
      deposit: 0,
    },
    notes: '',
    termsAndConditions: `Payment Terms:
• 50% deposit required to confirm booking
• Balance due 48 hours before event
• Cancellations within 7 days are non-refundable

Service Includes:
• Professional staff
• Setup and breakdown
• All equipment and supplies
• Insurance coverage`,
    stripePaymentUrl: '',
    companyInfo: {
      name: "Kocky's Bar & Grill",
      logo: '/kockys-logo.png',
      address: '123 Main Street, Your City, State 12345',
      phone: '(555) 123-4567',
      email: 'info@kockysbar.com',
      website: 'www.kockysbar.com',
    },
    displayOptions: {
      showLogo: true,
      showItemDescription: true,
      showItemQuantity: true,
      showItemPrice: true,
      showSubtotal: true,
      showTax: true,
      showGratuity: true,
      showNotes: true,
      showTerms: true,
      showPaymentButton: true,
    },
  });

  // Load inquiry data if inquiryId is provided
  useEffect(() => {
    if (inquiryId) {
      loadInquiryData(inquiryId);
    }
  }, [inquiryId]);

  const loadInquiryData = async (id: string) => {
    try {
      const response = await api.get(`/crm/inquiries/${id}`);
      const inquiry = response.data.data || response.data;
      
      setQuoteData(prev => ({
        ...prev,
        customer: {
          name: inquiry.name || '',
          email: inquiry.email || '',
          phone: inquiry.phone || '',
          company: inquiry.company || '',
        },
        event: {
          date: inquiry.eventDate || prev.event.date,
          location: inquiry.eventLocation || '',
          type: inquiry.serviceType || 'Catering',
          guestCount: inquiry.guestCount || 0,
        },
      }));
    } catch (error) {
      console.error('Failed to load inquiry data:', error);
    }
  };

  // Add new item
  const addItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      total: 0,
    };
    setQuoteData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Update item
  const updateItem = (id: string, field: string, value: any) => {
    setQuoteData(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Calculate total
          updated.total = (updated.quantity || 1) * (updated.price || 0);
          return updated;
        }
        return item;
      });
      
      // Recalculate pricing
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const tax = subtotal * prev.pricing.taxRate;
      const gratuity = subtotal * prev.pricing.gratuityRate;
      const total = subtotal + tax + gratuity;
      
      return {
        ...prev,
        items: updatedItems,
        pricing: {
          ...prev.pricing,
          subtotal,
          tax,
          gratuity,
          total,
        },
      };
    });
  };

  // Remove item
  const removeItem = (id: string) => {
    setQuoteData(prev => {
      const updatedItems = prev.items.filter(item => item.id !== id);
      
      // Recalculate pricing
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const tax = subtotal * prev.pricing.taxRate;
      const gratuity = subtotal * prev.pricing.gratuityRate;
      const total = subtotal + tax + gratuity;
      
      return {
        ...prev,
        items: updatedItems,
        pricing: {
          ...prev.pricing,
          subtotal,
          tax,
          gratuity,
          total,
        },
      };
    });
  };

  // Update pricing rates
  const updatePricingRate = (field: 'taxRate' | 'gratuityRate', value: number) => {
    setQuoteData(prev => {
      const subtotal = prev.pricing.subtotal;
      const taxRate = field === 'taxRate' ? value : prev.pricing.taxRate;
      const gratuityRate = field === 'gratuityRate' ? value : prev.pricing.gratuityRate;
      
      const tax = subtotal * taxRate;
      const gratuity = subtotal * gratuityRate;
      const total = subtotal + tax + gratuity;
      
      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          [field]: value,
          tax,
          gratuity,
          total,
        },
      };
    });
  };

  // Render selected template
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case TemplateType.CLASSIC_PROFESSIONAL:
        return <ClassicProfessionalTemplate {...quoteData} />;
      case TemplateType.SLEEK_MODERN:
        return <SleekModernTemplate {...quoteData} />;
      case TemplateType.ELEGANT_VISUAL:
        return <ElegantVisualTemplate {...quoteData} />;
      default:
        return null;
    }
  };

  // Save quote
  const saveQuote = async () => {
    setLoading(true);
    try {
      const response = await api.post('/quotes', {
        ...quoteData,
        template: selectedTemplate,
        inquiryId: inquiryId || undefined,
      });
      toast.success('Quote saved successfully!');
      
      // Generate Stripe payment link
      if (response.data.stripePaymentUrl) {
        setQuoteData(prev => ({
          ...prev,
          stripePaymentUrl: response.data.stripePaymentUrl,
        }));
      }
    } catch (error) {
      toast.error('Failed to save quote');
      console.error('Save quote error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send quote via email
  const sendQuote = async () => {
    if (!quoteData.customer.email) {
      toast.error('Customer email is required');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/quotes/send', {
        ...quoteData,
        template: selectedTemplate,
      });
      toast.success('Quote sent successfully!');
    } catch (error) {
      toast.error('Failed to send quote');
      console.error('Send quote error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quote Generator</h1>
        <p className="text-gray-600">Create professional quotes with multiple template options</p>
      </div>

      {/* Template Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Select Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            quoteData={quoteData}
            showPreview={false}
          />
        </CardContent>
      </Card>

      {/* Quote Details Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={quoteData.customer.name}
                onChange={(e) => setQuoteData(prev => ({
                  ...prev,
                  customer: { ...prev.customer, name: e.target.value }
                }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={quoteData.customer.email}
                onChange={(e) => setQuoteData(prev => ({
                  ...prev,
                  customer: { ...prev.customer, email: e.target.value }
                }))}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={quoteData.customer.phone}
                onChange={(e) => setQuoteData(prev => ({
                  ...prev,
                  customer: { ...prev.customer, phone: e.target.value }
                }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={quoteData.customer.company}
                onChange={(e) => setQuoteData(prev => ({
                  ...prev,
                  customer: { ...prev.customer, company: e.target.value }
                }))}
                placeholder="Company Name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Event Type</Label>
              <select
                value={quoteData.event.type}
                onChange={(e) => setQuoteData(prev => ({
                  ...prev,
                  event: { ...prev.event, type: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Catering">Catering</option>
                <option value="Mobile Bar">Mobile Bar</option>
                <option value="Food Truck">Food Truck</option>
                <option value="Private Event">Private Event</option>
              </select>
            </div>
            <div>
              <Label>Event Date</Label>
              <Input
                type="date"
                value={quoteData.event.date}
                onChange={(e) => setQuoteData(prev => ({
                  ...prev,
                  event: { ...prev.event, date: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={quoteData.event.location}
                onChange={(e) => setQuoteData(prev => ({
                  ...prev,
                  event: { ...prev.event, location: e.target.value }
                }))}
                placeholder="123 Main St, City, State"
              />
            </div>
            <div>
              <Label>Guest Count</Label>
              <Input
                type="number"
                value={quoteData.event.guestCount}
                onChange={(e) => setQuoteData(prev => ({
                  ...prev,
                  event: { ...prev.event, guestCount: parseInt(e.target.value) || 0 }
                }))}
                placeholder="50"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Services & Items
            </span>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quoteData.items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No items added yet. Click "Add Item" to start.
              </p>
            ) : (
              quoteData.items.map((item) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <Label>Item Name</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        placeholder="Service or Product Name"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Brief description"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Total</Label>
                      <div className="mt-2 font-semibold">
                        ${(item.total || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        onClick={() => removeItem(item.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Additional Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Notes</Label>
              <Textarea
                value={quoteData.notes}
                onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes for the customer..."
                rows={4}
              />
            </div>
            <div>
              <Label>Payment Options</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Label>Deposit Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={quoteData.pricing.deposit}
                    onChange={(e) => setQuoteData(prev => ({
                      ...prev,
                      pricing: { ...prev.pricing, deposit: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-32"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Stripe Payment URL</Label>
                  <Input
                    value={quoteData.stripePaymentUrl}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, stripePaymentUrl: e.target.value }))}
                    placeholder="https://buy.stripe.com/..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">${quoteData.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>Tax</span>
                  <Input
                    type="number"
                    step="0.001"
                    value={quoteData.pricing.taxRate * 100}
                    onChange={(e) => updatePricingRate('taxRate', parseFloat(e.target.value) / 100 || 0)}
                    className="w-20 h-8"
                    placeholder="8.75"
                  />
                  <span className="text-sm">%</span>
                </div>
                <span className="font-medium">${quoteData.pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>Gratuity</span>
                  <Input
                    type="number"
                    step="1"
                    value={quoteData.pricing.gratuityRate * 100}
                    onChange={(e) => updatePricingRate('gratuityRate', parseFloat(e.target.value) / 100 || 0)}
                    className="w-20 h-8"
                    placeholder="18"
                  />
                  <span className="text-sm">%</span>
                </div>
                <span className="font-medium">${quoteData.pricing.gratuity.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#c1272d]">${quoteData.pricing.total.toFixed(2)}</span>
                </div>
                {quoteData.pricing.deposit > 0 && (
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Deposit Required</span>
                    <span>${quoteData.pricing.deposit.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </Button>
        
        <div className="flex gap-4">
          <Button
            onClick={saveQuote}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Quote
          </Button>
          <Button
            onClick={sendQuote}
            disabled={loading || !quoteData.customer.email}
            className="bg-[#c1272d] hover:bg-red-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Customer
          </Button>
        </div>
      </div>

      {/* Template Preview */}
      {showPreview && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quote Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-8 rounded-lg overflow-auto">
              {renderTemplate()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function QuoteGeneratorPage() {
  return (
    <Suspense>
      <QuoteGeneratorInner />
    </Suspense>
  );
}



