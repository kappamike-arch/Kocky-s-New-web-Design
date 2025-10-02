import { Router } from 'express';
import * as unifiedFormsController from '../controllers/unified-forms.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public route for all form submissions
router.post('/submit', unifiedFormsController.submitForm);

// Protected routes for CRM management
router.get(
  '/inquiries',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  unifiedFormsController.getInquiries
);

router.get(
  '/inquiries/:id',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  unifiedFormsController.getInquiryDetails
);

router.patch(
  '/inquiries/:id/status',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  unifiedFormsController.updateInquiryStatus
);

router.post(
  '/inquiries/:id/quote',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  unifiedFormsController.createQuoteFromInquiry
);

export default router;
