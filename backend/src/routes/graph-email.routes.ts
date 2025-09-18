import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  configureMicrosoftApp,
  getAuthorizationUrl,
  handleOAuthCallback,
  getAuthStatus,
  getEmailAccounts,
  updateEmailAccounts,
  getEmailTemplates,
  updateEmailTemplate,
  sendEmail,
  sendTestEmail
} from '../controllers/graph-email.controller';

const router = Router();

// OAuth callback doesn't require authentication (it's the callback from Microsoft)
router.get('/oauth/callback', handleOAuthCallback);

// Public status endpoint (for checking if OAuth is configured)
router.get('/status', getAuthStatus);

// All other routes require authentication and admin role
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

// Microsoft App configuration
router.post('/configure', configureMicrosoftApp);
router.get('/auth-url', getAuthorizationUrl);

// Email accounts management
router.get('/accounts', getEmailAccounts);
router.put('/accounts', updateEmailAccounts);

// Email templates
router.get('/templates', getEmailTemplates);
router.put('/templates/:templateId', updateEmailTemplate);

// Send emails
router.post('/send', sendEmail);
router.post('/test', sendTestEmail);

export default router;



