import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// Package Management
export const getAllPackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, isActive } = req.query;
    
    const packages = await prisma.quotePackage.findMany({
      where: {
        ...(category && { category: category as string }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });
    
    res.json({ success: true, data: packages });
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, category, price, priceType, items, isActive, sortOrder } = req.body;
    
    const packageData = await prisma.quotePackage.create({
      data: {
        name,
        description,
        category,
        price: new Decimal(price),
        priceType: priceType || 'FLAT',
        items: items ? JSON.stringify(items) : null,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });
    
    res.json({ success: true, data: packageData });
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.price !== undefined) {
      updates.price = new Decimal(updates.price);
    }
    
    if (updates.items && typeof updates.items === 'object') {
      updates.items = JSON.stringify(updates.items);
    }
    
    const packageData = await prisma.quotePackage.update({
      where: { id },
      data: updates,
    });
    
    res.json({ success: true, data: packageData });
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.quotePackage.delete({
      where: { id },
    });
    
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Item Management
export const getAllItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, taxable, isActive } = req.query;
    
    const items = await prisma.quoteConfigItem.findMany({
      where: {
        ...(category && { category: category as string }),
        ...(taxable !== undefined && { taxable: taxable === 'true' }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: [
        { sortOrder: 'asc' },
        { category: 'asc' },
        { name: 'asc' }
      ],
    });
    
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, category, unitPrice, unit, taxable, isActive, sortOrder } = req.body;
    
    const item = await prisma.quoteConfigItem.create({
      data: {
        name,
        description,
        category,
        unitPrice: new Decimal(unitPrice),
        unit: unit || 'EACH',
        taxable: taxable !== false,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });
    
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.unitPrice !== undefined) {
      updates.unitPrice = new Decimal(updates.unitPrice);
    }
    
    const item = await prisma.quoteConfigItem.update({
      where: { id },
      data: updates,
    });
    
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.quoteConfigItem.delete({
      where: { id },
    });
    
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Labor Management
export const getAllLabor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.query;
    
    const labor = await prisma.quoteLabor.findMany({
      where: {
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: [
        { sortOrder: 'asc' },
        { role: 'asc' }
      ],
    });
    
    res.json({ success: true, data: labor });
  } catch (error) {
    next(error);
  }
};

export const createLabor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, description, rateType, rate, minHours, isActive, sortOrder } = req.body;
    
    const labor = await prisma.quoteLabor.create({
      data: {
        role,
        description,
        rateType: rateType || 'HOURLY',
        rate: new Decimal(rate),
        minHours: minHours ? new Decimal(minHours) : new Decimal(4),
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });
    
    res.json({ success: true, data: labor });
  } catch (error) {
    next(error);
  }
};

export const updateLabor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.rate !== undefined) {
      updates.rate = new Decimal(updates.rate);
    }
    
    if (updates.minHours !== undefined) {
      updates.minHours = new Decimal(updates.minHours);
    }
    
    const labor = await prisma.quoteLabor.update({
      where: { id },
      data: updates,
    });
    
    res.json({ success: true, data: labor });
  } catch (error) {
    next(error);
  }
};

export const deleteLabor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.quoteLabor.delete({
      where: { id },
    });
    
    res.json({ success: true, message: 'Labor deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Tax Management
export const getAllTaxes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.query;
    
    const taxes = await prisma.quoteTax.findMany({
      where: {
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ],
    });
    
    res.json({ success: true, data: taxes });
  } catch (error) {
    next(error);
  }
};

export const createTax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, rate, description, isDefault, isActive } = req.body;
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.quoteTax.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    
    const tax = await prisma.quoteTax.create({
      data: {
        name,
        rate: new Decimal(rate),
        description,
        isDefault: isDefault || false,
        isActive: isActive !== false,
      },
    });
    
    res.json({ success: true, data: tax });
  } catch (error) {
    next(error);
  }
};

export const updateTax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.rate !== undefined) {
      updates.rate = new Decimal(updates.rate);
    }
    
    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await prisma.quoteTax.updateMany({
        where: { 
          isDefault: true,
          NOT: { id }
        },
        data: { isDefault: false },
      });
    }
    
    const tax = await prisma.quoteTax.update({
      where: { id },
      data: updates,
    });
    
    res.json({ success: true, data: tax });
  } catch (error) {
    next(error);
  }
};

