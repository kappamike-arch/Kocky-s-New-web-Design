import { stripe } from '../../lib/stripe';
import { logger } from '../../utils/logger';

export interface QuoteCheckoutParams {
  quoteId: string;
  customerEmail: string;
  mode: 'deposit' | 'full';
  title: string;
  totalCents: number;
  depositPct?: number;
}

export interface QuoteCheckoutResult {
  url: string;
  sessionId: string;
  amount: number;
}

/**
 * Create a Stripe Checkout session for quote payment with idempotency
 */
export const createQuoteCheckout = async ({
  quoteId,
  customerEmail,
  mode,
  title,
  totalCents,
  depositPct = 0.2
}: QuoteCheckoutParams): Promise<QuoteCheckoutResult> => {
  const stripeId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.info(`💳 STRIPE CHECKOUT CREATION STARTED [${stripeId}]`, {
    quoteId,
    customerEmail,
    mode,
    title,
    totalCents,
    depositPct,
    totalAmount: `$${(totalCents / 100).toFixed(2)}`
  });

  try {
    // Calculate payment amount
    let paymentAmountCents: number;
    let description: string;

    if (mode === 'deposit') {
      // For deposit mode, use percentage or minimum $50
      const depositAmount = Math.max(50, Math.round(totalCents * depositPct));
      paymentAmountCents = depositAmount;
      description = `Deposit for ${title}`;
    } else {
      // For full payment mode
      paymentAmountCents = totalCents;
      description = `Payment for ${title}`;
    }

    // Create idempotency key to prevent duplicate sessions
    const idempotencyKey = `quote:${quoteId}:${mode}`;

    logger.info(`💳 STRIPE CALCULATIONS [${stripeId}]`, {
      mode,
      paymentAmountCents,
      paymentAmount: `$${(paymentAmountCents / 100).toFixed(2)}`,
      description,
      idempotencyKey
    });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
              description: description,
            },
            unit_amount: paymentAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_BASE_URL}/quotes/success?quoteId=${quoteId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL}/quotes/cancel?quoteId=${quoteId}`,
      customer_email: customerEmail,
      metadata: {
        quoteId,
        paymentMode: mode,
        customerEmail,
        amount: paymentAmountCents.toString()
      },
      payment_intent_data: {
        metadata: {
          quoteId,
          paymentMode: mode,
          customerEmail
        }
      }
    }, {
      idempotencyKey
    });

    logger.info(`✅ STRIPE CHECKOUT SESSION CREATED [${stripeId}]`, {
      quoteId,
      sessionId: session.id,
      mode,
      amount: paymentAmountCents,
      amountFormatted: `$${(paymentAmountCents / 100).toFixed(2)}`,
      customerEmail,
      checkoutUrl: session.url,
      successUrl: `${process.env.APP_BASE_URL}/quotes/success?quoteId=${quoteId}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.APP_BASE_URL}/quotes/cancel?quoteId=${quoteId}`
    });

    const result = {
      url: session.url!,
      sessionId: session.id,
      amount: paymentAmountCents / 100 // Convert back to dollars
    };

    logger.info(`💳 STRIPE CHECKOUT RESULT [${stripeId}]`, {
      checkoutUrl: result.url,
      sessionId: result.sessionId,
      amount: `$${result.amount.toFixed(2)}`,
      readyForEmail: true
    });

    return result;

        } catch (error) {
          logger.error(`❌ STRIPE CHECKOUT FAILED [${stripeId}]`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            quoteId,
            mode,
            customerEmail,
            totalCents,
            stack: error instanceof Error ? error.stack : undefined,
            stripeError: error
          });
          
          // Log specific Stripe error details
          if (error && typeof error === 'object' && 'type' in error) {
            logger.error(`❌ STRIPE API ERROR [${stripeId}]`, {
              type: (error as any).type,
              code: (error as any).code,
              message: (error as any).message,
              decline_code: (error as any).decline_code,
              param: (error as any).param
            });
          }
          
          throw error;
        }
};

/**
 * Retrieve an existing checkout session
 */
export const getCheckoutSession = async (sessionId: string) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    logger.error('Failed to retrieve Stripe checkout session', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId
    });
    throw error;
  }
};

/**
 * Check if a checkout session is completed and paid
 */
export const isCheckoutSessionPaid = async (sessionId: string): Promise<boolean> => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status === 'paid';
  } catch (error) {
    logger.error('Failed to check checkout session payment status', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId
    });
    return false;
  }
};

