import { Router } from 'express';
import * as calendarController from '../controllers/calendar.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public iCal feed (with optional token authentication)
// Employees can subscribe to this URL in their calendar apps
router.get('/ical', (req, res, next) => {
  // Optional: Add token validation for security
  // const token = req.query.token;
  // if (token !== process.env.CALENDAR_TOKEN) {
  //   return res.status(401).json({ error: 'Invalid token' });
  // }
  calendarController.getICalFeed(req, res, next);
});

// Protected routes - require authentication
router.use(authenticate);

// JSON events endpoint for frontend calendar
router.get(
  '/events',
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  calendarController.getAllEvents
);

// Statistics endpoint
router.get(
  '/stats',
  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  calendarController.getEventStats
);

export default router;
