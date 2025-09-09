import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

// Public analytics routes (no authentication required)
router.post('/pageview', analyticsController.trackPageView);
router.post('/event', analyticsController.trackEvent);
router.post('/track/click', analyticsController.trackClick);
router.post('/track/conversion', analyticsController.trackConversion);

// Admin analytics routes (authentication required)
router.get('/dashboard', analyticsController.getDashboard);

export default router;
