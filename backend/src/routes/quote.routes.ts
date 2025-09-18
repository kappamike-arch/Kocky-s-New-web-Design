import { Router } from 'express';
import * as quoteController from '../controllers/quote.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Temporarily disabled authentication for testing
// router.use(authenticate);
// router.use(authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Quote management routes
router.get('/', quoteController.getAllQuotes); // Get all quotes with filters
router.get('/:id', quoteController.getQuote); // Get single quote
router.put('/:id', quoteController.updateQuote); // Update quote
router.delete('/:id', quoteController.deleteQuote); // Delete quote

// Quote status management
router.put('/:id/status', quoteController.updateQuoteStatus); // Update quote status (Draft, Sent, Accepted, Paid, etc.)

// Quote actions
router.post('/:id/send', quoteController.sendQuote); // Send quote to customer
router.post('/:id/clone', quoteController.cloneQuote); // Clone quote (create revision)

// PDF management
router.get('/:id/pdf', quoteController.generateQuotePDF); // Download PDF
router.get('/:id/pdf/preview', quoteController.previewQuotePDF); // Preview PDF inline
router.post('/:id/pdf/save', quoteController.saveQuotePDF); // Save PDF to server
router.post('/:id/pdf/email', quoteController.emailQuotePDF); // Email PDF to customer

// Inquiry-related quote routes
router.post('/inquiry/:inquiryId', quoteController.createQuote); // Create quote for inquiry
router.get('/inquiry/:inquiryId/quotes', quoteController.getQuotesByInquiry); // Get all quotes for an inquiry

export default router;
