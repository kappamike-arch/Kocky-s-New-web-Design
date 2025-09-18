import { Router, Request, Response } from 'express';
import { 
  getAllHeroSettings, 
  getHeroSettings, 
  updateHeroSettings,
  uploadLogo,
  saveAllHeroSettings
} from '../hero-settings-db';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const logosDir = path.join(uploadDir, 'logos');
// Use absolute paths to public_html/uploads for web-served files
const videosDir = '/home/stagingkockys/public_html/uploads/videos';
const imagesDir = '/home/stagingkockys/public_html/uploads/images';

if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Include page ID in filename for better organization
    const pageId = req.params.pageId;
    cb(null, `logo-${pageId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure multer for hero image uploads (to public_html/uploads/images)
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    // Use the expected filename format: pageId-hero.jpg
    const pageId = req.params.pageId;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${pageId}-hero${ext}`);
  }
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
    files: 1,
    fields: 10
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

const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
    files: 1, // Only allow 1 file at a time
    fields: 10 // Limit number of fields
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

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    // Use the expected filename format: pageId-hero.mp4
    const pageId = req.params.pageId;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${pageId}-hero${ext}`);
  }
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    files: 1,
    fields: 10
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

// Public route for getting hero settings (used by frontend)
router.get('/', async (req: Request, res: Response) => {
  try {
    const settings = await getAllHeroSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get hero settings'
    });
  }
});

// Public route for getting hero settings for a specific page (used by frontend)
router.get('/:pageId', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const settings = await getHeroSettings(pageId);
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: `Settings not found for page: ${pageId}`
      });
    }
    
    // Return settings directly for compatibility
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get hero settings'
    });
  }
});

// Upload hero image for a specific page (before auth middleware for testing)
router.post('/:pageId/upload-image', (req: Request, res: Response, next: any) => {
  uploadImage.single('image')(req, res, (err: any) => {
    if (err) {
      console.error('[Image Upload] Multer error:', err);
      
      // Handle specific multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.'
        });
      } else if (err.message === 'Only image files are allowed') {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else {
        return res.status(500).json({
          success: false,
          message: `Upload error: ${err.message || 'Failed to process upload'}`
        });
      }
    }
    
    // No multer error, continue to the actual route handler
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }
    
    console.log(`[Image Upload] Processing file for ${pageId}:`, {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // Save to public_html/uploads/images directory
    const imageUrl = `/uploads/images/${req.file.filename}`;
    
    // Update the hero settings with the new image URL
    const updatedSettings = await updateHeroSettings(pageId, { backgroundImage: imageUrl });
    
    if (!updatedSettings) {
      // Delete the uploaded file if settings update failed
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('[Image Upload] Failed to delete file after error:', unlinkError);
      }
      return res.status(404).json({
        success: false,
        message: `Settings not found for page: ${pageId}`
      });
    }
    
    console.log(`[Image Upload] Successfully saved image for ${pageId}:`, imageUrl);
    
    res.json({
      success: true,
      data: {
        imageUrl: imageUrl,
        settings: updatedSettings
      },
      message: 'Image uploaded successfully'
    });
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('[Image Upload] Failed to delete file after error:', unlinkError);
      }
    }
    console.error(`[Image Upload] Error for ${req.params.pageId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
});

