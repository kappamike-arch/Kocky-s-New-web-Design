import { Router } from 'express';
import * as galleryController from '../controllers/gallery.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/items', galleryController.getGalleryItems);
router.get('/categories', galleryController.getGalleryCategories);

// Protected routes - require authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF));

// Gallery items CRUD
router.post('/items',
  galleryController.uploadMiddleware.single,
  galleryController.createGalleryItem
);
router.put('/items/:id',
  galleryController.uploadMiddleware.single,
  galleryController.updateGalleryItem
);
router.delete('/items/:id', galleryController.deleteGalleryItem);
router.patch('/items/:id/toggle-status', galleryController.toggleGalleryItemStatus);
router.put('/items/reorder', galleryController.updateGalleryItemOrder);

// Bulk upload
router.post('/bulk-upload',
  galleryController.uploadMiddleware.multiple,
  galleryController.bulkUploadGalleryItems
);

export default router;