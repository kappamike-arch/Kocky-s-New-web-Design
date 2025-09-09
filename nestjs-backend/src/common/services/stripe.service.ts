import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-07-30.basil',
      });
    }
  }

  async createPaymentLink(amount: number, description: string, metadata?: any) {
    return this.withRetry(async () => {
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      const product = await this.stripe.products.create({
        name: description,
        metadata,
      });

      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
      });

      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [{
          price: price.id,
          quantity: 1,
        }],
        metadata,
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${this.configService.get('FRONTEND_URL')}/payment-success`,
          },
        },
      });

      return paymentLink.url;
    });
  }

  async createCustomer(email: string, name: string, metadata?: any) {
    return this.withRetry(async () => {
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      return this.stripe.customers.create({
        email,
        name,
        metadata,
      });
    });
  }

  async createPaymentIntent(amount: number, customerId?: string, metadata?: any) {
    return this.withRetry(async () => {
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      return this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    });
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.withRetry(async () => {
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      return this.stripe.paymentIntents.retrieve(paymentIntentId);
    });
  }

  async createCheckoutSession(lineItems: any[], successUrl: string, cancelUrl: string, metadata?: any) {
    return this.withRetry(async () => {
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      return this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
      });
    });
  }

  async verifyWebhookSignature(payload: Buffer, signature: string): Promise<Stripe.Event> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error.message);
      throw error;
    }
  }

  private async withRetry<T>(operation: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`Stripe operation failed on attempt ${attempt}:`, error.message);

      if (attempt < this.maxRetries) {
        this.logger.log(`Retrying Stripe operation... Attempt ${attempt + 1}/${this.maxRetries}`);
        await this.delay(this.retryDelay * attempt); // Exponential backoff
        return this.withRetry(operation, attempt + 1);
      }

      // If Stripe is not configured, return mock data
      if (error.message === 'Stripe is not configured') {
        this.logger.warn('Stripe not configured, returning mock payment link');
        return 'https://checkout.stripe.com/mock-payment-link' as any;
      }

      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