// Upload video for a specific page (before auth middleware for testing)
router.post('/:pageId/upload-video', (req: Request, res: Response, next: any) => {
  uploadVideo.single('video')(req, res, (err: any) => {
    if (err) {
      console.error('[Video Upload] Multer error:', err);
      
      // Handle specific multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 100MB.'
        });
      } else if (err.message === 'Only video files are allowed') {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else {
        return res.status(500).json({
          success: false,
          message: `Upload error: ${err.message || 'Failed to process upload'}`
        });
      }
    }
    
    // No multer error, continue to the actual route handler
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }
    
    console.log(`[Video Upload] Processing file for ${pageId}:`, {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // Construct the URL for the uploaded video (served by web server)
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
    // Update the hero settings with the new video URL
    const updatedSettings = await updateHeroSettings(pageId, { backgroundVideo: videoUrl });
    
    if (!updatedSettings) {
      // Delete the uploaded file if settings update failed
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('[Video Upload] Failed to delete file after error:', unlinkError);
      }
      return res.status(404).json({
        success: false,
        message: `Settings not found for page: ${pageId}`
      });
    }
    
    console.log(`[Video Upload] Successfully saved video for ${pageId}:`, videoUrl);
    
    res.json({
      success: true,
      data: {
        videoUrl: videoUrl,
        settings: updatedSettings
      },
      message: 'Video uploaded successfully'
    });
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('[Video Upload] Failed to delete file after error:', unlinkError);
      }
    }
    console.error(`[Video Upload] Error for ${req.params.pageId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload video'
    });
  }
});

// Remove video for a specific page (before auth middleware for testing)
router.delete('/:pageId/video', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    
    console.log(`[Video Remove] Removing video for ${pageId}`);
    
    // Update the hero settings to remove the video URL
    const updatedSettings = await updateHeroSettings(pageId, { backgroundVideo: '' });
    
    if (!updatedSettings) {
      return res.status(404).json({
        success: false,
        message: `Settings not found for page: ${pageId}`
      });
    }
    
    console.log(`[Video Remove] Successfully removed video for ${pageId}`);
    
    res.json({
      success: true,
      data: updatedSettings,
      message: 'Video removed successfully'
    });
  } catch (error: any) {
    console.error(`[Video Remove] Error for ${req.params.pageId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove video'
    });
  }
});

// Upload logo for a specific page (before auth middleware for testing)
router.post('/:pageId/upload-logo', (req: Request, res: Response, next: any) => {
  upload.single('logo')(req, res, (err: any) => {
    if (err) {
      console.error('[Logo Upload] Multer error:', err);
      
      // Handle specific multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.'
        });
      } else if (err.message === 'Only image files are allowed') {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else {
        return res.status(500).json({
          success: false,
          message: `Upload error: ${err.message || 'Failed to process upload'}`
        });
      }
    }
    
    // No multer error, continue to the actual route handler
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file uploaded'
      });
    }
    
    console.log(`[Logo Upload] Processing file for ${pageId}:`, {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // Construct the URL for the uploaded logo
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    
    // Update the hero settings with the new logo URL
    const updatedSettings = await uploadLogo(pageId, logoUrl);
    
    if (!updatedSettings) {
      // Delete the uploaded file if settings update failed
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('[Logo Upload] Failed to delete file after error:', unlinkError);
      }
      return res.status(404).json({
        success: false,
        message: `Settings not found for page: ${pageId}`
      });
    }
    
    console.log(`[Logo Upload] Successfully saved logo for ${pageId}:`, logoUrl);
    
    res.json({
      success: true,
      data: {
        logoUrl: logoUrl,
        settings: updatedSettings
      },
      message: 'Logo uploaded successfully'
    });
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('[Logo Upload] Failed to delete file after error:', unlinkError);
      }
    }
    console.error(`[Logo Upload] Error for ${req.params.pageId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload logo'
    });
  }
});

// Protected routes - require authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Save all hero settings at once (batch update)
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data. Expected an array of settings.'
      });
    }
    
    console.log(`[Batch Save] Saving ${settings.length} hero settings...`);
    
    await saveAllHeroSettings(settings);
    
    res.json({
      success: true,
      message: `Successfully saved ${settings.length} page settings`
    });
  } catch (error: any) {
    console.error('[Batch Save] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save all hero settings'
    });
  }
});

// Update hero settings for a specific page
router.put('/:pageId', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const updatedSettings = await updateHeroSettings(pageId, req.body);
    
    if (!updatedSettings) {
      return res.status(404).json({
        success: false,
        message: `Settings not found for page: ${pageId}`
      });
    }
    
    res.json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update hero settings'
    });
  }
});

export default router;
