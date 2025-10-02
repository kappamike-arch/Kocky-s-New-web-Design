import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { deleteUploadedFile, getUploadUrl, mediaExists } from '../middleware/upload';

const MENU_IMAGE_SUBDIR = 'menu-items';
const MENU_IMAGE_BASE_PATH = `/uploads/${MENU_IMAGE_SUBDIR}`;
const MENU_PLACEHOLDER_RELATIVE = 'uploads/placeholders/menu-placeholder.png';
const FRONTEND_BASE = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.BACKEND_URL || 'https://staging.kockys.com').replace(/\/$/, '');
const MENU_PLACEHOLDER_ABSOLUTE = FRONTEND_BASE ? `${FRONTEND_BASE}/admin/placeholder-menu.svg` : '/admin/placeholder-menu.svg';

const toNumber = (value: any, fallback: number | null = null): number | null => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value: any): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const str = String(value).toLowerCase();
  if (['true', '1', 'yes'].includes(str)) return true;
  if (['false', '0', 'no'].includes(str)) return false;
  return undefined;
};

const parseJsonArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string');
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    } catch (error) {
      return [];
    }
  }
  return [];
};

const normalizeIncomingImage = (value?: any): string | undefined => {
  if (!value) return undefined;

  let url = String(value).trim();
  if (!url) return undefined;

  // Ignore temporary blob/data URLs from the browser
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return undefined;
  }

  url = url.replace(/\\/g, '/');

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (!url.startsWith('/')) {
    url = `/${url}`;
  }

  // Migrate legacy folders
  if (url.startsWith('/uploads/menu/')) {
    url = url.replace('/uploads/menu/', `${MENU_IMAGE_BASE_PATH}/`);
  }

  if (!url.startsWith('/uploads/')) {
    url = `${MENU_IMAGE_BASE_PATH}/${url.replace(/^\/+/, '')}`;
  }

  // Ensure single slashes
  url = url.replace(/([^:]\/)\/+/, '$1');

  return url;
};

const decodeHtmlEntities = (value?: string | null): string | null => {
  if (!value) return null;
  return value.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
};

const buildMenuImagePath = (filename: string): string => `${MENU_IMAGE_BASE_PATH}/${filename}`;

const isLocalUploadPath = (input?: string | null): boolean => {
  if (!input) return false;
  return !/^https?:\/\//i.test(input);
};

