'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Send,
  Download,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Package,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, [params.id]);

  const fetchQuote = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/api/quotes/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setQuote(data.quote || data);
      } else {
        toast.error('Failed to load quote details');
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      toast.error('Failed to load quote details');
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/api/quotes/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Quote status updated to ${status}`);
        fetchQuote();
      } else {
        toast.error('Failed to update quote status');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote status');
    }
  };

  const sendQuote = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/api/quotes/${params.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Thank you for your inquiry. Please find attached our quote for your event.' 
        }),
      });

      if (response.ok) {
        toast.success('Quote sent successfully');
        fetchQuote();
      } else {
        toast.error('Failed to send quote');
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Failed to send quote');
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/api/quotes/${params.id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quote-${quote?.quoteNumber || params.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        toast.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      DRAFT: { color: 'bg-gray-500', icon: Clock },
      SENT: { color: 'bg-blue-500', icon: Send },
      VIEWED: { color: 'bg-purple-500', icon: FileText },
      ACCEPTED: { color: 'bg-green-500', icon: CheckCircle },
      REJECTED: { color: 'bg-red-500', icon: XCircle },
      EXPIRED: { color: 'bg-orange-500', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">Loading quote details...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">Quote not found</div>
      </div>
    );
  }

  // Convert Prisma Decimal strings to numbers
  const toNumber = (value: any): number => {
    if (typeof value === 'string') return parseFloat(value);
    if (typeof value === 'number') return value;
    return 0;
  };

  const subtotal = quote.quoteItems?.reduce((sum: number, item: any) => 
    sum + (toNumber(item.quantity) * toNumber(item.unitPrice)), 0) || 0;
  const taxAmount = (subtotal * toNumber(quote.taxRate || 0)) / 100;
  const gratuityAmount = (subtotal * toNumber(quote.gratuityRate || 0)) / 100;
  const total = subtotal + toNumber(quote.laborCost || 0) + taxAmount + gratuityAmount;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/quotes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quotes
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Quote #{quote.quoteNumber}</h1>
              <p className="text-muted-foreground">
                Created {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {quote.status === 'DRAFT' && (
              <Button onClick={sendQuote} size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send to Customer
              </Button>
            )}
            <Button variant="outline" onClick={downloadPDF} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Link href={`/crm/inquiries/${quote.inquiryId}/quote`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Quote Items */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.quoteItems?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start p-4 border rounded">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.description}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {toNumber(item.quantity)} × ${toNumber(item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(toNumber(item.quantity) * toNumber(item.unitPrice)).toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                {/* Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {toNumber(quote.laborCost) > 0 && (
                    <div className="flex justify-between">
                      <span>Labor</span>
                      <span>${toNumber(quote.laborCost).toFixed(2)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({toNumber(quote.taxRate)}%)</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {gratuityAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Gratuity ({toNumber(quote.gratuityRate)}%)</span>
                      <span>${gratuityAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Deposit */}
                {toNumber(quote.depositAmount) > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Deposit Required</p>
                        <p className="text-sm text-muted-foreground">
                          {quote.depositType === 'PERCENTAGE' 
                            ? `${toNumber(quote.depositAmount)}% of total`
                            : 'Fixed amount'}
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        ${quote.depositType === 'PERCENTAGE'
                          ? ((total * toNumber(quote.depositAmount)) / 100).toFixed(2)
                          : toNumber(quote.depositAmount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Terms & Notes */}
          {(quote.notes || quote.terms) && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
                  </div>
                )}
                {quote.terms && (
                  <div>
                    <h4 className="font-medium mb-2">Terms & Conditions</h4>
                    <p className="text-sm whitespace-pre-wrap">{quote.terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Current Status</label>
                <div className="mt-2">{getStatusBadge(quote.status)}</div>
              </div>
              <div className="flex flex-col gap-2">
                {quote.status === 'SENT' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => updateQuoteStatus('ACCEPTED')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Accepted
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuoteStatus('REJECTED')}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Mark as Rejected
                    </Button>
                  </>
                )}
                {quote.status === 'DRAFT' && (
                  <Button size="sm" onClick={sendQuote}>
                    Send to Customer
                  </Button>
                )}
              </div>
              {quote.validUntil && (
                <div>
                  <label className="text-sm text-muted-foreground">Valid Until</label>
                  <p className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(quote.validUntil), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          {quote.inquiry && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">{quote.inquiry.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${quote.inquiry.email}`} className="text-sm hover:underline">
                    {quote.inquiry.email}
                  </a>
                </div>
                {quote.inquiry.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${quote.inquiry.phone}`} className="text-sm hover:underline">
                      {quote.inquiry.phone}
                    </a>
                  </div>
                )}
                {quote.inquiry.companyName && (
                  <div>
                    <label className="text-sm text-muted-foreground">Company</label>
                    <p className="text-sm font-medium">{quote.inquiry.companyName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-muted-foreground">Service Type</label>
                  <Badge variant="secondary" className="mt-1">
                    {quote.inquiry.serviceType?.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Details */}
          {quote.serviceDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quote.serviceDetails.eventDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(quote.serviceDetails.eventDate), 'MMMM dd, yyyy')}
                    </span>
                  </div>
                )}
                {quote.serviceDetails.eventLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{quote.serviceDetails.eventLocation}</span>
                  </div>
                )}
                {quote.serviceDetails.guestCount && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{quote.serviceDetails.guestCount} guests</span>
                  </div>
                )}
                {quote.serviceDetails.serviceType && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{quote.serviceDetails.serviceType.replace('_', ' ')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
