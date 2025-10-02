import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Save to backend/uploads/page-content (served by /uploads)
    const uploadDir = path.join(__dirname, '../../uploads/page-content');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for video uploads to /videos directory
const videoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Save to backend/videos (served by /videos)
    const uploadDir = path.join(__dirname, '../../videos');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use a more SEO-friendly filename for videos
    const pageId = req.params.id;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
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

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|webm|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /video/.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Get all page content
export const getAllPageContent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pages = await prisma.pageContent.findMany({
      orderBy: { slug: 'asc' }
    });
    
    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    logger.error('Failed to fetch page content:', error);
    next(error);
  }
};

// Get page content by slug
export const getPageContentBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    
    const page = await prisma.pageContent.findUnique({
      where: { slug }
    });
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    
    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    logger.error('Failed to fetch page content:', error);
    next(error);
  }
};

// Create page content
export const createPageContent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pageData = req.body;
    
    // Check if slug already exists
    const existing = await prisma.pageContent.findUnique({
      where: { slug: pageData.slug }
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Page with this slug already exists'
      });
    }
    
    const page = await prisma.pageContent.create({
      data: pageData
    });
    
    res.status(201).json({
      success: true,
      data: page,
      message: 'Page content created successfully'
    });
  } catch (error) {
    logger.error('Failed to create page content:', error);
    next(error);
  }
};

// Update page content
export const updatePageContent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const page = await prisma.pageContent.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      data: page,
      message: 'Page content updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update page content:', error);
    next(error);
  }
};

// Upload hero image
export const uploadHeroImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const imageUrl = `/uploads/page-content/${req.file.filename}`;
    
    const page = await prisma.pageContent.update({
      where: { id },
      data: { heroImage: imageUrl }
    });
    
    res.json({
      success: true,
      data: {
        imageUrl,
        page
      },
      message: 'Hero image uploaded successfully'
    });
  } catch (error) {
    logger.error('Failed to upload hero image:', error);
    next(error);
  }
};

// Upload hero video
export const uploadHeroVideo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    logger.info('Hero video upload request:', { 
      pageId: id, 
      file: req.file ? req.file.filename : 'No file',
      originalName: req.file?.originalname 
    });
    
    if (!req.file) {
      logger.error('No video file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Video files are saved directly to /videos/ directory
    const videoUrl = `/videos/${req.file.filename}`;
    
    logger.info('Updating page with video URL:', { pageId: id, videoUrl });
    
    const page = await prisma.pageContent.update({
      where: { id },
      data: { heroVideo: videoUrl }
    });
    
    logger.info('Hero video saved successfully:', { 
      pageId: id, 
      videoUrl,
      dbUpdated: !!page.heroVideo 
    });
    
    res.json({
      success: true,
      data: {
        videoUrl,
        page
      },
      message: 'Hero video uploaded successfully'
    });
  } catch (error) {
    logger.error('Failed to upload hero video:', error);
    next(error);
  }
};

// Upload hero logo
export const uploadHeroLogo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const logoUrl = `/uploads/page-content/${req.file.filename}`;
    
    const page = await prisma.pageContent.update({
      where: { id },
      data: { heroLogo: logoUrl }
    });
    
    res.json({
      success: true,
      data: {
        logoUrl,
        page
      },
      message: 'Hero logo uploaded successfully'
    });
  } catch (error) {
    logger.error('Failed to upload hero logo:', error);
    next(error);
  }
};

// Delete page content
export const deletePageContent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.pageContent.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Page content deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete page content:', error);
    next(error);
  }
};

// Toggle page active status
export const togglePageStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const page = await prisma.pageContent.findUnique({
      where: { id }
    });
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    
    const updatedPage = await prisma.pageContent.update({
      where: { id },
      data: { isActive: !page.isActive }
    });
    
    res.json({
      success: true,
      data: updatedPage,
      message: `Page ${updatedPage.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    logger.error('Failed to toggle page status:', error);
    next(error);
  }
};

// Export upload middleware
export const uploadMiddleware = {
  heroImage: upload.single('heroImage'),
  heroVideo: videoUpload.single('heroVideo'),
  heroLogo: upload.single('heroLogo')
};
