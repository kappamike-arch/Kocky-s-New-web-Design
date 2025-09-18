import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { unifiedEmailService } from '../services/UnifiedEmailService';
import { renderEmailTemplate } from '../utils/email-template';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { ServiceType, InquiryStatus } from '@prisma/client';

// Unified form submission handler that creates both ContactInquiry and specific booking records
export const submitForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      formType, // 'reservation', 'mobile-bar', 'food-truck', 'catering'
      name,
      email,
      phone,
      eventDate,
      eventTime,
      eventLocation,
      guestCount,
      companyName,
      message,
      packageType,
      budget,
      specialRequests,
      ...additionalData
    } = req.body;

    const confirmationCode = uuidv4().slice(0, 8).toUpperCase();
    
    // Determine service type for ContactInquiry
    let serviceType: ServiceType;
    let subject: string;
    
    switch (formType) {
      case 'reservation':
        serviceType = ServiceType.RESERVATION;
        subject = `Reservation Request for ${guestCount || 0} guests`;
        break;
      case 'mobile-bar':
        serviceType = ServiceType.MOBILE_BAR;
        subject = `Mobile Bar Service Request - ${eventLocation || 'Location TBD'}`;
        break;
      case 'food-truck':
        serviceType = ServiceType.FOOD_TRUCK;
        subject = `Food Truck Booking Request - ${eventLocation || 'Location TBD'}`;
        break;
      case 'catering':
        serviceType = ServiceType.CATERING;
        subject = `Catering Request for ${guestCount || 0} guests`;
        break;
      default:
        serviceType = ServiceType.GENERAL;
        subject = 'Service Inquiry';
    }

    // Create unified ContactInquiry record for CRM
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone: phone || '',
        subject,
        message: message || specialRequests || `${formType} request`,
        serviceType,
        eventDate: eventDate ? new Date(eventDate) : null,
        eventTime: eventTime || null,
        eventLocation: eventLocation || null,
        guestCount: guestCount ? parseInt(guestCount) : null,
        companyName: companyName || null,
        status: InquiryStatus.NEW,
        confirmationCode,
        source: `${formType}-form`,
        tags: {
          packageType,
          budget,
          ...additionalData
        }
      }
    });

    // Create specific booking records based on form type
    let bookingRecord = null;
    
    if (formType === 'reservation' && eventDate) {
      bookingRecord = await prisma.reservation.create({
        data: {
          guestName: name,
          guestEmail: email,
          guestPhone: phone || '',
          date: new Date(eventDate),
          time: eventTime || '19:00',
          partySize: guestCount ? parseInt(guestCount) : 2,
          specialRequests: specialRequests || message || '',
          confirmationCode,
          status: 'PENDING'
        }
      });
    } else if (formType === 'mobile-bar' && eventDate) {
      bookingRecord = await prisma.mobileBarBooking.create({
        data: {
          contactName: name,
          contactEmail: email,
          contactPhone: phone || '',
          eventDate: new Date(eventDate),
          eventTime: eventTime || '',
          eventDuration: 4, // default 4 hours
          eventLocation: eventLocation || '',
          eventType: additionalData.eventType || 'Private Event',
          expectedGuests: guestCount ? parseInt(guestCount.toString()) : 50,
          packageType: packageType === 'premium' ? 'PREMIUM' : packageType === 'custom' ? 'CUSTOM' : packageType === 'basic' ? 'BASIC' : 'STANDARD',
          addOns: [],
          specialRequests: message || specialRequests || '',
          confirmationCode,
          status: 'PENDING'
        }
      });
    } else if (formType === 'food-truck' && eventDate) {
      bookingRecord = await prisma.foodTruckBooking.create({
        data: {
          contactName: name,
          contactEmail: email,
          contactPhone: phone || '',
          companyName: companyName || '',
          eventDate: new Date(eventDate),
          eventTime: eventTime || '',
          eventDuration: additionalData.eventDuration || 3,
          eventLocation: eventLocation || '',
          eventType: additionalData.eventType || 'Corporate Event',
          expectedGuests: guestCount ? parseInt(guestCount.toString()) : 50,
          budget: budget ? parseFloat(budget.toString()) : null,
          menuPreferences: additionalData.menuPreferences || '',
          additionalNotes: message || specialRequests || '',
          confirmationCode,
          status: 'PENDING'
        }
      });
    }

    // Send email notifications using Azure email system and proper templates
    try {
      // Prepare customer data for emails
      const customerData = {
        customerName: name,
        customerEmail: email,
        serviceName: getServiceDisplayName(formType),
        eventDate: eventDate ? new Date(eventDate).toLocaleDateString() : null,
        eventTime: eventTime || null,
        eventLocation: eventLocation || null,
        guestCount: guestCount || null,
        confirmationCode,
        message: message || specialRequests || 'No additional notes',
        packageType: packageType || null,
        budget: budget || null
      };

      // Get the appropriate email template based on form type
      const templateSlug = getTemplateSlugForFormType(formType);
      logger.info(`Looking for template with slug: ${templateSlug} for form type: ${formType}`);
      const template = await prisma.emailTemplate.findUnique({
        where: { slug: templateSlug }
      });
      
      if (template) {
        logger.info(`Found template: ${template.name} for ${formType} inquiry`);
      } else {
        logger.warn(`Template not found for slug: ${templateSlug}`);
      }

      if (template) {
        // Customer confirmation using database template

        const renderedSubject = renderEmailTemplate(template.subject, customerData);
        const renderedHtml = renderEmailTemplate(template.html, customerData);
        const renderedText = template.text ? renderEmailTemplate(template.text, customerData) : null;

        // Send customer confirmation via Azure email
        const customerEmailSent = await unifiedEmailService.sendEmail({
          to: email,
          subject: renderedSubject,
          html: renderedHtml,
          text: renderedText || undefined,
          provider: 'azure'
        });

        if (customerEmailSent) {
          logger.info(`Customer confirmation email sent for ${formType} inquiry ${inquiry.id}`);
        } else {
          logger.warn(`Failed to send customer confirmation email for ${formType} inquiry ${inquiry.id}`);
        }
      } else {
        // Fallback to Azure email system if template not found
        logger.warn(`Template ${templateSlug} not found, using fallback Azure email system`);
        const fallbackSubject = `We've Received Your ${formType === 'reservation' ? 'Reservation' : 'Booking'} Request - Kocky's`;
        const fallbackHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Thank You for Your Inquiry!</h1>
            <p>Dear ${customerData.customerName},</p>
            <p>We've received your ${customerData.serviceName} request and are excited to help make your event special!</p>
            <p><strong>Confirmation Code:</strong> ${customerData.confirmationCode}</p>
            <p>Our team will review your request and contact you within 24 hours.</p>
            <p>Best regards,<br>The Kocky's Bar & Grill Team</p>
          </div>
        `;
        
        const fallbackEmailSent = await unifiedEmailService.sendEmail({
          to: email,
          subject: fallbackSubject,
          html: fallbackHtml,
          provider: 'azure'
        });

        if (fallbackEmailSent) {
          logger.info(`Fallback customer confirmation email sent for ${formType} inquiry ${inquiry.id}`);
        } else {
          logger.warn(`Failed to send fallback customer confirmation email for ${formType} inquiry ${inquiry.id}`);
        }
      }

      // Admin notification (always use Azure email)
      const adminEmail = process.env.ADMIN_EMAIL || 'info@kockys.com';
      const adminSubject = `New ${getServiceDisplayName(formType)} Inquiry: ${name}`;
      const adminHtml = generateAdminNotificationHtml(inquiry, formType, customerData);
      
      const adminEmailSent = await unifiedEmailService.sendEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminHtml,
        provider: 'azure'
      });

      if (adminEmailSent) {
        logger.info(`Admin notification email sent for ${formType} inquiry ${inquiry.id}`);
      } else {
        logger.warn(`Failed to send admin notification email for ${formType} inquiry ${inquiry.id}`);
      }

    } catch (emailError) {
      logger.error('Email notification failed:', emailError);
      // Don't fail the request if email fails - inquiry is still saved
    }

    // Create activity log
    await prisma.inquiryNote.create({
      data: {
        inquiryId: inquiry.id,
        note: `${formType.replace('-', ' ')} form submitted via website`,
        createdBy: 'System'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Your request has been submitted successfully!',
      confirmationCode,
      inquiryId: inquiry.id,
      data: {
        inquiry,
        booking: bookingRecord
      }
    });
  } catch (error) {
    logger.error('Form submission error:', error);
    next(error);
  }
};

// Get all inquiries for CRM dashboard
export const getInquiries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      serviceType, 
      status, 
      startDate, 
      endDate,
      page = 1,
      limit = 20 
    } = req.query;

    const where: any = {};
    
    if (serviceType) {
      where.serviceType = serviceType;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.eventDate = {};
      if (startDate) where.eventDate.gte = new Date(startDate as string);
      if (endDate) where.eventDate.lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        include: {
          quotes: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.contactInquiry.count({ where })
    ]);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Failed to get inquiries:', error);
    next(error);
  }
};

// Update inquiry status
export const updateInquiryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const inquiry = await prisma.contactInquiry.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    // Add note about status change
    if (note) {
      await prisma.inquiryNote.create({
        data: {
          inquiryId: id,
          note: `Status changed to ${status}: ${note}`,
          createdBy: req.body.userId || 'Admin'
        }
      });
    }

    res.json({
      success: true,
      message: 'Inquiry status updated',
      data: inquiry
    });
  } catch (error) {
    logger.error('Failed to update inquiry status:', error);
    next(error);
  }
};

// Create quote from inquiry
export const createQuoteFromInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const quoteData = req.body;

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id }
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    const quote = await prisma.quote.create({
      data: {
        inquiryId: id,
        customerName: inquiry.name,
        customerEmail: inquiry.email,
        customerPhone: inquiry.phone,
        serviceType: inquiry.serviceType,
        eventDate: inquiry.eventDate,
        eventLocation: inquiry.eventLocation,
        ...quoteData,
        status: 'DRAFT'
      }
    });

    // Update inquiry status
    await prisma.contactInquiry.update({
      where: { id },
      data: { status: InquiryStatus.QUOTED }
    });

    // Add note
    await prisma.inquiryNote.create({
      data: {
        inquiryId: id,
        note: `Quote #${quote.quoteNumber} created`,
        createdBy: req.body.userId || 'Admin'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Quote created successfully',
      data: quote
    });
  } catch (error) {
    logger.error('Failed to create quote:', error);
    next(error);
  }
};

