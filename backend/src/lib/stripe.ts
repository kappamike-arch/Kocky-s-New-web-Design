import Stripe from "stripe";
import { logger } from "../utils/logger";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

// Validate Stripe configuration
export const validateStripeConfig = async (): Promise<boolean> => {
  try {
    await stripe.balance.retrieve();
    logger.info("Stripe configuration validated successfully");
    return true;
  } catch (error) {
    logger.error("Stripe configuration validation failed", { error });
    return false;
  }
};

// Stripe webhook signature validation
export const validateWebhookSignature = (payload: string, signature: string): Stripe.Event => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    logger.error("Stripe webhook signature validation failed", { error });
    throw new Error("Invalid webhook signature");
  }
};

// Payment intent metadata type
export interface PaymentMetadata {
  quoteId: string;
  customerEmail: string;
  quoteNumber: string;
  paymentType: 'deposit' | 'full';
}

// Checkout session metadata type
export interface CheckoutMetadata {
  quoteId: string;
  customerEmail: string;
  quoteNumber: string;
  paymentType: 'deposit' | 'full';
  amount: number;
}
