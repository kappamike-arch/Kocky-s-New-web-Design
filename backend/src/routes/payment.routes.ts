import { Router } from 'express';
import { createCheckoutSession, handleWebhook } from '../controllers/payment.controller';

const router = Router();

// Webhook endpoint (no authentication required, uses raw body)
router.post('/webhook', handleWebhook);

// Checkout session creation (public endpoint)
router.post('/checkout-session', createCheckoutSession);

export default router;

