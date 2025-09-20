import { Request, Response } from 'express';
import { prisma } from '../server';
import { stripe, PaymentMetadata, CheckoutMetadata } from '../lib/stripe';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

// Create Stripe Checkout Session for quote payment
export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const { quoteId } = req.params;
    const { paymentType = 'full' } = req.body; // 'deposit' or 'full'

    // Get quote details
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        inquiry: true,
        quoteItems: true
      }
    });

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

    // Calculate payment amount
    const totalAmount = Number(quote.amount || 0);
    const depositAmount = Number(quote.depositAmount || 0);
    
    let paymentAmount: number;
    let description: string;

    if (paymentType === 'deposit' && depositAmount > 0) {
      paymentAmount = depositAmount;
      description = `Deposit for Quote ${quote.quoteNumber}`;
    } else {
      paymentAmount = totalAmount;
      description = `Payment for Quote ${quote.quoteNumber}`;
    }

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

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
            unit_amount: Math.round(paymentAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_BASE_URL}/quote/${quoteId}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL}/quote/${quoteId}/payment/cancel`,
      customer_email: quote.inquiry.email,
      metadata: {
        quoteId: quote.id,
        customerEmail: quote.inquiry.email,
        quoteNumber: quote.quoteNumber,
        paymentType: paymentType,
        amount: paymentAmount.toString()
      },
      payment_intent_data: {
        metadata: {
          quoteId: quote.id,
          customerEmail: quote.inquiry.email,
          quoteNumber: quote.quoteNumber,
          paymentType: paymentType
        }
      }
    });

    // Update quote with checkout session ID
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        stripePaymentId: session.id,
        paymentLink: session.url
      }
    });

    logger.info('Stripe checkout session created', {
      quoteId,
      sessionId: session.id,
      paymentType,
      amount: paymentAmount
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      amount: paymentAmount,
      paymentType
    });

  } catch (error) {
    logger.error('Failed to create Stripe checkout session', {
      error: error instanceof Error ? error.message : 'Unknown error',
      quoteId: req.params.quoteId
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
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      default:
        logger.info('Unhandled Stripe webhook event', { type: event.type });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
};

// Handle successful payment
const handlePaymentSuccess = async (paymentIntent: any) => {
  try {
    const { quoteId, paymentType } = paymentIntent.metadata as PaymentMetadata;
    
    if (!quoteId) {
      logger.warn('Payment intent missing quoteId metadata');
      return;
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId }
    });

    if (!quote) {
      logger.warn('Quote not found for payment intent', { quoteId });
      return;
    }

    // Update quote payment status
    const updateData: any = {
      stripePaymentId: paymentIntent.id,
      paidAt: new Date()
    };

    if (paymentType === 'deposit') {
      updateData.depositPaidAt = new Date();
      updateData.status = 'DEPOSIT_PAID';
    } else {
      updateData.status = 'PAID';
    }

    await prisma.quote.update({
      where: { id: quoteId },
      data: updateData
    });

    logger.info('Quote payment status updated', {
      quoteId,
      paymentType,
      status: updateData.status
    });

  } catch (error) {
    logger.error('Failed to handle payment success', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Handle failed payment
const handlePaymentFailure = async (paymentIntent: any) => {
  try {
    const { quoteId } = paymentIntent.metadata as PaymentMetadata;
    
    if (!quoteId) {
      logger.warn('Payment intent missing quoteId metadata');
      return;
    }

    logger.warn('Payment failed for quote', {
      quoteId,
      paymentIntentId: paymentIntent.id,
      failureCode: paymentIntent.last_payment_error?.code
    });

    // Optionally update quote status or send notification
    // For now, just log the failure

  } catch (error) {
    logger.error('Failed to handle payment failure', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Handle checkout session completion
const handleCheckoutCompleted = async (session: any) => {
  try {
    const { quoteId } = session.metadata as CheckoutMetadata;
    
    if (!quoteId) {
      logger.warn('Checkout session missing quoteId metadata');
      return;
    }

    logger.info('Checkout session completed', {
      quoteId,
      sessionId: session.id
    });

    // Additional logic for checkout completion if needed

  } catch (error) {
    logger.error('Failed to handle checkout completion', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get payment status for a quote
export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { quoteId } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        quoteNumber: true,
        status: true,
        amount: true,
        depositAmount: true,
        paidAt: true,
        depositPaidAt: true,
        stripePaymentId: true,
        paymentLink: true
      }
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    res.json({
      success: true,
      quote: {
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        amount: quote.amount,
        depositAmount: quote.depositAmount,
        paidAt: quote.paidAt,
        depositPaidAt: quote.depositPaidAt,
        hasPaymentLink: !!quote.paymentLink,
        paymentLink: quote.paymentLink
      }
    });

  } catch (error) {
    logger.error('Failed to get payment status', {
      error: error instanceof Error ? error.message : 'Unknown error',
      quoteId: req.params.quoteId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
};
