import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAzureEmailStatus,
  testAzureEmail,
  getAzureEmailConfig,
  setEmailProvider,
  sendEmail
} from '../controllers/azure-email.controller';

const router = Router();

// All Azure email routes require authentication and admin role
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

// Get Azure email service status and configuration
router.get('/status', getAzureEmailStatus);

// Get Azure email configuration (without sensitive data)
router.get('/config', getAzureEmailConfig);

// Test email service
router.post('/test', testAzureEmail);

// Set preferred email provider
router.post('/provider', setEmailProvider);

// Send email via specific provider
router.post('/send', sendEmail);

export default router;

