import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';

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
    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const settings = await getOrCreateSettings();
    
    // Helper function to decode HTML entities
    const decodeHtmlEntities = (str: string): string => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x2F;/g, "/");
    };

    // Return only public information with decoded HTML entities
    const publicSettings = {
      siteName: decodeHtmlEntities(settings.siteName),
      siteDescription: decodeHtmlEntities(settings.siteDescription || ''),
      contactEmail: decodeHtmlEntities(settings.contactEmail),
      contactPhone: decodeHtmlEntities(settings.contactPhone),
      address: decodeHtmlEntities(settings.address),
      city: decodeHtmlEntities(settings.city),
      state: decodeHtmlEntities(settings.state),
      zipCode: decodeHtmlEntities(settings.zipCode),
      country: decodeHtmlEntities(settings.country),
      businessHours: settings.businessHours,
      socialMedia: settings.socialMedia,
      reservationSettings: settings.reservationSettings,
      onlineOrderingUrl: decodeHtmlEntities(settings.onlineOrderingUrl || ''),
      updatedAt: settings.updatedAt,
    };

    res.json({ success: true, settings: publicSettings });
  } catch (error) {
    next(error);
  }
};

export const getAllSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const settings = await getOrCreateSettings();
    
    // Helper function to decode HTML entities
    const decodeHtmlEntities = (str: string): string => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x2F;/g, "/");
    };

    // Decode HTML entities in the settings object
    const decodedSettings = {
      ...settings,
      siteName: decodeHtmlEntities(settings.siteName),
      siteDescription: decodeHtmlEntities(settings.siteDescription || ''),
      contactEmail: decodeHtmlEntities(settings.contactEmail),
      contactPhone: decodeHtmlEntities(settings.contactPhone),
      address: decodeHtmlEntities(settings.address),
      city: decodeHtmlEntities(settings.city),
      state: decodeHtmlEntities(settings.state),
      zipCode: decodeHtmlEntities(settings.zipCode),
      country: decodeHtmlEntities(settings.country),
      onlineOrderingUrl: decodeHtmlEntities(settings.onlineOrderingUrl || ''),
    };

    // Return settings directly for compatibility
    res.json(decodedSettings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

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

// Test email settings
export const testEmailSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, account } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    // Check if SMTP credentials are configured
    if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'your-microsoft-365-app-password-here') {
      return res.status(400).json({
        success: false,
        message: 'SMTP password not configured. Please add your Microsoft 365 app password to the .env file.',
        details: 'Update SMTP_PASS in .env with your 16-character app password from Microsoft 365'
      });
    }

    logger.info(`Testing email to: ${email}, account: ${account || 'default'}`);
    logger.info(`SMTP Config: Host=${process.env.SMTP_HOST}, User=${process.env.SMTP_USER}, Port=${process.env.SMTP_PORT}`);

    // Create transporter and test email directly
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER || 'Mike@Kockys.com',
        pass: process.env.SMTP_PASS || '',
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
      requireTLS: true,
    });

    // Verify connection first
    await transporter.verify();
    logger.info('SMTP connection verified successfully');

    // Send test email
    const info = await transporter.sendMail({
      from: `"Kocky's Bar & Grill" <${process.env.SMTP_USER || 'Mike@Kockys.com'}>`,
      to: email,
      subject: '🧪 Test Email from Kocky\'s',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #b22222; color: white; padding: 20px; text-align: center;">
            <h1>✅ Email Test Successful!</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p>This is a test email from Kocky's Bar & Grill email system.</p>
            <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
            <p><strong>Account:</strong> ${account || 'default'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p>Your email configuration is working correctly!</p>
          </div>
        </div>
      `,
    });

    logger.info('Test email sent successfully:', { messageId: info.messageId });
    
    res.json({
      success: true,
      message: `Test email sent successfully! Message ID: ${info.messageId}`,
    });
  } catch (error) {
    logger.error('Test email settings error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      if (error.message.includes('535')) {
        errorMessage = 'Authentication failed. Please check your Microsoft 365 app password.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to SMTP server. Please check your SMTP settings.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'SMTP host not found. Please check your SMTP_HOST setting.';
      } else {
        errorMessage = error.message;
      }
    }
    
    res.status(500).json({
      success: false,
      message: `Email test failed: ${errorMessage}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