// Get inquiry details with all related data
export const getInquiryDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' }
        },
        emailLogs: {
          orderBy: { sentAt: 'desc' }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Get related booking if exists
    let relatedBooking = null;
    
    if (inquiry.confirmationCode && inquiry.serviceType === ServiceType.RESERVATION) {
      relatedBooking = await prisma.reservation.findFirst({
        where: { confirmationCode: inquiry.confirmationCode }
      });
    } else if (inquiry.confirmationCode && inquiry.serviceType === ServiceType.MOBILE_BAR) {
      relatedBooking = await prisma.mobileBarBooking.findFirst({
        where: { confirmationCode: inquiry.confirmationCode }
      });
    } else if (inquiry.confirmationCode && inquiry.serviceType === ServiceType.FOOD_TRUCK) {
      relatedBooking = await prisma.foodTruckBooking.findFirst({
        where: { confirmationCode: inquiry.confirmationCode }
      });
    }

    res.json({
      success: true,
      data: {
        inquiry,
        relatedBooking
      }
    });
  } catch (error) {
    logger.error('Failed to get inquiry details:', error);
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

// Helper function to get service display name
function getServiceDisplayName(formType: string): string {
  switch (formType) {
    case 'reservation':
      return 'Restaurant Reservation';
    case 'mobile-bar':
      return 'Mobile Bar Service';
    case 'food-truck':
      return 'Food Truck Catering';
    case 'catering':
      return 'Catering Service';
    default:
      return 'Service Inquiry';
  }
}

// Helper function to generate admin notification HTML
function generateAdminNotificationHtml(inquiry: any, formType: string, customerData: any): string {
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
          <h1>New ${getServiceDisplayName(formType)} Inquiry</h1>
        </div>
        <div class="content">
          <div class="info-box">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${customerData.customerName}</p>
            <p><strong>Email:</strong> ${customerData.customerEmail}</p>
            <p><strong>Phone:</strong> ${inquiry.phone || 'Not provided'}</p>
            <p><strong>Confirmation Code:</strong> ${customerData.confirmationCode}</p>
          </div>
          
          <div class="info-box">
            <h3>Event Details</h3>
            <p><strong>Service:</strong> ${customerData.serviceName}</p>
            ${customerData.eventDate ? `<p><strong>Event Date:</strong> ${customerData.eventDate}</p>` : ''}
            ${customerData.eventTime ? `<p><strong>Event Time:</strong> ${customerData.eventTime}</p>` : ''}
            ${customerData.eventLocation ? `<p><strong>Location:</strong> ${customerData.eventLocation}</p>` : ''}
            ${customerData.guestCount ? `<p><strong>Expected Guests:</strong> ${customerData.guestCount}</p>` : ''}
            ${customerData.packageType ? `<p><strong>Package Type:</strong> ${customerData.packageType}</p>` : ''}
            ${customerData.budget ? `<p><strong>Budget:</strong> ${customerData.budget}</p>` : ''}
          </div>
          
          ${customerData.message ? `
          <div class="info-box">
            <h3>Additional Notes</h3>
            <p>${customerData.message}</p>
          </div>
          ` : ''}
          
          <center>
            <a href="${process.env.ADMIN_URL || 'https://staging.kockys.com/admin'}/crm/inquiries/${inquiry.id}" class="button">
              View in CRM
            </a>
          </center>
          
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
