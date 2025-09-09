import { Router } from 'express';
import * as menuController from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', menuController.getAllMenuItems);
router.get('/categories', menuController.getCategories);
router.get('/featured', menuController.getFeaturedItems);
router.get('/happy-hour', menuController.getHappyHourSpecials);
router.get('/brunch', menuController.getBrunchItems);
router.get('/:id', menuController.getMenuItem);

// Protected routes - Admin/Staff
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  menuController.createMenuItem
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  menuController.updateMenuItem
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  menuController.deleteMenuItem
);

// Happy Hour management
router.post(
  '/happy-hour',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  menuController.createHappyHour
);

router.put(
  '/happy-hour/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  menuController.updateHappyHour
);

export default router;
