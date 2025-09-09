import { Router } from 'express';
import * as quoteConfigController from '../controllers/quote-config.controller';
// import { authenticate, authorize } from '../middleware/auth';
// import { UserRole } from '@prisma/client';

const router = Router();

// TODO: Re-enable authentication after testing
// router.use(authenticate);
// router.use(authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Get all configurations for quote creation
router.get('/all', quoteConfigController.getQuoteConfigurations);

// Initialize default configurations
router.post('/initialize', quoteConfigController.initializeDefaults);

// Package routes
router.get('/packages', quoteConfigController.getAllPackages);
router.post('/packages', quoteConfigController.createPackage);
router.put('/packages/:id', quoteConfigController.updatePackage);
router.delete('/packages/:id', quoteConfigController.deletePackage);

// Item routes
router.get('/items', quoteConfigController.getAllItems);
router.post('/items', quoteConfigController.createItem);
router.put('/items/:id', quoteConfigController.updateItem);
router.delete('/items/:id', quoteConfigController.deleteItem);

// Labor routes
router.get('/labor', quoteConfigController.getAllLabor);
router.post('/labor', quoteConfigController.createLabor);
router.put('/labor/:id', quoteConfigController.updateLabor);
router.delete('/labor/:id', quoteConfigController.deleteLabor);

// Tax routes
router.get('/taxes', quoteConfigController.getAllTaxes);
router.post('/taxes', quoteConfigController.createTax);
router.put('/taxes/:id', quoteConfigController.updateTax);
router.delete('/taxes/:id', quoteConfigController.deleteTax);

// Gratuity routes
router.get('/gratuities', quoteConfigController.getAllGratuities);
router.post('/gratuities', quoteConfigController.createGratuity);
router.put('/gratuities/:id', quoteConfigController.updateGratuity);
router.delete('/gratuities/:id', quoteConfigController.deleteGratuity);

export default router;
