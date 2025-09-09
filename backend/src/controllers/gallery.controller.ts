import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

// Configure multer for gallery images
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = '/home/stagingkockys/public_html/uploads/gallery';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Generate thumbnail
const generateThumbnail = async (imagePath: string, filename: string): Promise<string> => {
  const thumbnailDir = '/home/stagingkockys/public_html/uploads/gallery/thumbnails';
  await fs.mkdir(thumbnailDir, { recursive: true });
  
  const thumbnailPath = path.join(thumbnailDir, 'thumb-' + filename);
  
  await sharp(imagePath)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center'
    })
    .toFile(thumbnailPath);
  
  return `/uploads/gallery/thumbnails/thumb-${filename}`;
};

// Get all gallery items
export const getGalleryItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, isActive } = req.query;
    
    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    logger.error('Failed to fetch gallery items:', error);
    next(error);
  }
};

// Get gallery categories
export const getGalleryCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.galleryItem.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    });
    
    const uniqueCategories = categories
      .map(item => item.category)
      .filter(Boolean);
    
    res.json({
      success: true,
      data: uniqueCategories
    });
  } catch (error) {
    logger.error('Failed to fetch gallery categories:', error);
    next(error);
  }
};

// Create gallery item
export const createGalleryItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }
    
    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    const thumbnailUrl = await generateThumbnail(req.file.path, req.file.filename);
    
    const itemData = {
      ...req.body,
      imageUrl,
      thumbnailUrl,
      tags: req.body.tags ? JSON.parse(req.body.tags) : []
    };
    
    const item = await prisma.galleryItem.create({
      data: itemData
    });
    
    res.status(201).json({
      success: true,
      data: item,
      message: 'Gallery item created successfully'
    });
  } catch (error) {
    logger.error('Failed to create gallery item:', error);
    next(error);
  }
};

// Update gallery item
export const updateGalleryItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      tags: req.body.tags ? 
        (typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags) : 
        undefined
    };
    
    // If new image is uploaded
    if (req.file) {
      const imageUrl = `/uploads/gallery/${req.file.filename}`;
      const thumbnailUrl = await generateThumbnail(req.file.path, req.file.filename);
      updateData.imageUrl = imageUrl;
      updateData.thumbnailUrl = thumbnailUrl;
      
      // Try to delete old image and thumbnail
      const oldItem = await prisma.galleryItem.findUnique({
        where: { id }
      });
      
      if (oldItem?.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../../', oldItem.imageUrl);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          // File might not exist
        }
      }
      
      if (oldItem?.thumbnailUrl) {
        const oldThumbPath = path.join(__dirname, '../../../', oldItem.thumbnailUrl);
        try {
          await fs.unlink(oldThumbPath);
        } catch (err) {
          // File might not exist
        }
      }
    }
    
    const item = await prisma.galleryItem.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      data: item,
      message: 'Gallery item updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update gallery item:', error);
    next(error);
  }
};

// Delete gallery item
export const deleteGalleryItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Get item to delete associated files
    const item = await prisma.galleryItem.findUnique({
      where: { id }
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }
    
    // Delete from database
    await prisma.galleryItem.delete({
      where: { id }
    });
    
    // Try to delete image files
    if (item.imageUrl) {
      const imagePath = path.join(__dirname, '../../../', item.imageUrl);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        // File might not exist
      }
    }
    
    if (item.thumbnailUrl) {
      const thumbPath = path.join(__dirname, '../../../', item.thumbnailUrl);
      try {
        await fs.unlink(thumbPath);
      } catch (err) {
        // File might not exist
      }
    }
    
    res.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete gallery item:', error);
    next(error);
  }
};

// Toggle gallery item active status
export const toggleGalleryItemStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.galleryItem.findUnique({
      where: { id }
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }
    
    const updatedItem = await prisma.galleryItem.update({
      where: { id },
      data: { isActive: !item.isActive }
    });
    
    res.json({
      success: true,
      data: updatedItem,
      message: `Gallery item ${updatedItem.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    logger.error('Failed to toggle gallery item status:', error);
    next(error);
  }
};

// Bulk update gallery item order
export const updateGalleryItemOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body; // Array of { id, sortOrder }
    
    const updates = items.map((item: any) =>
      prisma.galleryItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder }
      })
    );
    
    await prisma.$transaction(updates);
    
    res.json({
      success: true,
      message: 'Gallery item order updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update gallery item order:', error);
    next(error);
  }
};

// Bulk upload gallery items
export const bulkUploadGalleryItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const { category, tags } = req.body;
    const parsedTags = tags ? JSON.parse(tags) : [];
    
    const items = await Promise.all(
      req.files.map(async (file: any) => {
        const imageUrl = `/uploads/gallery/${file.filename}`;
        const thumbnailUrl = await generateThumbnail(file.path, file.filename);
        
        return prisma.galleryItem.create({
          data: {
            title: path.parse(file.originalname).name,
            imageUrl,
            thumbnailUrl,
            category,
            tags: parsedTags
          }
        });
      })
    );
    
    res.status(201).json({
      success: true,
      data: items,
      message: `${items.length} gallery items uploaded successfully`
    });
  } catch (error) {
    logger.error('Failed to bulk upload gallery items:', error);
    next(error);
  }
};

// Bulk delete gallery items
export const bulkDeleteGalleryItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No item IDs provided'
      });
    }
    
    // Get items to delete associated files
    const items = await prisma.galleryItem.findMany({
      where: { id: { in: ids } }
    });
    
    // Delete from database
    await prisma.galleryItem.deleteMany({
      where: { id: { in: ids } }
    });
    
    // Try to delete image files
    await Promise.all(items.map(async (item) => {
      if (item.imageUrl) {
        const imagePath = path.join(__dirname, '../../../', item.imageUrl);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          // File might not exist
        }
      }
      
      if (item.thumbnailUrl) {
        const thumbPath = path.join(__dirname, '../../../', item.thumbnailUrl);
        try {
          await fs.unlink(thumbPath);
        } catch (err) {
          // File might not exist
        }
      }
    }));
    
    res.json({
      success: true,
      message: `${items.length} gallery items deleted successfully`
    });
  } catch (error) {
    logger.error('Failed to bulk delete gallery items:', error);
    next(error);
  }
};

// Export upload middleware
export const uploadMiddleware = {
  single: upload.single('image'),
  multiple: upload.array('images', 20) // Max 20 images at once
};