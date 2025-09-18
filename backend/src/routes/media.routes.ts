import { Router } from 'express';
import { mediaController } from '../controllers/media.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// All media routes require admin authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// GET /api/media - Get all media files organized by category
router.get('/', mediaController.getAllMedia);

// GET /api/media/stats - Get media library statistics
router.get('/stats', mediaController.getMediaStats);

// GET /api/media/:category - Get media files from a specific category
router.get('/:category', mediaController.getMediaByCategory);

// DELETE /api/media/:category/:filename - Delete a specific media file
router.delete('/:category/:filename', mediaController.deleteMedia);

export default router;
