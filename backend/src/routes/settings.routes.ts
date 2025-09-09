import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes - get public settings
router.get('/public', settingsController.getPublicSettings);
router.get('/business-hours', settingsController.getBusinessHours);

// Protected routes - Admin only
// TODO: Re-enable authentication after testing
router.get(
  '/',
  // authenticate,
  // authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  settingsController.getAllSettings
);

router.put(
  '/',
  // authenticate,
  // authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  settingsController.updateSettings
);

router.put(
  '/business-hours',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  settingsController.updateBusinessHours
);

router.put(
  '/social-media',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  settingsController.updateSocialMedia
);

router.put(
  '/email',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  settingsController.updateEmailSettings
);

router.put(
  '/payment',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  settingsController.updatePaymentSettings
);

// Test email endpoint
router.post(
  '/test-email',
  // authenticate,
  // authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  settingsController.testEmailSettings
);

export default router;
