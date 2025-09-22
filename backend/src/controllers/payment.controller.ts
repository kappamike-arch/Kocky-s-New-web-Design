import { Request, Response } from 'express';
import { stripe } from '../lib/stripe';
import { QuoteService } from '../services/quote.service';
import { logger } from '../utils/logger';

// Create Stripe Checkout Session for quote payment
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { quoteId, mode } = req.body;

    if (!quoteId || !mode || !['deposit', 'full'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. quoteId and mode (deposit|full) are required.'
      });
    }

    // Get quote with calculated totals
    const quote = await QuoteService.getQuoteWithTotals(quoteId);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (!quote.inquiry) {
      return res.status(400).json({
        success: false,
        message: 'Quote inquiry not found'
      });
    }

    // Calculate payment amount in cents
    let amountCents: number;
    let description: string;

    if (mode === 'deposit') {
      amountCents = Math.round(quote.calculatedTotal * (quote.calculatedDepositPct ?? 0.2) * 100);
      description = `Deposit for Quote ${quote.quoteNumber}`;
    } else {
      amountCents = Math.round(quote.calculatedTotal * 100);
      description = `Full payment for Quote ${quote.quoteNumber}`;
    }

    if (amountCents <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Create idempotency key
    const idempotencyKey = `checkout-${quoteId}-${mode}`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Quote ${quote.quoteNumber}`,
              description: description,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_BASE_URL}/quotes/${quoteId}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL}/quotes/${quoteId}?canceled=1`,
      customer_email: quote.inquiry.email,
      client_reference_id: quoteId,
      metadata: {
        quoteId,
        mode,
        customerEmail: quote.inquiry.email
      }
    }, {
      idempotencyKey
    });

    // Attach payment session to quote
    await QuoteService.attachPaymentSession(quoteId, session.id, mode);

    logger.info('Checkout session created', {
      quoteId,
      sessionId: session.id,
      mode,
      amountCents
    });

    res.json({
      url: session.url
    });

  } catch (error) {
    logger.error('Failed to create checkout session', {
      error: error instanceof Error ? error.message : 'Unknown error',
      quoteId: req.body.quoteId,
      mode: req.body.mode
    });

    res.status(500).json({
      success: false,
      message: 'Failed to create payment session'
    });
  }
};

// Handle Stripe webhook events
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const payload = req.body;

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    logger.info('Stripe webhook received', {
      type: event.type,
      id: event.id
    });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      
      default:
        logger.info('Unhandled Stripe webhook event', { type: event.type });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Always return 2xx to avoid Stripe retry storms
    res.status(200).json({ error: 'Webhook processing failed' });
  }
};

// Handle checkout session completion
const handleCheckoutCompleted = async (session: any) => {
  try {
    const { quoteId, mode } = session.metadata;
    
    if (!quoteId || !mode) {
      logger.warn('Checkout session missing required metadata', {
        sessionId: session.id,
        metadata: session.metadata
      });
      return;
    }

    // Update quote status based on payment mode
    if (mode === 'deposit') {
      await QuoteService.markDepositPaid(quoteId, session.id);
    } else {
      await QuoteService.markPaid(quoteId, session.id);
    }

    logger.info('Checkout session completed successfully', {
      quoteId,
      sessionId: session.id,
      mode
    });

  } catch (error) {
    logger.error('Failed to handle checkout completion', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: session.id
    });
  }
};

// Handle charge refunded
const handleChargeRefunded = async (charge: any) => {
  try {
    // Extract quote ID from charge metadata or session
    const quoteId = charge.metadata?.quoteId;
    
    if (!quoteId) {
      logger.warn('Charge refund missing quoteId metadata', {
        chargeId: charge.id
      });
      return;
    }

    await QuoteService.markRefunded(quoteId, charge.id);

    logger.info('Charge refunded successfully', {
      quoteId,
      chargeId: charge.id
    });

  } catch (error) {
    logger.error('Failed to handle charge refund', {
      error: error instanceof Error ? error.message : 'Unknown error',
      chargeId: charge.id
    });
  }
};

