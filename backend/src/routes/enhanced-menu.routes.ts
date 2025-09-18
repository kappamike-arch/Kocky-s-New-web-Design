import { Router } from 'express';
import * as enhancedMenuController from '../controllers/enhanced-menu.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public endpoint for frontend
router.get('/frontend', enhancedMenuController.getMenuForFrontend);

// Public routes
router.get('/items', enhancedMenuController.getMenuItems);
router.get('/type/:type', enhancedMenuController.getMenuByType);
router.get('/sections', enhancedMenuController.getMenuSections);

// Protected routes - require authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Menu items CRUD
router.post('/items', enhancedMenuController.createMenuItem);
router.put('/items/:id', enhancedMenuController.updateMenuItem);
router.delete('/items/:id', enhancedMenuController.deleteMenuItem);
router.patch('/items/:id/toggle-availability', enhancedMenuController.toggleMenuItemAvailability);
router.patch('/items/:id/toggle-featured', enhancedMenuController.toggleMenuItemFeatured);
router.post('/items/:id/upload-image',
  enhancedMenuController.uploadMenuItemImageMiddleware,
  enhancedMenuController.uploadMenuItemImage
);
router.put('/items/reorder', enhancedMenuController.updateMenuItemOrder);

// Menu sections CRUD
router.post('/sections', enhancedMenuController.createMenuSection);
router.put('/sections/:id', enhancedMenuController.updateMenuSection);
router.delete('/sections/:id', enhancedMenuController.deleteMenuSection);

export default router;
