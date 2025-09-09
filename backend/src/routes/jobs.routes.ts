import { Router } from 'express';
import * as jobsController from '../controllers/jobs.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.post('/apply', jobsController.upload.single('resume'), jobsController.submitApplication);
router.get('/settings', jobsController.getPageSettings);

// Protected routes - Admin/Staff only
router.get(
  '/',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  jobsController.getAllApplications
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  jobsController.getApplication
);

router.put(
  '/:id/status',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  jobsController.updateApplicationStatus
);

router.get(
  '/:id/resume',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  jobsController.downloadResume
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  jobsController.deleteApplication
);

// Page settings routes (Admin only)
// TODO: Re-enable authentication after testing
router.put(
  '/settings',
  // authenticate,
  // authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  jobsController.updatePageSettings
);

router.post(
  '/settings/hero-image',
  // authenticate,
  // authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  jobsController.uploadHeroImage.single('heroImage'),
  jobsController.uploadHeroImageHandler
);

export default router;
