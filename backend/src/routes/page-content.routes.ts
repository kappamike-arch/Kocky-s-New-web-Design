import { Router } from 'express';
import * as pageContentController from '../controllers/page-content.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/public/:slug', pageContentController.getPageContentBySlug);

// Protected routes - require authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// CRUD operations
router.get('/', pageContentController.getAllPageContent);
router.post('/', pageContentController.createPageContent);
router.put('/:id', pageContentController.updatePageContent);
router.delete('/:id', pageContentController.deletePageContent);
router.patch('/:id/toggle-status', pageContentController.togglePageStatus);

// File uploads
router.post('/:id/upload-hero-image', 
  pageContentController.uploadMiddleware.heroImage,
  pageContentController.uploadHeroImage
);
router.post('/:id/upload-hero-video',
  pageContentController.uploadMiddleware.heroVideo,
  pageContentController.uploadHeroVideo
);
router.post('/:id/upload-hero-logo',
  pageContentController.uploadMiddleware.heroLogo,
  pageContentController.uploadHeroLogo
);

export default router;
