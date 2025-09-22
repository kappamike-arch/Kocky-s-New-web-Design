import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { sendEmail } from '../utils/email';
import o365EmailService from '../services/o365EmailService';
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

    // Send emails using Office 365 service
    let emailStatus = { adminSent: false, customerSent: false };
    
    try {
      // Send internal admin notification
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔔 New ${formType.replace('-', ' ').toUpperCase()} Inquiry</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">A new ${formType.replace('-', ' ')} inquiry has been submitted through the website:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <h3 style="margin-top: 0; color: #b22222;">Customer Information</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>👤 Name:</strong> ${name}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📧 Email:</strong> ${email}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📞 Phone:</strong> ${phone || 'Not provided'}</li>
                ${companyName ? `<li style="margin: 10px 0; font-size: 16px;"><strong>🏢 Company:</strong> ${companyName}</li>` : ''}
              </ul>
              <h3 style="color: #b22222; margin-top: 20px;">Event Details</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📅 Event Date:</strong> ${eventDate ? new Date(eventDate).toLocaleDateString() : 'Not specified'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🕐 Event Time:</strong> ${eventTime || 'Not specified'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📍 Location:</strong> ${eventLocation || 'Not specified'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>👥 Guest Count:</strong> ${guestCount || 'Not specified'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>💰 Budget:</strong> ${budget || 'Not specified'}</li>
                ${packageType ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📦 Package:</strong> ${packageType}</li>` : ''}
                <li style="margin: 10px 0; font-size: 16px;"><strong>📝 Special Requests:</strong> ${message || specialRequests || 'No additional notes'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${confirmationCode}</span></li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;"><strong>Action Required:</strong> Please review this inquiry and contact the customer to discuss details.</p>
          </div>
        </div>
      `;

      emailStatus.adminSent = await o365EmailService.sendEmail({
        to: 'info@kockys.com',
        subject: `New ${formType.replace('-', ' ').toUpperCase()} Inquiry - Kocky's Bar & Grill`,
        html: adminEmailHtml,
      });

      // Send customer confirmation
      const customerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Inquiry Received!</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your interest in Kocky's Bar & Grill! We have received your ${formType.replace('-', ' ')} inquiry and will get back to you within 24-48 hours.</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📅 Event Date:</strong> ${eventDate ? new Date(eventDate).toLocaleDateString() : 'Not specified'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>👥 Guest Count:</strong> ${guestCount || 'Not specified'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${confirmationCode}</span></li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">We look forward to helping you plan a fantastic event!</p>
            <p style="font-size: 16px; margin-bottom: 20px;">If you have any immediate questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
            <p style="font-size: 16px;">Best regards,<br><strong>The Kocky's Team</strong></p>
          </div>
        </div>
      `;

      emailStatus.customerSent = await o365EmailService.sendEmail({
        to: email,
        subject: `${formType.replace('-', ' ').toUpperCase()} Inquiry Received - Kocky's Bar & Grill`,
        html: customerEmailHtml,
      });

      if (emailStatus.adminSent) {
        console.log('✅ Internal inquiry notification sent to info@kockys.com');
        logger.info(`Email notifications sent for ${formType} inquiry ${inquiry.id}`);
      } else {
        console.log('⚠️ Internal inquiry notification not sent (email service not configured)');
      }

      if (emailStatus.customerSent) {
        console.log('✅ Inquiry confirmation sent to customer:', email);
      } else {
        console.log('⚠️ Inquiry confirmation not sent (email service not configured)');
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
      },
      emailStatus,
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
