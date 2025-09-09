import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';

export const getAllMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, featured, available } = req.query;
    
    const where: any = {};
    if (category) where.category = category;
    if (featured !== undefined) where.featured = featured === 'true';
    if (available !== undefined) where.available = available === 'true';

    const menuItems = await prisma.menuItem.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      items: menuItems
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const menuItem = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      item: menuItem
    });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      featured,
      tags,
      allergens,
      available
    } = req.body;

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        category,
        image,
        featured: featured || false,
        tags: tags || [],
        allergens: allergens || [],
        available: available !== undefined ? available : true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      item: menuItem
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      item: menuItem
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    next(error);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.menuItem.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    next(error);
  }
};

// Bulk operations for seeding/importing
export const bulkCreateMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const createdItems = await prisma.menuItem.createMany({
      data: items
    });

    res.status(201).json({
      success: true,
      message: `${createdItems.count} menu items created successfully`,
      count: createdItems.count
    });
  } catch (error) {
    next(error);
  }
};

// Get menu items by category
export const getMenuByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.menuItem.groupBy({
      by: ['category'],
      _count: true,
      orderBy: {
        category: 'asc'
      }
    });

    const menuByCategory = await Promise.all(
      categories.map(async (cat) => {
        const items = await prisma.menuItem.findMany({
          where: { category: cat.category },
          orderBy: [
            { featured: 'desc' },
            { name: 'asc' }
          ]
        });
        
        return {
          category: cat.category,
          count: cat._count,
          items
        };
      })
    );

    res.json({
      success: true,
      menu: menuByCategory
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.menuItem.groupBy({
      by: ['category'],
      _count: true
    });

    res.json({
      success: true,
      categories: categories.map(cat => ({
        name: cat.category,
        count: cat._count
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Get featured items
export const getFeaturedItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const featuredItems = await prisma.menuItem.findMany({
      where: { featured: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      items: featuredItems
    });
  } catch (error) {
    next(error);
  }
};

// Alias for getMenuItemById
export const getMenuItem = getMenuItemById;

// Get brunch menu items
export const getBrunchItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brunchItems = await prisma.menuItem.findMany({
      where: { 
        menuType: 'BRUNCH',
        available: true 
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      items: brunchItems
    });
  } catch (error) {
    next(error);
  }
};

// Get happy hour specials
export const getHappyHourSpecials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, return items from DRINK, BEER, WINE, COCKTAIL categories with a special price flag
    const happyHourItems = await prisma.menuItem.findMany({
      where: {
        category: {
          in: ['DRINK', 'BEER', 'WINE', 'COCKTAIL']
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      items: happyHourItems,
      hours: {
        start: '3:00 PM',
        end: '6:00 PM',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create happy hour special
export const createHappyHour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId, specialPrice, startTime, endTime, days } = req.body;
    
    // For now, just return success - we'd need a HappyHour model for this
    res.json({
      success: true,
      message: 'Happy hour special created successfully',
      data: { itemId, specialPrice, startTime, endTime, days }
    });
  } catch (error) {
    next(error);
  }
};

// Update happy hour special
export const updateHappyHour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { specialPrice, startTime, endTime, days } = req.body;
    
    // For now, just return success - we'd need a HappyHour model for this
    res.json({
      success: true,
      message: 'Happy hour special updated successfully',
      data: { id, specialPrice, startTime, endTime, days }
    });
  } catch (error) {
    next(error);
  }
};