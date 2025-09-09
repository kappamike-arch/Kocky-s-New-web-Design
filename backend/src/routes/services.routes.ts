import { Router } from 'express';
import * as servicesController from '../controllers/services.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/services'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public route to get service settings
router.get('/:service', servicesController.getServiceSettings);

// Admin routes (require authentication)
// TODO: Re-enable authentication after testing
// router.use(authenticate);
// router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Update service settings
router.put('/:service', servicesController.updateServiceSettings);

// Upload service image
router.post('/:service/image', upload.single('image'), servicesController.uploadServiceImage);

export default router;

