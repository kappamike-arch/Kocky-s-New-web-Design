import { Router } from 'express';
import * as foodTruckController from '../controllers/foodtruck.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.post('/', optionalAuth, foodTruckController.createBooking);
router.get('/confirmation/:confirmationCode', foodTruckController.getBookingByConfirmationCode);

// Protected routes - Admin/Staff
router.get(
  '/',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  foodTruckController.getAllBookings
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  foodTruckController.getBooking
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  foodTruckController.updateBooking
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  foodTruckController.deleteBooking
);

export default router;
