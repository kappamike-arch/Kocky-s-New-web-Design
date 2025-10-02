import { Router } from 'express';
import * as mobileBarController from '../controllers/mobilebar.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.post('/', optionalAuth, mobileBarController.createBooking);
router.get('/packages', mobileBarController.getPackages);
router.get('/confirmation/:confirmationCode', mobileBarController.getBookingByConfirmationCode);

// Protected routes - Admin/Staff
router.get(
  '/',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  mobileBarController.getAllBookings
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  mobileBarController.getBooking
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  mobileBarController.updateBooking
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  mobileBarController.deleteBooking
);

export default router;
