import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { logger } from '../utils/logger';

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../../uploads'),
    path.join(__dirname, '../../uploads/menu'),
    path.join(__dirname, '../../uploads/logos'),
    path.join(__dirname, '../../uploads/gallery'),
    path.join(__dirname, '../../uploads/hero'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created upload directory: ${dir}`);
    }
  });
};

// Initialize upload directories
createUploadDirs();

// Configure storage for different upload types
const createStorage = (uploadType: string) => {
  return multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      let uploadPath = path.join(__dirname, '../../uploads');
      
      // Determine upload path based on type
      switch (uploadType) {
        case 'menu':
          uploadPath = path.join(uploadPath, 'menu');
          break;
        case 'logo':
          uploadPath = path.join(uploadPath, 'logos');
          break;
        case 'gallery':
          uploadPath = path.join(uploadPath, 'gallery');
          break;
        case 'hero':
          uploadPath = path.join(uploadPath, 'hero');
          break;
        default:
          // Default to general uploads folder
          break;
      }

      // Ensure directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      logger.info(`Uploading file to: ${uploadPath}`);
      cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${basename}-${uniqueSuffix}${ext}`;
      
      logger.info(`Saving file as: ${filename}`);
      cb(null, filename);
    }
  });
};

// File filter for images
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`Rejected file upload: ${file.originalname} (${file.mimetype})`);
    cb(new Error(`Invalid file type. Only images are allowed. Received: ${file.mimetype}`));
  }
};

// Create multer instances for different upload types
export const uploadMenu = multer({
  storage: createStorage('menu'),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadLogo = multer({
  storage: createStorage('logo'),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadGallery = multer({
  storage: createStorage('gallery'),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
});

export const uploadHero = multer({
  storage: createStorage('hero'),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

// Generic upload for any file type
export const uploadGeneric = multer({
  storage: createStorage(''),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Helper function to get the public URL for an uploaded file
export const getUploadUrl = (filename: string, uploadType: string = ''): string => {
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
  
  if (uploadType) {
    return `${baseUrl}/uploads/${uploadType}/${filename}`;
  }
  return `${baseUrl}/uploads/${filename}`;
};

// Helper function to delete an uploaded file
export const deleteUploadedFile = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info(`Deleted file: ${fullPath}`);
    }
  } catch (error) {
    logger.error('Error deleting file:', error);
  }
};




