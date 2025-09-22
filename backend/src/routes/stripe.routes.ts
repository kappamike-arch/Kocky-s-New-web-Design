import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  createCheckoutSession, 
  handleWebhook, 
  getPaymentStatus 
} from '../controllers/stripe.controller';
import express from 'express';

const router = Router();

// Stripe webhook endpoint (no authentication required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes (require authentication)
router.post('/create-checkout/:quoteId', authenticate, createCheckoutSession);
router.get('/payment-status/:quoteId', authenticate, getPaymentStatus);

export default router;

