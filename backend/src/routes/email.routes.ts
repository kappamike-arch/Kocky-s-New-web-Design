import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getEmailSettings,
  updateEmailSettings,
  sendTestEmail,
  getEmailLogs,
  resendEmail,
  getEmailTemplates,
  getEmailContacts,
  getEmailCampaigns,
  getEmailAnalytics
} from '../controllers/email.controller';

const router = Router();

// Health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Email API',
    timestamp: new Date().toISOString() 
  });
});

// All email routes require authentication and admin role
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

// Email settings
router.get('/settings', getEmailSettings);
router.put('/settings', updateEmailSettings);

// Test email
router.post('/test', sendTestEmail);

// Email logs
router.get('/logs', getEmailLogs);
router.post('/logs/:id/resend', resendEmail);

// Email templates
router.get('/templates', getEmailTemplates);

// Email contacts (newsletter subscribers)
router.get('/contacts', getEmailContacts);

// Email campaigns
router.get('/campaigns', getEmailCampaigns);

// Email analytics
router.get('/analytics', getEmailAnalytics);

export default router;
