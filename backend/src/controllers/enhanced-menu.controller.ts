import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure multer for menu item images
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = '/home/stagingkockys/public_html/uploads/menu-items';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const basename = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    cb(null, basename + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

// Get all menu items with filtering
export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { menuType, category, sectionId, featured, available } = req.query;
    
    const where: any = {};
    if (menuType) where.menuType = menuType;
    if (category) where.category = category;
    if (sectionId) where.sectionId = sectionId;
    if (featured !== undefined) where.featured = featured === 'true';
    if (available !== undefined) where.available = available === 'true';
    
    const items = await prisma.menuItem.findMany({
      where,
      include: {
        section: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    logger.error('Failed to fetch menu items:', error);
    next(error);
  }
};

// Get menu items by type (for frontend)
export const getMenuByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;
    
    const sections = await prisma.menuSection.findMany({
      where: {
        menuType: type as any,
        isActive: true
      },
      include: {
        menuItems: {
          where: { available: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    logger.error('Failed to fetch menu by type:', error);
    next(error);
  }
};

// Create menu item
export const createMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const itemData = req.body;
    
    const item = await prisma.menuItem.create({
      data: {
        ...itemData,
        tags: itemData.tags || [],
        allergens: itemData.allergens || []
      },
      include: {
        section: true
      }
    });
    
    res.status(201).json({
      success: true,
      data: item,
      message: 'Menu item created successfully'
    });
  } catch (error) {
    logger.error('Failed to create menu item:', error);
    next(error);
  }
};

// Update menu item
export const updateMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const item = await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        section: true
      }
    });
    
    res.json({
      success: true,
      data: item,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update menu item:', error);
    next(error);
  }
};

// Upload menu item image
export const uploadMenuItemImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const imageUrl = `/uploads/menu-items/${req.file.filename}`;
    
    const item = await prisma.menuItem.update({
      where: { id },
      data: { image: imageUrl },
      include: {
        section: true
      }
    });
    
    res.json({
      success: true,
      data: {
        imageUrl,
        item
      },
      message: 'Menu item image uploaded successfully'
    });
  } catch (error) {
    logger.error('Failed to upload menu item image:', error);
    next(error);
  }
};

// Delete menu item
export const deleteMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if item exists and get image path
    const item = await prisma.menuItem.findUnique({
      where: { id }
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    // Delete the item
    await prisma.menuItem.delete({
      where: { id }
    });
    
    // Try to delete associated image file if exists
    if (item.image) {
      const imagePath = path.join(__dirname, '../../../', item.image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        // Image might not exist, continue
      }
    }
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete menu item:', error);
    next(error);
  }
};

// Toggle menu item availability
export const toggleMenuItemAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.menuItem.findUnique({
      where: { id }
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: { available: !item.available },
      include: {
        section: true
      }
    });
    
    res.json({
      success: true,
      data: updatedItem,
      message: `Menu item ${updatedItem.available ? 'made available' : 'made unavailable'}`
    });
  } catch (error) {
    logger.error('Failed to toggle menu item availability:', error);
    next(error);
  }
};

// Toggle menu item featured status
export const toggleMenuItemFeatured = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.menuItem.findUnique({
      where: { id }
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: { featured: !item.featured },
      include: {
        section: true
      }
    });
    
    res.json({
      success: true,
      data: updatedItem,
      message: `Menu item ${updatedItem.featured ? 'featured' : 'unfeatured'}`
    });
  } catch (error) {
    logger.error('Failed to toggle menu item featured status:', error);
    next(error);
  }
};

// Bulk update menu item order
export const updateMenuItemOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body; // Array of { id, sortOrder }
    
    const updates = items.map((item: any) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder }
      })
    );
    
    await prisma.$transaction(updates);
    
    res.json({
      success: true,
      message: 'Menu item order updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update menu item order:', error);
    next(error);
  }
};

// MENU SECTIONS MANAGEMENT

// Get all menu sections
export const getMenuSections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { menuType } = req.query;
    
    const where: any = {};
    if (menuType) where.menuType = menuType;
    
    const sections = await prisma.menuSection.findMany({
      where,
      orderBy: [
        { menuType: 'asc' },
        { sortOrder: 'asc' }
      ]
    });
    
    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    logger.error('Failed to fetch menu sections:', error);
    next(error);
  }
};

// Create menu section
export const createMenuSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sectionData = req.body;
    
    const section = await prisma.menuSection.create({
      data: sectionData
    });
    
    res.status(201).json({
      success: true,
      data: section,
      message: 'Menu section created successfully'
    });
  } catch (error) {
    logger.error('Failed to create menu section:', error);
    next(error);
  }
};

// Update menu section
export const updateMenuSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const section = await prisma.menuSection.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      data: section,
      message: 'Menu section updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update menu section:', error);
    next(error);
  }
};

// Delete menu section
export const deleteMenuSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if section has menu items
    const itemCount = await prisma.menuItem.count({
      where: { sectionId: id }
    });
    
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete section with ${itemCount} menu items. Please move or delete items first.`
      });
    }
    
    await prisma.menuSection.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Menu section deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete menu section:', error);
    next(error);
  }
};

// Get menu data for frontend (public endpoint)
export const getMenuForFrontend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { menuType = 'REGULAR' } = req.query;
    
    const sections = await prisma.menuSection.findMany({
      where: {
        menuType: menuType as any,
        isActive: true
      },
      include: {
        menuItems: {
          where: {
            available: true
          },
          orderBy: [
            { featured: 'desc' },
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });
    
    // Format the response for frontend consumption
    const formattedSections = sections.map(section => ({
      id: section.id,
      name: section.name,
      description: section.description,
      displayMode: section.displayMode,
      items: section.menuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: section.displayMode === 'TITLE_ONLY' ? null : item.description,
        price: section.displayMode === 'TITLE_ONLY' ? null : parseFloat(item.price.toString()),
        happyHourPrice: item.happyHourPrice && section.displayMode !== 'TITLE_ONLY' 
          ? parseFloat(item.happyHourPrice.toString()) 
          : null,
        image: section.displayMode === 'TITLE_ONLY' ? null : item.image,
        category: item.category,
        servingSize: section.displayMode === 'TITLE_ONLY' ? null : item.servingSize,
        featured: item.featured,
        tags: item.tags || [],
        allergens: item.allergens || [],
        available: item.available
      }))
    }));
    
    // Also get featured items across all sections
    const featuredItems = await prisma.menuItem.findMany({
      where: {
        menuType: menuType as any,
        featured: true,
        available: true
      },
      include: {
        section: true
      },
      orderBy: {
        sortOrder: 'asc'
      },
      take: 6
    });
    
    res.json({
      success: true,
      data: {
        sections: formattedSections,
        featured: featuredItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price.toString()),
          happyHourPrice: item.happyHourPrice ? parseFloat(item.happyHourPrice.toString()) : null,
          image: item.image,
          category: item.category,
          servingSize: item.servingSize,
          featured: item.featured,
          tags: item.tags || [],
          allergens: item.allergens || [],
          available: item.available,
          section: item.section?.name
        }))
      }
    });
  } catch (error) {
    logger.error('Failed to get menu for frontend:', error);
    next(error);
  }
};

// Export upload middleware
export const uploadMenuItemImageMiddleware = upload.single('image');
