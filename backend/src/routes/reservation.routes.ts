import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createReservationSchema,
  updateReservationSchema,
  getReservationSchema,
  queryReservationsSchema,
} from '../validations/reservation.validation';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.post(
  '/',
  optionalAuth,
  validate(createReservationSchema),
  reservationController.createReservation
);
router.get(
  '/check-availability',
  reservationController.checkAvailability
);
router.get(
  '/confirmation/:confirmationCode',
  reservationController.getReservationByConfirmationCode
);

// Protected routes - Customer
router.get(
  '/my-reservations',
  authenticate,
  reservationController.getMyReservations
);

// Protected routes - Admin/Staff
router.get(
  '/',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(queryReservationsSchema),
  reservationController.getAllReservations
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(getReservationSchema),
  reservationController.getReservation
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(updateReservationSchema),
  reservationController.updateReservation
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(getReservationSchema),
  reservationController.deleteReservation
);

// Admin actions
router.post(
  '/:id/confirm',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(getReservationSchema),
  reservationController.confirmReservation
);

router.post(
  '/:id/cancel',
  authenticate,
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(getReservationSchema),
  reservationController.cancelReservation
);

export default router;
