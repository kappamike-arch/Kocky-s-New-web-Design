import { Router } from 'express';
import * as emailTemplateController from '../controllers/email-template.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Email Template Studio compatible routes (no auth required for studio)
// These must come BEFORE the authentication middleware and generic routes
router.get('/studio/:templateId', emailTemplateController.getTemplateStudio);
router.put('/studio/:templateId', emailTemplateController.saveTemplateStudioData);

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Email template API is working', timestamp: new Date().toISOString() });
});

// All other email template routes require authentication and admin permissions
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Template management routes
router.get('/', emailTemplateController.getAllTemplates);
router.get('/name/:name', emailTemplateController.getTemplateByName);
router.get('/:id', emailTemplateController.getTemplate);
router.post('/', emailTemplateController.upsertTemplate);
router.put('/:id', emailTemplateController.updateTemplate);
router.delete('/:id', emailTemplateController.deleteTemplate);

// Preview and initialization
router.post('/:id/preview', emailTemplateController.previewTemplate);
router.post('/initialize', emailTemplateController.initializeDefaultTemplates);

export default router;
