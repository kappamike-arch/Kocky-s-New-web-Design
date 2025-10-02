import { Router } from 'express';
import * as newsletterController from '../controllers/newsletter.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);
router.get('/verify/:token', newsletterController.verifySubscription);

// Protected routes - Admin
router.get(
  '/subscribers',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  newsletterController.getAllSubscribers
);

router.post(
  '/send-campaign',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  newsletterController.sendCampaign
);

router.post(
  '/sync-mailchimp',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  newsletterController.syncWithMailchimp
);

router.delete(
  '/subscribers/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  newsletterController.deleteSubscriber
);

export default router;
