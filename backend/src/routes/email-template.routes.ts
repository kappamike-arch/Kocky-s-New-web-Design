import { Router } from 'express';
import * as emailTemplateController from '../controllers/email-template.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// All email template routes require authentication and admin permissions
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Template management routes
router.get('/', emailTemplateController.getAllTemplates);
router.get('/:id', emailTemplateController.getTemplate);
router.get('/name/:name', emailTemplateController.getTemplateByName);
router.post('/', emailTemplateController.upsertTemplate);
router.put('/:id', emailTemplateController.updateTemplate);
router.delete('/:id', emailTemplateController.deleteTemplate);

// Preview and initialization
router.post('/:id/preview', emailTemplateController.previewTemplate);
router.post('/initialize', emailTemplateController.initializeDefaultTemplates);

// New simplified routes
router.post('/preview', emailTemplateController.previewTemplateDirect);
router.post('/send-test', emailTemplateController.sendTestEmail);

export default router;
