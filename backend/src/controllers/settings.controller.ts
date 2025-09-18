import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';

const getOrCreateSettings = async () => {
  let settings = await prisma.settings.findFirst();
  
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        siteName: "Kocky's Bar & Grill",
        siteDescription: "The best bar and grill in town",
        contactEmail: "info@kockysbar.com",
        contactPhone: "(555) 123-4567",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        businessHours: {
          monday: { open: "11:00", close: "23:00" },
          tuesday: { open: "11:00", close: "23:00" },
          wednesday: { open: "11:00", close: "23:00" },
          thursday: { open: "11:00", close: "00:00" },
          friday: { open: "11:00", close: "02:00" },
          saturday: { open: "10:00", close: "02:00" },
          sunday: { open: "10:00", close: "22:00" },
        },
        socialMedia: {
          facebook: "https://facebook.com/kockysbar",
          instagram: "https://instagram.com/kockysbar",
          twitter: "https://twitter.com/kockysbar",
          tiktok: "https://tiktok.com/@kockysbar",
        },
        emailSettings: {
          provider: "sendgrid",
          from: "noreply@kockysbar.com",
        },
        paymentSettings: {
          stripeEnabled: true,
          acceptsCash: true,
          acceptsCard: true,
        },
        reservationSettings: {
          minPartySize: 1,
          maxPartySize: 20,
          advanceBookingDays: 30,
          reservationSlotDuration: 120, // minutes
          maxReservationsPerSlot: 10,
        },
      },
    });
  }
  
  return settings;
};

export const getPublicSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();
    
    // Return only public information
    const publicSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      zipCode: settings.zipCode,
      country: settings.country,
      businessHours: settings.businessHours,
      socialMedia: settings.socialMedia,
      reservationSettings: settings.reservationSettings,
      onlineOrderingUrl: settings.onlineOrderingUrl,
    };

    res.json({ success: true, settings: publicSettings });
  } catch (error) {
    next(error);
  }
};

export const getAllSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();
    // Return settings directly for compatibility
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();
    
    // Extract and validate the data from request body
    const {
      siteName,
      siteDescription,
      contactEmail,
      contactPhone,
      contactAddress,
      socialMedia,
      businessHours,
      onlineOrderingUrl,
      // These fields are not in the Settings model, so we'll ignore them
      primaryColor,
      secondaryColor,
      accentColor,
      logoUrl,
      heroImageUrl,
      ...otherFields
    } = req.body;
    
    // Parse address if provided as a single string
    let addressParts = {};
    if (contactAddress && typeof contactAddress === 'string') {
      const parts = contactAddress.split(',').map(s => s.trim());
      addressParts = {
        address: parts[0] || '',
        city: parts[1] || '',
        state: parts[2] || '',
        zipCode: '', // Not provided in the simple format
        country: 'USA', // Default
      };
    }
    
    // Build update data object
    const updateData: any = {};
    
    if (siteName !== undefined) updateData.siteName = siteName;
    if (siteDescription !== undefined) updateData.siteDescription = siteDescription;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (onlineOrderingUrl !== undefined) {
      // Decode HTML entities if present (from sanitization)
      const decodedUrl = onlineOrderingUrl.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
      updateData.onlineOrderingUrl = decodedUrl;
    }
    
    // Update address fields if contactAddress was provided
    if (contactAddress) {
      Object.assign(updateData, addressParts);
    }
    
    // Ensure socialMedia and businessHours are properly formatted as JSON
    if (socialMedia !== undefined) {
      updateData.socialMedia = typeof socialMedia === 'string' 
        ? JSON.parse(socialMedia) 
        : socialMedia;
    }
    
    if (businessHours !== undefined) {
      updateData.businessHours = typeof businessHours === 'string' 
        ? JSON.parse(businessHours) 
        : businessHours;
    }
    
    const updatedSettings = await prisma.settings.update({
      where: { id: settings.id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    next(error);
  }
};

export const getBusinessHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, businessHours: settings.businessHours });
  } catch (error) {
    next(error);
  }
};

export const updateBusinessHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();
    
    const updatedSettings = await prisma.settings.update({
      where: { id: settings.id },
      data: { businessHours: req.body },
    });

    res.json({
      success: true,
      message: 'Business hours updated',
      businessHours: updatedSettings.businessHours,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSocialMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();
    
    const updatedSettings = await prisma.settings.update({
      where: { id: settings.id },
      data: { socialMedia: req.body },
    });

    res.json({
      success: true,
      message: 'Social media links updated',
      socialMedia: updatedSettings.socialMedia,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmailSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();
    
    const updatedSettings = await prisma.settings.update({
      where: { id: settings.id },
      data: { emailSettings: req.body },
    });

    res.json({
      success: true,
      message: 'Email settings updated',
      emailSettings: updatedSettings.emailSettings,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();
    
    const updatedSettings = await prisma.settings.update({
      where: { id: settings.id },
      data: { paymentSettings: req.body },
    });

    res.json({
      success: true,
      message: 'Payment settings updated',
      paymentSettings: updatedSettings.paymentSettings,
    });
  } catch (error) {
    next(error);
  }
};
