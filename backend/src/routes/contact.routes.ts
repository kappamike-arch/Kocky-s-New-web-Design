import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.post('/', contactController.createInquiry);

// Protected routes - Admin/Staff
// DEMO: Temporarily disable auth for frontend access
// router.get(
//   '/',
//   authenticate,
//   authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
//   contactController.getAllInquiries
// );
router.get('/', contactController.getAllInquiries);

// DEMO: Temporarily disable auth for frontend access
// router.get(
//   '/:id',
//   authenticate,
//   authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
//   contactController.getInquiry
// );
router.get('/:id', contactController.getInquiry);

router.put(
  '/:id/status',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  contactController.updateInquiryStatus
);

router.post(
  '/:id/respond',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  contactController.respondToInquiry
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  contactController.deleteInquiry
);

export default router;
