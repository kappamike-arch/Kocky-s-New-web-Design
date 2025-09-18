import Stripe from 'stripe';
import { Decimal } from '@prisma/client/runtime/library';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface CreatePaymentLinkParams {
  quoteId: string;
  quoteNumber: string;
  customerEmail: string;
  customerName: string;
  amount: number; // Amount in cents
  description: string;
  depositAmount?: number; // Deposit amount in cents
  isDeposit?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Create a Stripe payment link for a quote
 */
export async function createPaymentLink(params: CreatePaymentLinkParams): Promise<string> {
  const {
    quoteId,
    quoteNumber,
    customerEmail,
    customerName,
    amount,
    description,
    depositAmount,
    isDeposit = false,
    successUrl = `${process.env.FRONTEND_URL}/payment/success?quote=${quoteId}`,
    cancelUrl = `${process.env.FRONTEND_URL}/payment/cancel?quote=${quoteId}`,
  } = params;

  try {
    // Create a product for this quote
    const product = await stripe.products.create({
      name: `Quote ${quoteNumber}`,
      description: description,
      metadata: {
        quoteId,
        quoteNumber,
        customerName,
        customerEmail,
      },
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: isDeposit && depositAmount ? depositAmount : amount,
      currency: 'usd',
      metadata: {
        quoteId,
        isDeposit: isDeposit.toString(),
      },
    });

    // Create a payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: successUrl,
        },
      },
      metadata: {
        quoteId,
        quoteNumber,
        customerEmail,
        isDeposit: isDeposit.toString(),
      },
      customer_creation: 'always',
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Payment for Quote ${quoteNumber}`,
          metadata: {
            quoteId,
          },
          custom_fields: [
            {
              name: 'Quote Number',
              value: quoteNumber,
            },
          ],
        },
      },
    });

    return paymentLink.url;
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw new Error('Failed to create payment link');
  }
}

/**
 * Calculate deposit amount based on type and value
 */
export function calculateDepositAmount(
  totalAmount: Decimal | number,
  depositType: 'percentage' | 'fixed',
  depositValue: Decimal | number
): number {
  const total = typeof totalAmount === 'object' ? totalAmount.toNumber() : totalAmount;
  const value = typeof depositValue === 'object' ? depositValue.toNumber() : depositValue;

  if (depositType === 'percentage') {
    return Math.round(total * (value / 100));
  } else {
    return Math.round(value * 100); // Convert to cents
  }
}

/**
 * Verify a Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Handle successful payment webhook
 */
export async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const { metadata } = paymentIntent;
  
  if (!metadata.quoteId) {
    console.error('No quoteId in payment metadata');
    return;
  }

  // Update quote status in database
  // This will be called from the webhook handler
  console.log(`Payment successful for quote ${metadata.quoteId}`);
  console.log(`Amount: ${paymentIntent.amount / 100} USD`);
  console.log(`Is Deposit: ${metadata.isDeposit === 'true'}`);
}

/**
 * Create a test payment link (for development)
 */
export async function createTestPaymentLink(): Promise<string> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test payment links are only available in development');
  }

  return createPaymentLink({
    quoteId: 'test-quote-123',
    quoteNumber: 'Q-TEST-001',
    customerEmail: 'test@example.com',
    customerName: 'Test Customer',
    amount: 10000, // $100.00
    description: 'Test Quote Payment',
    depositAmount: 3000, // $30.00
    isDeposit: true,
  });
}

export default {
  createPaymentLink,
  calculateDepositAmount,
  verifyWebhookSignature,
  handlePaymentSuccess,
  createTestPaymentLink,
};
