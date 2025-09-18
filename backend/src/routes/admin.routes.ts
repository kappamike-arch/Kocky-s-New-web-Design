import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', authorize(UserRole.SUPER_ADMIN), adminController.deleteUser);
router.put('/users/:id/role', authorize(UserRole.SUPER_ADMIN), adminController.updateUserRole);

// Reports
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/reservations', adminController.getReservationsReport);
router.get('/reports/orders', adminController.getOrdersReport);
router.get('/reports/export', adminController.exportReport);

// System logs
router.get('/logs', authorize(UserRole.SUPER_ADMIN), adminController.getSystemLogs);

// Backup and restore
router.post('/backup', authorize(UserRole.SUPER_ADMIN), adminController.createBackup);
router.post('/restore', authorize(UserRole.SUPER_ADMIN), adminController.restoreBackup);

export default router;