export const deleteTax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.quoteTax.delete({
      where: { id },
    });
    
    res.json({ success: true, message: 'Tax deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Gratuity Management
export const getAllGratuities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.query;
    
    const gratuities = await prisma.quoteGratuity.findMany({
      where: {
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: [
        { isDefault: 'desc' },
        { isAutoApply: 'desc' },
        { name: 'asc' }
      ],
    });
    
    res.json({ success: true, data: gratuities });
  } catch (error) {
    next(error);
  }
};

export const createGratuity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, percentage, minGuestCount, isAutoApply, isDefault, description, isActive } = req.body;
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.quoteGratuity.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    
    const gratuity = await prisma.quoteGratuity.create({
      data: {
        name,
        percentage: new Decimal(percentage),
        minGuestCount,
        isAutoApply: isAutoApply || false,
        isDefault: isDefault || false,
        description,
        isActive: isActive !== false,
      },
    });
    
    res.json({ success: true, data: gratuity });
  } catch (error) {
    next(error);
  }
};

export const updateGratuity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.percentage !== undefined) {
      updates.percentage = new Decimal(updates.percentage);
    }
    
    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await prisma.quoteGratuity.updateMany({
        where: { 
          isDefault: true,
          NOT: { id }
        },
        data: { isDefault: false },
      });
    }
    
    const gratuity = await prisma.quoteGratuity.update({
      where: { id },
      data: updates,
    });
    
    res.json({ success: true, data: gratuity });
  } catch (error) {
    next(error);
  }
};

