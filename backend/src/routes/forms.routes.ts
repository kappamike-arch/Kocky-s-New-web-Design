import { Router } from 'express';
import * as formsController from '../controllers/forms.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.post('/submit', formsController.submitForm);
router.get('/confirmation/:code', formsController.getByConfirmationCode);

// Protected routes - Admin/Staff
router.get(
  '/submissions',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  formsController.getAllSubmissions
);

export default router;

