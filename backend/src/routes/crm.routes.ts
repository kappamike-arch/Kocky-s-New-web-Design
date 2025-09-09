import { Router } from 'express';
import * as crmController from '../controllers/crm.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Temporarily disable auth for testing (TODO: re-enable after fixing auth)
// router.use(authenticate);
// router.use(authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Dashboard
router.get('/dashboard', crmController.getDashboardStats);
router.get('/stats', crmController.getDashboardStats);

// Inquiries
router.get('/inquiries', crmController.getInquiries);
router.get('/inquiries/export', crmController.exportInquiries);
router.get('/inquiries/:id', crmController.getInquiry);
router.put('/inquiries/:id', crmController.updateInquiry);
router.post('/inquiries/:id/notes', crmController.addNote);

// Quotes
router.post('/inquiries/:id/quotes', crmController.createQuote);
router.put('/quotes/:quoteId', crmController.updateQuote);
router.post('/quotes/:quoteId/send', crmController.sendQuoteEmail);

// Email accounts
router.get('/email-accounts', crmController.getEmailAccountsList);

export default router;