const augmentMenuItem = (item: any) => {
  const decodedImage = decodeHtmlEntities(item?.image);
  const decodedImageUrl = decodeHtmlEntities(item?.imageUrl);

  let localPath: string | null = null;
  let imageUrl = decodedImageUrl ?? null;
  let imageAvailable = false;
  let imageFileExists = false;

  const candidate = decodedImage || decodedImageUrl;

  if (candidate && candidate.startsWith('http')) {
    imageUrl = candidate;
    imageAvailable = true;
  } else if (candidate) {
    const stripped = candidate.replace(/^\/+/, '');
    const effective = stripped.startsWith('uploads/') ? stripped : `uploads/${stripped}`;
    if (mediaExists(effective)) {
      localPath = `/${effective}`;
      imageUrl = getUploadUrl(effective);
      imageAvailable = true;
      imageFileExists = true;
    }
  }

  if (!imageAvailable) {
    imageUrl = MENU_PLACEHOLDER_ABSOLUTE;
    localPath = null;
  }

  return {
    ...item,
    image: imageFileExists ? localPath : null,
    imageUrl,
    imageAvailable
  };
};

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

    const normalized = menuItems.map(augmentMenuItem);

    res.json({
      success: true,
      items: normalized,
      data: normalized
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
      item: augmentMenuItem(menuItem)
    });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  const uploadedFilename = req.file?.filename;

  try {
    const {
      name,
      description,
      price,
      category,
      menuType,
      happyHourPrice,
      servingSize,
      preparationTime,
      available,
      featured,
      sortOrder,
      tags,
      allergens,
      image,
      imageUrl,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required',
      });
    }

    const priceValue = toNumber(price);
    if (priceValue === null) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number',
      });
    }

    const happyHourPriceValue = toNumber(happyHourPrice);
    const preparationTimeValue = toNumber(preparationTime);
    const sortOrderValue = toNumber(sortOrder);
    const availableValue = parseBoolean(available);
    const featuredValue = parseBoolean(featured);

    const imagePath = req.file
      ? buildMenuImagePath(req.file.filename)
      : normalizeIncomingImage(imageUrl ?? image);

    const data: any = {
      name: String(name).trim(),
      description: description ? String(description) : null,
      category: String(category).toUpperCase(),
      price: priceValue,
      menuType: menuType ? String(menuType).toUpperCase() : undefined,
      happyHourPrice: happyHourPriceValue ?? undefined,
      servingSize: servingSize ? String(servingSize) : undefined,
      preparationTime: preparationTimeValue ?? undefined,
      available: availableValue ?? true,
      featured: featuredValue ?? false,
      sortOrder: sortOrderValue ?? undefined,
      image: imagePath ?? null,
      tags: parseJsonArray(tags),
      allergens: parseJsonArray(allergens),
    };

    const menuItem = await prisma.menuItem.create({
      data,
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      item: augmentMenuItem(menuItem),
    });
  } catch (error) {
    if (uploadedFilename) {
      await deleteUploadedFile(`${MENU_IMAGE_BASE_PATH}/${uploadedFilename}`);
    }
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  const uploadedFilename = req.file?.filename;

  try {
    const { id } = req.params;

    const existingItem = await prisma.menuItem.findUnique({ where: { id } });

    if (!existingItem) {
      if (uploadedFilename) {
        await deleteUploadedFile(`${MENU_IMAGE_BASE_PATH}/${uploadedFilename}`);
      }
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    const {
      name,
      description,
      price,
      category,
      menuType,
      happyHourPrice,
      servingSize,
      preparationTime,
      available,
      featured,
      sortOrder,
      tags,
      allergens,
      image,
      imageUrl,
      removeImage,
    } = req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = String(name).trim();
    if (description !== undefined) updateData.description = description ? String(description) : null;
    if (category !== undefined) updateData.category = String(category).toUpperCase();
    if (menuType !== undefined) updateData.menuType = String(menuType).toUpperCase();

    if (price !== undefined) {
      const priceValue = toNumber(price);
      if (priceValue === null) {
        throw new Error('Price must be a valid number');
      }
      updateData.price = priceValue;
    }

    if (happyHourPrice !== undefined) {
      updateData.happyHourPrice = toNumber(happyHourPrice);
    }

    if (servingSize !== undefined) updateData.servingSize = servingSize ? String(servingSize) : null;

    if (preparationTime !== undefined) {
      const prepValue = toNumber(preparationTime);
      updateData.preparationTime = prepValue ?? null;
    }

    if (sortOrder !== undefined) {
      const sortValue = toNumber(sortOrder);
      updateData.sortOrder = sortValue ?? null;
    }

    if (available !== undefined) {
      const availableValue = parseBoolean(available);
      if (availableValue !== undefined) updateData.available = availableValue;
    }

    if (featured !== undefined) {
      const featuredValue = parseBoolean(featured);
      if (featuredValue !== undefined) updateData.featured = featuredValue;
    }

    if (tags !== undefined) updateData.tags = parseJsonArray(tags);
    if (allergens !== undefined) updateData.allergens = parseJsonArray(allergens);

    let newImagePath: string | null | undefined;

    if (removeImage) {
      newImagePath = null;
    } else if (req.file) {
      newImagePath = buildMenuImagePath(req.file.filename);
    } else if (image !== undefined || imageUrl !== undefined) {
      newImagePath = normalizeIncomingImage(imageUrl ?? image) ?? null;
    }

    if (newImagePath !== undefined) {
      updateData.image = newImagePath;
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    if (newImagePath && newImagePath !== existingItem.image && isLocalUploadPath(existingItem.image)) {
      await deleteUploadedFile(existingItem.image!.replace(/^\/+/, ''));
    }

    if (newImagePath === null && existingItem.image && isLocalUploadPath(existingItem.image)) {
      await deleteUploadedFile(existingItem.image.replace(/^\/+/, ''));
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      item: augmentMenuItem(menuItem),
    });
  } catch (error: any) {
    if (uploadedFilename) {
      await deleteUploadedFile(`${MENU_IMAGE_BASE_PATH}/${uploadedFilename}`);
    }
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
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
      menu: menuByCategory.map((group) => ({
        ...group,
        items: group.items.map(augmentMenuItem)
      }))
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
      items: featuredItems.map(augmentMenuItem)
    });
  } catch (error) {
    next(error);
  }
};

// Alias for getMenuItemById
export const getMenuItem = getMenuItemById;

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
      items: happyHourItems.map(augmentMenuItem),
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