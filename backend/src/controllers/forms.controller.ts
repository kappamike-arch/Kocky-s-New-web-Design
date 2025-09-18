import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { unifiedEmailService } from '../services/UnifiedEmailService';
import { renderEmailTemplate } from '../utils/email-template';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Unified form submission handler
export const submitForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formType, ...formData } = req.body;
    const confirmationCode = uuidv4().slice(0, 8).toUpperCase();
    
    logger.info(`Processing ${formType} form submission`);
    
    let result;
    let emailData: any = {
      name: formData.contactName || formData.name,
      confirmationCode,
      date: formData.eventDate ? new Date(formData.eventDate).toLocaleDateString() : null,
      eventTime: formData.eventTime,
      guestCount: formData.expectedGuests || formData.guestCount,
      location: formData.eventLocation || formData.location,
    };
    
    switch (formType) {
      case 'food-truck':
        // Save to food truck booking table
        result = await prisma.foodTruckBooking.create({
          data: {
            contactName: formData.contactName,
            contactEmail: formData.contactEmail,
            contactPhone: formData.contactPhone,
            companyName: formData.companyName,
            eventDate: new Date(formData.eventDate),
            eventTime: formData.eventTime,
            eventDuration: formData.eventDuration || 4,
            eventLocation: formData.eventLocation,
            eventType: formData.eventType,
            expectedGuests: formData.expectedGuests,
            budget: formData.budget ? parseFloat(formData.budget) : null,
            menuPreferences: formData.menuPreferences,
            additionalNotes: formData.additionalNotes,
            confirmationCode,
            status: 'PENDING'
          },
        });
        
        // Also create CRM inquiry record
        await prisma.contactInquiry.create({
          data: {
            name: formData.contactName,
            email: formData.contactEmail,
            phone: formData.contactPhone,
            subject: `Food Truck Service - ${formData.eventType}`,
            message: `Event Date: ${formData.eventDate}\nLocation: ${formData.eventLocation}\nGuests: ${formData.expectedGuests}\nMenu Preferences: ${formData.menuPreferences || 'None'}\nNotes: ${formData.additionalNotes || 'None'}`,
            serviceType: 'FOOD_TRUCK',
            eventDate: new Date(formData.eventDate),
            eventLocation: formData.eventLocation,
            guestCount: formData.expectedGuests,
            companyName: formData.companyName,
            confirmationCode,
            source: 'Website Form',
            status: 'NEW'
          }
        });
        
        emailData.bookingType = 'Food Truck Service';
        break;
        
      case 'mobile-bar':
        // Save to mobile bar booking table
        result = await prisma.mobileBarBooking.create({
          data: {
            contactName: formData.name || formData.contactName,
            contactEmail: formData.email || formData.contactEmail,
            contactPhone: formData.phone || formData.contactPhone,
            eventDate: new Date(formData.eventDate),
            eventTime: formData.eventTime,
            eventDuration: formData.eventDuration || 4,
            eventLocation: formData.location || formData.eventLocation,
            eventType: formData.eventType || 'Private Event',
            expectedGuests: parseInt(formData.guestCount || formData.expectedGuests),
            packageType: formData.packageType === 'premium' ? 'PREMIUM' : formData.packageType === 'custom' ? 'CUSTOM' : formData.packageType === 'basic' ? 'BASIC' : 'STANDARD',
            addOns: formData.addOns || [],
            specialRequests: formData.message || formData.specialRequests,
            budget: formData.budget ? parseFloat(formData.budget) : null,
            confirmationCode,
            status: 'PENDING'
          },
        });
        
        // Also create CRM inquiry record
        await prisma.contactInquiry.create({
          data: {
            name: formData.name || formData.contactName,
            email: formData.email || formData.contactEmail,
            phone: formData.phone || formData.contactPhone,
            subject: `Mobile Bar Service - ${formData.eventType}`,
            message: `Event Date: ${formData.eventDate}\nLocation: ${formData.location || formData.eventLocation}\nGuests: ${formData.guestCount || formData.expectedGuests}\nPackage: ${formData.packageType || 'CUSTOM'}\nSpecial Requests: ${formData.message || formData.specialRequests || 'None'}`,
            serviceType: 'MOBILE_BAR',
            eventDate: new Date(formData.eventDate),
            eventLocation: formData.location || formData.eventLocation,
            guestCount: parseInt(formData.guestCount || formData.expectedGuests),
            confirmationCode,
            source: 'Website Form',
            status: 'NEW'
          }
        });
        
        emailData.bookingType = 'Mobile Bar Service';
        break;
        
      case 'catering':
        // Create CRM inquiry record for catering
        result = await prisma.contactInquiry.create({
          data: {
            name: formData.name || formData.contactName,
            email: formData.email || formData.contactEmail,
            phone: formData.phone || formData.contactPhone,
            subject: `Catering Request - ${formData.eventType || 'Event'}`,
            message: `Event Date: ${formData.eventDate}\nEvent Time: ${formData.eventTime}\nEvent Type: ${formData.eventType}\nGuest Count: ${formData.guestCount || formData.expectedGuests}\nLocation: ${formData.location || formData.eventLocation}\nSpecial Requests: ${formData.message || formData.specialRequests || 'None'}`,
            serviceType: 'CATERING',
            eventDate: formData.eventDate ? new Date(formData.eventDate) : null,
            eventLocation: formData.location || formData.eventLocation,
            guestCount: parseInt(formData.guestCount || formData.expectedGuests || '0'),
            confirmationCode,
            source: 'Website Form',
            status: 'NEW'
          },
        });
        emailData.bookingType = 'Catering Service';
        break;
        
      case 'contact':
        result = await prisma.contactInquiry.create({
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject || 'General Inquiry',
            message: formData.message,
            status: 'NEW'
          },
        });
        emailData.bookingType = 'Contact Inquiry';
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid form type' 
        });
    }
    
    // Send confirmation email using Azure email system
    try {
      // Get the appropriate email template based on form type
      const templateSlug = getTemplateSlugForFormType(formType);
      const template = await prisma.emailTemplate.findUnique({
        where: { slug: templateSlug }
      });

      if (template) {
        // Use database template
        const customerData = {
          customerName: emailData.name,
          customerEmail: formData.contactEmail || formData.email,
          serviceName: emailData.bookingType,
          eventDate: emailData.date,
          eventTime: emailData.eventTime,
          eventLocation: emailData.location,
          guestCount: emailData.guestCount,
          confirmationCode: emailData.confirmationCode,
          message: 'Thank you for your inquiry! We will review your request and get back to you within 24 hours.'
        };

        const renderedSubject = renderEmailTemplate(template.subject, customerData);
        const renderedHtml = renderEmailTemplate(template.html, customerData);
        const renderedText = template.text ? renderEmailTemplate(template.text, customerData) : undefined;

        const customerEmailSent = await unifiedEmailService.sendEmail({
          to: formData.contactEmail || formData.email,
          subject: renderedSubject,
          html: renderedHtml,
          text: renderedText,
          provider: 'azure'
        });

        if (customerEmailSent) {
          logger.info(`Customer confirmation email sent for ${formType} inquiry via Azure`);
        } else {
          logger.warn(`Failed to send customer confirmation email for ${formType} inquiry via Azure`);
        }
      } else {
        // Fallback to simple email
        const fallbackSubject = `Kocky's Bar & Grill – ${emailData.bookingType} Received`;
        const fallbackHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Thank You for Your Inquiry!</h1>
            <p>Dear ${emailData.name},</p>
            <p>We've received your ${emailData.bookingType} request and are excited to help make your event special!</p>
            <p><strong>Confirmation Code:</strong> ${emailData.confirmationCode}</p>
            <p>Our team will review your request and contact you within 24 hours.</p>
            <p>Best regards,<br>The Kocky's Bar & Grill Team</p>
          </div>
        `;
        
        const fallbackEmailSent = await unifiedEmailService.sendEmail({
          to: formData.contactEmail || formData.email,
          subject: fallbackSubject,
          html: fallbackHtml,
          provider: 'azure'
        });

        if (fallbackEmailSent) {
          logger.info(`Fallback customer confirmation email sent for ${formType} inquiry via Azure`);
        } else {
          logger.warn(`Failed to send fallback customer confirmation email for ${formType} inquiry via Azure`);
        }
      }
    } catch (emailError) {
      logger.error('Failed to send confirmation email:', emailError);
      // Don't fail the entire request if email fails
    }
    
    // Send notification to admin using Azure email system
    if (process.env.ADMIN_EMAIL) {
      try {
        const adminSubject = `New ${emailData.bookingType} - ${confirmationCode}`;
        const adminHtml = generateAdminNotificationHtml(emailData, formType, confirmationCode);
        
        const adminEmailSent = await unifiedEmailService.sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: adminSubject,
          html: adminHtml,
          provider: 'azure'
        });

        if (adminEmailSent) {
          logger.info(`Admin notification email sent for ${formType} inquiry via Azure`);
        } else {
          logger.warn(`Failed to send admin notification email for ${formType} inquiry via Azure`);
        }
      } catch (adminEmailError) {
        logger.error('Failed to send admin notification:', adminEmailError);
      }
    }
    
    res.status(201).json({ 
      success: true, 
      confirmationCode,
      message: 'Your request has been received. Check your email for confirmation.',
      data: result 
    });
  } catch (error) {
    logger.error('Form submission error:', error);
    next(error);
  }
};

// Get all form submissions (admin)
export const getAllSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    
    let submissions: any[] = [];
    
    if (!type || type === 'food-truck') {
      const foodTruck = await prisma.foodTruckBooking.findMany({
        orderBy: { createdAt: 'desc' },
      });
      submissions = [...submissions, ...foodTruck.map(s => ({ ...s, type: 'food-truck' }))];
    }
    
    if (!type || type === 'mobile-bar') {
      const mobileBar = await prisma.mobileBarBooking.findMany({
        orderBy: { createdAt: 'desc' },
      });
      submissions = [...submissions, ...mobileBar.map(s => ({ ...s, type: 'mobile-bar' }))];
    }
    
    if (!type || type === 'contact') {
      const contact = await prisma.contactInquiry.findMany({
        orderBy: { createdAt: 'desc' },
      });
      submissions = [...submissions, ...contact.map(s => ({ ...s, type: 'contact' }))];
    }
    
    // Sort all submissions by date
    submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({ success: true, submissions });
  } catch (error) {
    next(error);
  }
};

// Get submission by confirmation code
export const getByConfirmationCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    
    // Check food truck bookings
    const foodTruck = await prisma.foodTruckBooking.findUnique({
      where: { confirmationCode: code },
    });
    if (foodTruck) {
      return res.json({ success: true, type: 'food-truck', data: foodTruck });
    }
    
    // Check mobile bar bookings
    const mobileBar = await prisma.mobileBarBooking.findUnique({
      where: { confirmationCode: code },
    });
    if (mobileBar) {
      return res.json({ success: true, type: 'mobile-bar', data: mobileBar });
    }
    
    return res.status(404).json({ 
      success: false, 
      message: 'No submission found with this confirmation code' 
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get template slug based on form type
function getTemplateSlugForFormType(formType: string): string {
  switch (formType) {
    case 'reservation':
      return 'reservation-confirmation';
    case 'mobile-bar':
      return 'mobile-bar-confirmation';
    case 'food-truck':
      return 'food-truck-confirmation';
    case 'catering':
      return 'catering-confirmation';
    default:
      return 'inquiry-confirmation';
  }
}

// Helper function to generate admin notification HTML
function generateAdminNotificationHtml(emailData: any, formType: string, confirmationCode: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .info-box { background: white; padding: 15px; border: 1px solid #ddd; margin: 15px 0; }
        .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #d4af37; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New ${emailData.bookingType} Inquiry</h1>
        </div>
        <div class="content">
          <div class="info-box">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${emailData.name}</p>
            <p><strong>Email:</strong> ${emailData.customerEmail || 'Not provided'}</p>
            <p><strong>Confirmation Code:</strong> ${confirmationCode}</p>
          </div>
          
          <div class="info-box">
            <h3>Event Details</h3>
            <p><strong>Service:</strong> ${emailData.bookingType}</p>
            ${emailData.date ? `<p><strong>Event Date:</strong> ${emailData.date}</p>` : ''}
            ${emailData.eventTime ? `<p><strong>Event Time:</strong> ${emailData.eventTime}</p>` : ''}
            ${emailData.location ? `<p><strong>Location:</strong> ${emailData.location}</p>` : ''}
            ${emailData.guestCount ? `<p><strong>Expected Guests:</strong> ${emailData.guestCount}</p>` : ''}
          </div>
          
          <p><strong>Action Required:</strong> Please review this inquiry and contact the customer within 24 hours.</p>
        </div>
        <div class="footer">
          Kocky's Bar & Grill CRM System
        </div>
      </div>
    </body>
    </html>
  `;
}
