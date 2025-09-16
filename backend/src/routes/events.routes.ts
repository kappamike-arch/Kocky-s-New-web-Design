import { Router } from 'express';
import * as eventsController from '../controllers/events.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure multer for events media
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadDir: string;
    
    if (file.fieldname === 'heroImage' || file.fieldname === 'image') {
      uploadDir = '/home/stagingkockys/public_html/uploads/images/events';
    } else if (file.fieldname === 'video') {
      uploadDir = '/home/stagingkockys/public_html/uploads/videos/events';
    } else {
      uploadDir = '/home/stagingkockys/public_html/uploads/images/events';
    }
    
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `event-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos, 5MB for images
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      // Video files
      const allowedTypes = /mp4|webm|mov/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = /video\/(mp4|webm|quicktime)/.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only MP4, WebM, and MOV video files are allowed'));
      }
    } else {
      // Image files
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  }
});

const router = Router();

// Public routes
router.get('/', eventsController.getEvents);
router.get('/:slug', eventsController.getEventBySlug);
router.post('/:id/rsvp', eventsController.createRSVP);
router.get('/:id/ics', eventsController.getEventICS);
router.post('/:id/reminders', eventsController.subscribeToReminders);

// Protected routes - require authentication for admin operations
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF));

// Admin CRUD operations
router.post('/', 
  upload.single('heroImage'),
  eventsController.createEvent
);
router.put('/:id', 
  upload.single('heroImage'),
  eventsController.updateEvent
);
router.delete('/:id', eventsController.deleteEvent);
router.patch('/:id/publish', eventsController.toggleEventPublish);

// File upload endpoints
router.post('/upload/image', 
  upload.single('image'),
  eventsController.uploadEventImage
);
router.post('/upload/video', 
  upload.single('video'),
  eventsController.uploadEventVideo
);

export default router;
