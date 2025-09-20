'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface Quote {
  id: string;
  quoteNumber: string;
  total?: number;
  depositPct?: number;
  status: string;
  paidAt?: string;
  depositPaidAt?: string;
}

interface QuotePaymentProps {
  quote: Quote;
  onPaymentSuccess?: () => void;
}

export function QuotePayment({ quote, onPaymentSuccess }: QuotePaymentProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (mode: 'deposit' | 'full') => {
    if (!quote.id) return;

    setLoading(mode);
    setError(null);

    try {
      const response = await fetch('/api/payments/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          quoteId: quote.id, 
          mode 
        })
      });

      const data = await response.json();

      if (!data.url) {
        throw new Error(data.message || 'Failed to create payment session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      console.error('Payment error:', err);
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'DEPOSIT_PAID':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentAmount = (mode: 'deposit' | 'full') => {
    const total = quote.total || 0;
    const depositPct = quote.depositPct || 0.2;
    
    if (mode === 'deposit') {
      return total * depositPct;
    }
    return total;
  };

  const isPaymentDisabled = (mode: 'deposit' | 'full') => {
    if (mode === 'deposit') {
      return quote.depositPaidAt || quote.status === 'DEPOSIT_PAID' || quote.status === 'PAID';
    }
    return quote.paidAt || quote.status === 'PAID';
  };

  const getButtonText = (mode: 'deposit' | 'full') => {
    const amount = getPaymentAmount(mode);
    if (mode === 'deposit') {
      return `Pay Deposit ($${amount.toFixed(2)})`;
    }
    return `Pay in Full ($${amount.toFixed(2)})`;
  };

  const isFullyPaid = quote.paidAt || quote.status === 'PAID';
  const isDepositPaid = quote.depositPaidAt || quote.status === 'DEPOSIT_PAID';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment Options
        </CardTitle>
        <CardDescription>
          Quote #{quote.quoteNumber} - Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
            {quote.status.replace('_', ' ')}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deposit Payment */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Deposit Payment</h4>
            {isDepositPaid ? (
              <Badge variant="secondary" className="flex items-center gap-2 w-full justify-center">
                <CheckCircle className="h-4 w-4" />
                Deposit Paid
              </Badge>
            ) : (
              <Button 
                onClick={() => handlePayment('deposit')}
                disabled={loading === 'deposit' || isPaymentDisabled('deposit')}
                className="w-full"
                variant="outline"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loading === 'deposit' ? 'Processing...' : getButtonText('deposit')}
              </Button>
            )}
          </div>
          
          {/* Full Payment */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Full Payment</h4>
            {isFullyPaid ? (
              <Badge variant="secondary" className="flex items-center gap-2 w-full justify-center">
                <CheckCircle className="h-4 w-4" />
                Fully Paid
              </Badge>
            ) : (
              <Button 
                onClick={() => handlePayment('full')}
                disabled={loading === 'full' || isPaymentDisabled('full')}
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loading === 'full' ? 'Processing...' : getButtonText('full')}
              </Button>
            )}
          </div>
        </div>

        {/* Payment History */}
        {(quote.paidAt || quote.depositPaidAt) && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Payment History</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {quote.depositPaidAt && (
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Deposit paid on {new Date(quote.depositPaidAt).toLocaleDateString()}
                </p>
              )}
              {quote.paidAt && (
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Full payment completed on {new Date(quote.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple success page component
export function PaymentSuccessPage({ sessionId }: { sessionId: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Session ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{sessionId}</code>
          </p>
          <p className="text-sm text-gray-600">
            You will receive a confirmation email shortly.
          </p>
          <Button 
            onClick={() => window.location.href = '/quotes'}
            className="w-full"
          >
            View My Quotes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
