import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

const SETTINGS_DIR = path.join(__dirname, '../../data/services');
const SETTINGS_FILE = (service: string) => path.join(SETTINGS_DIR, `${service}.json`);

// Ensure settings directory exists
const ensureSettingsDir = async () => {
  try {
    await mkdir(SETTINGS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating settings directory:', error);
  }
};

// Get service settings
export const getServiceSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { service } = req.params;
    
    if (!['food-truck', 'mobile-bar'].includes(service)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid service type' 
      });
    }

    await ensureSettingsDir();
    
    try {
      const data = await readFile(SETTINGS_FILE(service), 'utf-8');
      const settings = JSON.parse(data);
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      // Return default settings if file doesn't exist
      res.json({
        success: true,
        data: getDefaultSettings(service as 'food-truck' | 'mobile-bar')
      });
    }
  } catch (error) {
    next(error);
  }
};

// Update service settings
export const updateServiceSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { service } = req.params;
    
    if (!['food-truck', 'mobile-bar'].includes(service)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid service type' 
      });
    }

    await ensureSettingsDir();
    
    // Merge with existing settings
    let existingSettings = {};
    try {
      const data = await readFile(SETTINGS_FILE(service), 'utf-8');
      existingSettings = JSON.parse(data);
    } catch (error) {
      // File doesn't exist, will create new
    }
    
    const updatedSettings = {
      ...existingSettings,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await writeFile(
      SETTINGS_FILE(service),
      JSON.stringify(updatedSettings, null, 2),
      'utf-8'
    );
    
    res.json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    next(error);
  }
};

// Upload service image
export const uploadServiceImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { service } = req.params;
    
    if (!['food-truck', 'mobile-bar'].includes(service)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid service type' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image uploaded' 
      });
    }

    const imageUrl = `/uploads/services/${req.file.filename}`;
    
    // Update settings with new image URL
    await ensureSettingsDir();
    
    let settings = {};
    try {
      const data = await readFile(SETTINGS_FILE(service), 'utf-8');
      settings = JSON.parse(data);
    } catch (error) {
      // File doesn't exist, will create new
    }
    
    const updatedSettings = {
      ...settings,
      heroImage: imageUrl,
      updatedAt: new Date().toISOString()
    };
    
    await writeFile(
      SETTINGS_FILE(service),
      JSON.stringify(updatedSettings, null, 2),
      'utf-8'
    );
    
    res.json({
      success: true,
      data: {
        imageUrl,
        settings: updatedSettings
      }
    });
  } catch (error) {
    next(error);
  }
};

function getDefaultSettings(service: 'food-truck' | 'mobile-bar') {
  if (service === 'food-truck') {
    return {
      id: 'food-truck',
      serviceName: 'Food Truck',
      title: "Kocky's on Wheels",
      subtitle: 'Bringing Great Food to Your Event',
      description: 'Experience the best of Kocky\'s Bar & Grill wherever you are. Our fully equipped food truck brings our signature dishes right to your event.',
      packages: [
        {
          id: 'basic',
          name: 'Basic Package',
          price: 'Starting at $500',
          duration: '2 hours',
          guests: 'Up to 50 guests',
          features: ['Limited menu', 'Basic setup', 'Paper products included'],
          instantQuoteRate: 15,
          instantQuoteEnabled: true
        },
        {
          id: 'standard',
          name: 'Standard Package',
          price: 'Starting at $1,000',
          duration: '3 hours',
          guests: '50-100 guests',
          features: ['Full menu', 'Professional setup', 'Premium disposables', 'Beverage service'],
          popular: true,
          instantQuoteRate: 25,
          instantQuoteEnabled: true
        },
        {
          id: 'premium',
          name: 'Premium Package',
          price: 'Starting at $2,000',
          duration: '4+ hours',
          guests: '100+ guests',
          features: ['Custom menu', 'Full service team', 'Premium setup', 'Dessert included'],
          instantQuoteRate: 40,
          instantQuoteEnabled: true
        }
      ],
      features: [
        {
          icon: 'Truck',
          title: 'Fully Equipped Kitchen',
          description: 'Professional grade cooking equipment on wheels'
        },
        {
          icon: 'Users',
          title: 'Experienced Staff',
          description: 'Professional chefs and service team'
        },
        {
          icon: 'Clock',
          title: 'Flexible Hours',
          description: 'Available for lunch, dinner, or late night'
        },
        {
          icon: 'Star',
          title: 'Custom Menu',
          description: 'Tailored to your event needs'
        }
      ],
      isActive: true
    };
  } else {
    return {
      id: 'mobile-bar',
      serviceName: 'Mobile Bar',
      title: 'Premium Mobile Bar Service',
      subtitle: 'Elevate Your Event with Professional Bartending',
      description: 'Transform your event into an unforgettable experience with our professional mobile bar service. From craft cocktails to premium spirits, we bring the bar to you.',
      packages: [
        {
          id: 'basic',
          name: 'Essential Bar',
          price: 'Starting at $500',
          duration: 'Up to 3 hours',
          guests: 'Up to 50 guests',
          features: [
            'Professional bartender',
            'Basic bar setup',
            'Beer & Wine selection',
            'Soft drinks & mixers',
            'Ice & garnishes',
            'Disposable barware'
          ],
          instantQuoteRate: 15,
          instantQuoteEnabled: true
        },
        {
          id: 'premium',
          name: 'Premium Experience',
          price: 'Starting at $800',
          duration: 'Up to 4 hours',
          guests: 'Up to 100 guests',
          popular: true,
          features: [
            'Two professional bartenders',
            'Premium bar setup with lighting',
            'Full cocktail menu',
            'Premium spirits selection',
            'Wine & champagne service',
            'Glassware included',
            'Custom cocktail creation',
            'Bar snacks & garnishes'
          ],
          instantQuoteRate: 25,
          instantQuoteEnabled: true
        },
        {
          id: 'luxury',
          name: 'Luxury Collection',
          price: 'Starting at $1,500',
          duration: 'Up to 6 hours',
          guests: 'Up to 200 guests',
          features: [
            'Full bartending team',
            'Luxury mobile bar setup',
            'Top-shelf spirits only',
            'Champagne service',
            'Signature cocktail menu',
            'Premium glassware',
            'LED bar lighting',
            'Dedicated event coordinator',
            'Complimentary tasting session'
          ],
          instantQuoteRate: 40,
          instantQuoteEnabled: true
        }
      ],
      features: [
        {
          icon: 'Wine',
          title: 'Premium Selection',
          description: 'Top-shelf spirits and fine wines'
        },
        {
          icon: 'Star',
          title: 'Expert Mixologists',
          description: 'Professional bartenders with years of experience'
        },
        {
          icon: 'Sparkles',
          title: 'Custom Cocktails',
          description: 'Signature drinks tailored to your event'
        },
        {
          icon: 'CheckCircle',
          title: 'Full Service',
          description: 'Setup, service, and cleanup included'
        }
      ],
      isActive: true
    };
  }
}

