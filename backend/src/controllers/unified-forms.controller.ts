import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { sendEmail } from '../utils/email';
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

    // Send email notifications
    try {
      // Admin notification
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@kockysbar.com';
      await sendEmail({
        to: adminEmail,
        subject: `New ${formType.replace('-', ' ').toUpperCase()} Inquiry: ${name}`,
        template: 'admin-notification',
        data: {
          inquiryType: formType,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          eventDate: eventDate ? new Date(eventDate).toLocaleDateString() : 'Not specified',
          eventTime: eventTime || 'Not specified',
          eventLocation: eventLocation || 'Not specified',
          guestCount: guestCount || 'Not specified',
          message: message || specialRequests || 'No additional notes',
          confirmationCode,
          crmLink: `${process.env.ADMIN_URL || 'https://staging.kockys.com/admin'}/crm/inquiries/${inquiry.id}`
        }
      });

      // Customer confirmation
      await sendEmail({
        to: email,
        subject: `We've Received Your ${formType === 'reservation' ? 'Reservation' : 'Booking'} Request - Kocky's`,
        template: 'customer-confirmation',
        data: {
          name,
          serviceType: formType.replace('-', ' '),
          eventDate: eventDate ? new Date(eventDate).toLocaleDateString() : null,
          eventTime,
          confirmationCode,
          message: 'Thank you for your inquiry! We will review your request and get back to you within 24 hours.'
        }
      });

      logger.info(`Email notifications sent for ${formType} inquiry ${inquiry.id}`);
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