export const deleteGratuity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.quoteGratuity.delete({
      where: { id },
    });
    
    res.json({ success: true, message: 'Gratuity deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all configurations for quote creation
export const getQuoteConfigurations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [packages, items, labor, taxes, gratuities] = await Promise.all([
      prisma.quotePackage.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.quoteConfigItem.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }, { name: 'asc' }],
      }),
      prisma.quoteLabor.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { role: 'asc' }],
      }),
      prisma.quoteTax.findMany({
        where: { isActive: true },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      }),
      prisma.quoteGratuity.findMany({
        where: { isActive: true },
        orderBy: [{ isDefault: 'desc' }, { isAutoApply: 'desc' }, { name: 'asc' }],
      }),
    ]);
    
    res.json({
      success: true,
      data: {
        packages,
        items,
        labor,
        taxes,
        gratuities,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Initialize default configurations
export const initializeDefaults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if already initialized
    const existingCount = await prisma.quotePackage.count();
    if (existingCount > 0) {
      return res.json({ success: true, message: 'Configurations already initialized' });
    }
    
    // Create default packages
    const packages = await prisma.quotePackage.createMany({
      data: [
        // Food Truck Packages
        {
          name: 'Gold Tier Taco Package',
          description: 'Premium taco bar with 3 protein options, sides, and toppings',
          category: 'FOOD_TRUCK',
          price: new Decimal(25),
          priceType: 'PER_PERSON',
          items: JSON.stringify(['3 Protein Options', 'Rice & Beans', 'Fresh Toppings Bar', 'Chips & Salsa']),
          sortOrder: 1,
        },
        {
          name: 'Silver Tier Taco Package',
          description: 'Standard taco bar with 2 protein options and sides',
          category: 'FOOD_TRUCK',
          price: new Decimal(18),
          priceType: 'PER_PERSON',
          items: JSON.stringify(['2 Protein Options', 'Rice & Beans', 'Toppings Bar']),
          sortOrder: 2,
        },
        // Mobile Bar Packages
        {
          name: 'Premium Bar Package',
          description: 'Top shelf liquors, craft cocktails, beer & wine',
          category: 'MOBILE_BAR',
          price: new Decimal(35),
          priceType: 'PER_PERSON',
          items: JSON.stringify(['Premium Spirits', 'Craft Cocktails', 'Beer & Wine', 'Mixers & Garnishes']),
          sortOrder: 1,
        },
        {
          name: 'Standard Bar Package',
          description: 'Well drinks, domestic beer, house wine',
          category: 'MOBILE_BAR',
          price: new Decimal(25),
          priceType: 'PER_PERSON',
          items: JSON.stringify(['Well Drinks', 'Domestic Beer', 'House Wine', 'Basic Mixers']),
          sortOrder: 2,
        },
        // Catering Packages
        {
          name: 'Full Service Catering',
          description: 'Complete catering with appetizers, entrees, and desserts',
          category: 'CATERING',
          price: new Decimal(45),
          priceType: 'PER_PERSON',
          items: JSON.stringify(['Appetizers', '2 Entree Options', 'Sides', 'Dessert', 'Beverages']),
          sortOrder: 1,
        },
      ],
    });
    
    // Create default items
    const items = await prisma.quoteConfigItem.createMany({
      data: [
        // Food Items
        { name: 'Guacamole (Large)', category: 'FOOD', unitPrice: new Decimal(45), unit: 'BOWL', taxable: true, sortOrder: 1 },
        { name: 'Chips & Salsa', category: 'FOOD', unitPrice: new Decimal(25), unit: 'TRAY', taxable: true, sortOrder: 2 },
        { name: 'Quesadillas', category: 'FOOD', unitPrice: new Decimal(12), unit: 'DOZEN', taxable: true, sortOrder: 3 },
        // Beverages
        { name: 'Margarita Pitcher', category: 'BEVERAGE', unitPrice: new Decimal(65), unit: 'PITCHER', taxable: true, sortOrder: 1 },
        { name: 'Bottled Water', category: 'BEVERAGE', unitPrice: new Decimal(2), unit: 'EACH', taxable: true, sortOrder: 2 },
        { name: 'Soft Drinks', category: 'BEVERAGE', unitPrice: new Decimal(3), unit: 'EACH', taxable: true, sortOrder: 3 },
        // Equipment
        { name: 'Tent (10x10)', category: 'EQUIPMENT', unitPrice: new Decimal(150), unit: 'DAY', taxable: false, sortOrder: 1 },
        { name: 'Tables (6ft)', category: 'EQUIPMENT', unitPrice: new Decimal(15), unit: 'EACH', taxable: false, sortOrder: 2 },
        { name: 'Chairs', category: 'EQUIPMENT', unitPrice: new Decimal(5), unit: 'EACH', taxable: false, sortOrder: 3 },
      ],
    });
    
    // Create default labor
    const labor = await prisma.quoteLabor.createMany({
      data: [
        { role: 'Chef', description: 'Professional chef for food preparation', rateType: 'HOURLY', rate: new Decimal(35), minHours: new Decimal(4), sortOrder: 1 },
        { role: 'Bartender', description: 'Professional bartender', rateType: 'HOURLY', rate: new Decimal(30), minHours: new Decimal(4), sortOrder: 2 },
        { role: 'Server', description: 'Service staff', rateType: 'HOURLY', rate: new Decimal(25), minHours: new Decimal(4), sortOrder: 3 },
        { role: 'Event Coordinator', description: 'On-site event coordination', rateType: 'HOURLY', rate: new Decimal(40), minHours: new Decimal(4), sortOrder: 4 },
      ],
    });
    
    // Create default taxes
    const taxes = await prisma.quoteTax.createMany({
      data: [
        { name: 'Sales Tax', rate: new Decimal(8.5), description: 'California state sales tax', isDefault: true },
        { name: 'Service Tax', rate: new Decimal(2), description: 'Optional service tax', isDefault: false },
      ],
    });
    
    // Create default gratuities
    const gratuities = await prisma.quoteGratuity.createMany({
      data: [
        { 
          name: 'Standard Gratuity', 
          percentage: new Decimal(18), 
          description: 'Recommended gratuity',
          isDefault: true,
          isAutoApply: false 
        },
        { 
          name: 'Large Party Gratuity', 
          percentage: new Decimal(20), 
          minGuestCount: 50,
          description: 'Automatic for parties of 50+',
          isAutoApply: true,
          isDefault: false 
        },
      ],
    });
    
    res.json({
      success: true,
      message: 'Default configurations initialized successfully',
      data: {
        packagesCreated: packages.count,
        itemsCreated: items.count,
        laborCreated: labor.count,
        taxesCreated: taxes.count,
        gratuitiesCreated: gratuities.count,
      },
    });
  } catch (error) {
    next(error);
  }
};
