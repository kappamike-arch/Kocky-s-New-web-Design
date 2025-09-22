'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Clock } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Quote {
  id: string;
  quoteNumber: string;
  amount: number;
  depositAmount?: number;
  status: string;
  paidAt?: string;
  depositPaidAt?: string;
}

interface PaymentButtonProps {
  quote: Quote;
  paymentType: 'deposit' | 'full';
  onPaymentSuccess?: () => void;
}

export function PaymentButton({ quote, paymentType, onPaymentSuccess }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!quote.id) return;

    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch(`/api/stripe/create-checkout/${quote.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust auth as needed
        },
        body: JSON.stringify({ paymentType })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment session');
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        throw new Error(error.message);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentAmount = () => {
    if (paymentType === 'deposit' && quote.depositAmount) {
      return quote.depositAmount;
    }
    return quote.amount;
  };

  const getButtonText = () => {
    if (paymentType === 'deposit') {
      return `Pay Deposit ($${getPaymentAmount()})`;
    }
    return `Pay in Full ($${getPaymentAmount()})`;
  };

  const isDisabled = () => {
    if (paymentType === 'deposit') {
      return quote.depositPaidAt || quote.status === 'DEPOSIT_PAID';
    }
    return quote.paidAt || quote.status === 'PAID';
  };

  if (isDisabled()) {
    return (
      <Badge variant="secondary" className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {paymentType === 'deposit' ? 'Deposit Paid' : 'Fully Paid'}
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handlePayment} 
        disabled={loading}
        className="w-full"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {loading ? 'Processing...' : getButtonText()}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface PaymentStatusCardProps {
  quote: Quote;
  onPaymentSuccess?: () => void;
}

export function PaymentStatusCard({ quote, onPaymentSuccess }: PaymentStatusCardProps) {
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

  return (
    <Card>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deposit Payment */}
          {quote.depositAmount && quote.depositAmount > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Deposit Payment</h4>
              <PaymentButton 
                quote={quote} 
                paymentType="deposit" 
                onPaymentSuccess={onPaymentSuccess}
              />
            </div>
          )}
          
          {/* Full Payment */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Full Payment</h4>
            <PaymentButton 
              quote={quote} 
              paymentType="full" 
              onPaymentSuccess={onPaymentSuccess}
            />
          </div>
        </div>

        {/* Payment History */}
        {(quote.paidAt || quote.depositPaidAt) && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Payment History</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {quote.depositPaidAt && (
                <p>✅ Deposit paid on {new Date(quote.depositPaidAt).toLocaleDateString()}</p>
              )}
              {quote.paidAt && (
                <p>✅ Full payment completed on {new Date(quote.paidAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

