import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.post('/', optionalAuth, orderController.createOrder);
router.get('/confirmation/:confirmationCode', orderController.getOrderByConfirmationCode);
router.post('/calculate-total', orderController.calculateOrderTotal);

// Stripe webhook
router.post('/webhook', orderController.handleStripeWebhook);

// Protected routes - Customer
router.get('/my-orders', authenticate, orderController.getMyOrders);

// Protected routes - Admin/Staff
router.get(
  '/',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  orderController.getAllOrders
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  orderController.getOrder
);

router.put(
  '/:id/status',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  orderController.updateOrderStatus
);

router.post(
  '/:id/refund',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  orderController.refundOrder
);

export default router;
