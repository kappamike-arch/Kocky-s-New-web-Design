import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { sendEmail } from '../utils/email';
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
            eventType: formData.eventType,
            expectedGuests: parseInt(formData.guestCount || formData.expectedGuests),
            packageType: formData.packageType || 'CUSTOM',
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
    
    // Send confirmation email
    try {
      await sendEmail({
        to: formData.contactEmail || formData.email,
        subject: `Kocky's Bar & Grill – ${emailData.bookingType} Received`,
        template: 'booking-received',
        data: emailData,
      });
      logger.info(`Confirmation email sent to ${formData.contactEmail || formData.email}`);
    } catch (emailError) {
      logger.error('Failed to send confirmation email:', emailError);
      // Don't fail the entire request if email fails
    }
    
    // Send notification to admin
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `New ${emailData.bookingType} - ${confirmationCode}`,
          template: 'booking-received',
          data: {
            ...emailData,
            name: 'Admin',
          },
        });
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
