import { Router } from 'express';
import * as simpleAuthController from '../controllers/simple-auth.controller';

const router = Router();

// Simple auth routes
router.post('/login', simpleAuthController.simpleLogin);
router.post('/logout', simpleAuthController.simpleLogout);
router.get('/session', simpleAuthController.simpleSession);
router.post('/log', simpleAuthController.simpleLog);

export default router;



