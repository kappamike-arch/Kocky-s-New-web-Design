'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  FileText,
  Save,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [quoteData, setQuoteData] = useState({
    serviceDetails: '',
    terms: `Payment Terms: 50% deposit required to confirm booking, remaining 50% due on the day of the event.
    
Cancellation Policy: Cancellations made more than 30 days before the event will receive a full refund of the deposit. Cancellations made 14-30 days before will receive 50% refund. Cancellations made less than 14 days before the event are non-refundable.
    
Service includes setup and breakdown. Travel fees may apply for locations outside our standard service area.`,
    notes: '',
    validUntil: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    sendToCustomer: false,
  });
  
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  useEffect(() => {
    fetchInquiry();
  }, [params.id]);

  const fetchInquiry = async () => {
    try {
      console.log(`[CRM Quote] Fetching inquiry with ID: ${params.id}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/api/crm/inquiries/${params.id}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[CRM Quote] Failed to fetch inquiry: ${response.status} - ${errorText}`);
        toast.error(`Failed to load inquiry: ${response.statusText}`);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('[CRM Quote] Inquiry data received:', data);
      
      if (data.success && data.data) {
        setInquiry(data.data);
        // Pre-fill service details based on inquiry
        setQuoteData(prev => ({
          ...prev,
          serviceDetails: generateServiceDetails(data.data)
        }));
      } else if (data && !data.success) {
        // Handle direct data response
        setInquiry(data);
        setQuoteData(prev => ({
          ...prev,
          serviceDetails: generateServiceDetails(data)
        }));
      } else {
        toast.error('Invalid inquiry data received');
      }
    } catch (error) {
      console.error('[CRM Quote] Failed to fetch inquiry:', error);
      toast.error('Failed to load inquiry details');
    } finally {
      setLoading(false);
    }
  };

  const generateServiceDetails = (inquiry: any) => {
    let details = `Service: ${inquiry.serviceType?.replace('_', ' ')}\n`;
    if (inquiry.eventDate) {
      details += `Event Date: ${format(new Date(inquiry.eventDate), 'MMMM dd, yyyy')}\n`;
    }
    if (inquiry.eventLocation) {
      details += `Location: ${inquiry.eventLocation}\n`;
    }
    if (inquiry.guestCount) {
      details += `Expected Guests: ${inquiry.guestCount}\n`;
    }
    details += `\nService Details:\n`;
    
    switch (inquiry.serviceType) {
      case 'FOOD_TRUCK':
        details += '- Full food truck service with professional staff\n';
        details += '- Custom menu selection\n';
        details += '- All necessary permits and insurance\n';
        details += '- Setup and cleanup included\n';
        break;
      case 'MOBILE_BAR':
        details += '- Professional bartending service\n';
        details += '- Mobile bar setup with all equipment\n';
        details += '- Mixers and garnishes included\n';
        details += '- Glassware provided\n';
        break;
      case 'CATERING':
        details += '- Full catering service\n';
        details += '- Professional service staff\n';
        details += '- All serving equipment included\n';
        details += '- Setup and cleanup included\n';
        break;
      default:
        details += '- Professional service\n';
        details += '- All necessary equipment\n';
        details += '- Setup and cleanup included\n';
    }
    
    return details;
  };

  const handleAddItem = () => {
    setQuoteItems([...quoteItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...quoteItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setQuoteItems(updatedItems);
  };

  const calculateTotal = () => {
    return quoteItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (sendNow = false) => {
    setSubmitting(true);
    
    try {
      console.log(`[CRM Quote] Creating quote for inquiry: ${params.id}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/api/crm/inquiries/${params.id}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quoteData,
          amount: calculateTotal().toString(),
          quoteItems: quoteItems.filter(item => item.description), // Only include items with descriptions
          sendToCustomer: sendNow,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[CRM Quote] Failed to create quote: ${response.status} - ${errorText}`);
        
        if (response.status === 404) {
          toast.error('Inquiry not found');
        } else if (response.status === 400) {
          toast.error('Invalid quote data');
        } else {
          toast.error(`Failed to create quote: ${response.statusText}`);
        }
        setSubmitting(false);
        return;
      }

      const data = await response.json();
      console.log('[CRM Quote] Quote created:', data);
      
      if (data.warning) {
        toast.error(data.warning);
      } else {
        toast.success(sendNow ? 'Quote created and sent to customer!' : 'Quote saved as draft');
      }
      router.push(`/crm/inquiries/${params.id}`);
    } catch (error) {
      console.error('[CRM Quote] Error creating quote:', error);
      toast.error(`Failed to create quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12">Inquiry not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/crm/inquiries/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inquiry
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create Quote</h1>
            <p className="text-muted-foreground">
              For {inquiry.name} • {inquiry.serviceType?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Describe the services being quoted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={quoteData.serviceDetails}
              onChange={(e) => setQuoteData({ ...quoteData, serviceDetails: e.target.value })}
              rows={10}
              placeholder="Enter service details..."
            />
          </CardContent>
        </Card>

        {/* Quote Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Quote Items</CardTitle>
                <CardDescription>
                  Add line items for the quote
                </CardDescription>
              </div>
              <Button onClick={handleAddItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quoteItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Service or product description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <Input
                      value={`$${item.total.toFixed(2)}`}
                      disabled
                      className="font-medium"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      onClick={() => handleRemoveItem(index)}
                      variant="ghost"
                      size="sm"
                      disabled={quoteItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-bold">${calculateTotal().toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
            <CardDescription>
              Standard terms for this quote
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Terms</Label>
              <Textarea
                value={quoteData.terms}
                onChange={(e) => setQuoteData({ ...quoteData, terms: e.target.value })}
                rows={6}
                placeholder="Enter terms and conditions..."
              />
            </div>
            <div>
              <Label>Internal Notes (not shown to customer)</Label>
              <Textarea
                value={quoteData.notes}
                onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                rows={3}
                placeholder="Any internal notes about this quote..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={quoteData.validUntil}
                  onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Checkbox
              id="send-now"
              checked={quoteData.sendToCustomer}
              onCheckedChange={(checked) => 
                setQuoteData({ ...quoteData, sendToCustomer: checked as boolean })
              }
            />
            <Label htmlFor="send-now" className="cursor-pointer">
              Send to customer immediately
            </Label>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/crm/inquiries/${params.id}`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit(quoteData.sendToCustomer)}
              disabled={submitting}
            >
              {quoteData.sendToCustomer ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create & Send
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Quote
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

