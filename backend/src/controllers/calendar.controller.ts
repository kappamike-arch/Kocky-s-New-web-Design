import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import ical, { ICalEventStatus } from 'ical-generator';
import { logger } from '../utils/logger';

// Interface for unified calendar event
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'reservation' | 'food-truck' | 'mobile-bar' | 'catering';
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  location?: string;
  guestCount?: number;
  description?: string;
  color?: string;
}

// Get all events for calendar display
export const getAllEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    // Build date filters
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }
    
    const events: CalendarEvent[] = [];
    
    // Fetch reservations
    if (!type || type === 'reservation') {
      const reservations = await prisma.reservation.findMany({
        where: dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {},
        orderBy: { date: 'asc' }
      });
      
      reservations.forEach(reservation => {
        const startDateTime = new Date(reservation.date);
        const [hours, minutes] = reservation.time.split(':').map(Number);
        startDateTime.setHours(hours, minutes);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 2); // Assume 2-hour reservation
        
        events.push({
          id: `reservation-${reservation.id}`,
          title: `Table for ${reservation.partySize} - ${reservation.guestName}`,
          start: startDateTime,
          end: endDateTime,
          type: 'reservation',
          status: reservation.status,
          customerName: reservation.guestName,
          customerEmail: reservation.guestEmail,
          customerPhone: reservation.guestPhone,
          guestCount: reservation.partySize,
          description: reservation.specialRequests || '',
          color: '#3B82F6', // Blue for reservations
        });
      });
    }
    
    // Fetch Food Truck bookings
    if (!type || type === 'food-truck') {
      const foodTruckBookings = await prisma.foodTruckBooking.findMany({
        where: dateFilter.gte || dateFilter.lte ? { eventDate: dateFilter } : {},
        orderBy: { eventDate: 'asc' }
      });
      
      foodTruckBookings.forEach(booking => {
        const startDateTime = new Date(booking.eventDate);
        const [hours, minutes] = booking.eventTime.split(':').map(Number);
        startDateTime.setHours(hours, minutes);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + booking.eventDuration);
        
        events.push({
          id: `food-truck-${booking.id}`,
          title: `Food Truck: ${booking.companyName || booking.contactName}`,
          start: startDateTime,
          end: endDateTime,
          type: 'food-truck',
          status: booking.status,
          customerName: booking.contactName,
          customerEmail: booking.contactEmail,
          customerPhone: booking.contactPhone,
          location: booking.eventLocation,
          guestCount: booking.expectedGuests,
          description: `${booking.eventType} - ${booking.additionalNotes || ''}`,
          color: '#F97316', // Color 2: Orange for Food Truck
        });
      });
    }
    
    // Fetch Mobile Bar bookings
    if (!type || type === 'mobile-bar') {
      const mobileBarBookings = await prisma.mobileBarBooking.findMany({
        where: dateFilter.gte || dateFilter.lte ? { eventDate: dateFilter } : {},
        orderBy: { eventDate: 'asc' }
      });
      
      mobileBarBookings.forEach(booking => {
        const startDateTime = new Date(booking.eventDate);
        const [hours, minutes] = booking.eventTime.split(':').map(Number);
        startDateTime.setHours(hours, minutes);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + booking.eventDuration);
        
        events.push({
          id: `mobile-bar-${booking.id}`,
          title: `Mobile Bar: ${booking.contactName}`,
          start: startDateTime,
          end: endDateTime,
          type: 'mobile-bar',
          status: booking.status,
          customerName: booking.contactName,
          customerEmail: booking.contactEmail,
          customerPhone: booking.contactPhone,
          location: booking.eventLocation,
          guestCount: booking.expectedGuests,
          description: `${booking.eventType} - ${booking.packageType} package`,
          color: '#8B5CF6', // Color 1: Purple for Mobile Bar
        });
      });
    }
    
    // Fetch ALL confirmed CRM inquiries (WON status) from ContactInquiry
    // This includes Food Truck, Mobile Bar, and Catering
    const crmInquiries = await prisma.contactInquiry.findMany({
      where: {
        status: 'WON', // Only confirmed inquiries
        serviceType: { in: ['FOOD_TRUCK', 'MOBILE_BAR', 'CATERING'] },
        ...(dateFilter.gte || dateFilter.lte ? { eventDate: dateFilter } : {})
      },
      orderBy: { eventDate: 'asc' }
    });
      
    // Process CRM inquiries and add them to calendar based on service type
    crmInquiries.forEach(inquiry => {
      if (inquiry.eventDate) {
        const startDateTime = new Date(inquiry.eventDate);
        if (inquiry.eventTime) {
          const [hours, minutes] = inquiry.eventTime.split(':').map(Number);
          startDateTime.setHours(hours, minutes);
        }
        
        // Determine event duration and color based on service type
        let duration = 4; // Default duration in hours
        let color = '#10B981'; // Default green
        let typeLabel = 'catering';
        
        switch (inquiry.serviceType) {
          case 'MOBILE_BAR':
            if (!type || type === 'mobile-bar') {
              duration = 5; // Mobile bar events typically 5 hours
              color = '#8B5CF6'; // Color 1: Purple for Mobile Bar
              typeLabel = 'mobile-bar';
            } else return;
            break;
          case 'FOOD_TRUCK':
            if (!type || type === 'food-truck') {
              duration = 4; // Food truck events typically 4 hours
              color = '#F97316'; // Color 2: Orange for Food Truck
              typeLabel = 'food-truck';
            } else return;
            break;
          case 'CATERING':
            if (!type || type === 'catering') {
              duration = 4; // Catering events typically 4 hours
              color = '#10B981'; // Color 3: Green for Catering
              typeLabel = 'catering';
            } else return;
            break;
          default:
            return; // Skip other service types
        }
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + duration);
        
        const servicePrefix = inquiry.serviceType.replace('_', ' ').toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase());
        
        events.push({
          id: `crm-${inquiry.serviceType.toLowerCase()}-${inquiry.id}`,
          title: `${servicePrefix}: ${inquiry.name}${inquiry.companyName ? ` (${inquiry.companyName})` : ''}`,
          start: startDateTime,
          end: endDateTime,
          type: typeLabel as any,
          status: 'CONFIRMED', // All WON inquiries are confirmed
          customerName: inquiry.name,
          customerEmail: inquiry.email,
          customerPhone: inquiry.phone || undefined,
          location: inquiry.eventLocation || undefined,
          guestCount: inquiry.guestCount || undefined,
          description: `${inquiry.subject}\n${inquiry.message}`,
          color: color,
        });
      }
    });
    
    res.json({
      success: true,
      events,
      total: events.length
    });
  } catch (error) {
    logger.error('Failed to fetch calendar events:', error);
    next(error);
  }
};

// Generate iCal feed for calendar subscriptions
export const getICalFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Create calendar instance
    const calendar = ical({
      name: "Kocky's Bar & Grill - Events Calendar",
      description: "All reservations, bookings, and events for Kocky's Bar & Grill",
      timezone: process.env.TIMEZONE || 'America/New_York',
      prodId: {
        company: "Kocky's Bar & Grill",
        product: 'Employee Calendar',
      }
    });
    
    // Fetch all future events
    const now = new Date();
    const events: CalendarEvent[] = [];
    
    // Get all reservations
    const reservations = await prisma.reservation.findMany({
      where: { 
        date: { gte: now },
        status: { not: 'CANCELLED' }
      },
      orderBy: { date: 'asc' }
    });
    
    reservations.forEach(reservation => {
      const startDateTime = new Date(reservation.date);
      const [hours, minutes] = reservation.time.split(':').map(Number);
      startDateTime.setHours(hours, minutes);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 2);
      
      const event = calendar.createEvent({
        start: startDateTime,
        end: endDateTime,
        summary: `[Reservation] ${reservation.guestName} - Party of ${reservation.partySize}`,
        description: `Customer: ${reservation.guestName}\nEmail: ${reservation.guestEmail}\nPhone: ${reservation.guestPhone}\nStatus: ${reservation.status}\n${reservation.specialRequests ? `Notes: ${reservation.specialRequests}` : ''}`,
        location: "Kocky's Bar & Grill - Main Dining Room"
      });
      // @ts-ignore - Type issue with ical-generator categories method
      event.categories([{ name: 'reservation' }]);
      // @ts-ignore - Type issue with ical-generator status method
      event.status(reservation.status === 'CONFIRMED' ? ICalEventStatus.CONFIRMED : ICalEventStatus.TENTATIVE);
      // @ts-ignore - Type issue with ical-generator uid method
      event.uid(`reservation-${reservation.id}@kockys.com`);
    });
    
    // Get all food truck bookings
    const foodTruckBookings = await prisma.foodTruckBooking.findMany({
      where: { 
        eventDate: { gte: now },
        status: { not: 'CANCELLED' }
      },
      orderBy: { eventDate: 'asc' }
    });
    
    foodTruckBookings.forEach(booking => {
      const startDateTime = new Date(booking.eventDate);
      const [hours, minutes] = booking.eventTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + booking.eventDuration);
      
      const event = calendar.createEvent({
        start: startDateTime,
        end: endDateTime,
        summary: `[Food Truck] ${booking.companyName || booking.contactName} - ${booking.eventType}`,
        description: `Contact: ${booking.contactName}\nEmail: ${booking.contactEmail}\nPhone: ${booking.contactPhone}\nCompany: ${booking.companyName || 'N/A'}\nGuests: ${booking.expectedGuests}\nStatus: ${booking.status}\n${booking.additionalNotes ? `Notes: ${booking.additionalNotes}` : ''}`,
        location: booking.eventLocation
      });
      // @ts-ignore - Type issue with ical-generator categories method
      event.categories([{ name: 'food-truck' }]);
      // @ts-ignore - Type issue with ical-generator status method
      event.status(booking.status === 'CONFIRMED' ? ICalEventStatus.CONFIRMED : ICalEventStatus.TENTATIVE);
      // @ts-ignore - Type issue with ical-generator uid method
      event.uid(`food-truck-${booking.id}@kockys.com`);
    });
    
    // Get all mobile bar bookings
    const mobileBarBookings = await prisma.mobileBarBooking.findMany({
      where: { 
        eventDate: { gte: now },
        status: { not: 'CANCELLED' }
      },
      orderBy: { eventDate: 'asc' }
    });
    
    mobileBarBookings.forEach(booking => {
      const startDateTime = new Date(booking.eventDate);
      const [hours, minutes] = booking.eventTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + booking.eventDuration);
      
      const event = calendar.createEvent({
        start: startDateTime,
        end: endDateTime,
        summary: `[Mobile Bar] ${booking.contactName} - ${booking.eventType}`,
        description: `Contact: ${booking.contactName}\nEmail: ${booking.contactEmail}\nPhone: ${booking.contactPhone}\nGuests: ${booking.expectedGuests}\nPackage: ${booking.packageType}\nStatus: ${booking.status}\n${booking.specialRequests ? `Notes: ${booking.specialRequests}` : ''}`,
        location: booking.eventLocation
      });
      // @ts-ignore - Type issue with ical-generator categories method
      event.categories([{ name: 'mobile-bar' }]);
      // @ts-ignore - Type issue with ical-generator status method
      event.status(booking.status === 'CONFIRMED' ? ICalEventStatus.CONFIRMED : ICalEventStatus.TENTATIVE);
      // @ts-ignore - Type issue with ical-generator uid method
      event.uid(`mobile-bar-${booking.id}@kockys.com`);
    });
    
    // Get ALL confirmed CRM inquiries (WON status)
    const crmInquiries = await prisma.contactInquiry.findMany({
      where: {
        serviceType: { in: ['FOOD_TRUCK', 'MOBILE_BAR', 'CATERING'] },
        eventDate: { gte: now },
        status: 'WON' // Only confirmed inquiries
      },
      orderBy: { eventDate: 'asc' }
    });
    
    crmInquiries.forEach(inquiry => {
      if (inquiry.eventDate) {
        const startDateTime = new Date(inquiry.eventDate);
        if (inquiry.eventTime) {
          const [hours, minutes] = inquiry.eventTime.split(':').map(Number);
          startDateTime.setHours(hours, minutes);
        }
        
        // Determine duration based on service type
        let duration = 4;
        let serviceLabel = 'Event';
        switch (inquiry.serviceType) {
          case 'MOBILE_BAR':
            duration = 5;
            serviceLabel = 'Mobile Bar';
            break;
          case 'FOOD_TRUCK':
            duration = 4;
            serviceLabel = 'Food Truck';
            break;
          case 'CATERING':
            duration = 4;
            serviceLabel = 'Catering';
            break;
        }
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + duration);
        
        const event = calendar.createEvent({
          start: startDateTime,
          end: endDateTime,
          summary: `[${serviceLabel}] ${inquiry.name}${inquiry.companyName ? ` - ${inquiry.companyName}` : ''} - ${inquiry.guestCount || '?'} guests`,
          description: `Contact: ${inquiry.name}\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone || 'N/A'}\nCompany: ${inquiry.companyName || 'N/A'}\nGuests: ${inquiry.guestCount || 'TBD'}\nLocation: ${inquiry.eventLocation || 'TBD'}\nService: ${serviceLabel}\nSubject: ${inquiry.subject}\nMessage: ${inquiry.message}`,
          location: inquiry.eventLocation || 'TBD'
        });
        // @ts-ignore - Type issue with ical-generator categories method
        event.categories([{ name: inquiry.serviceType.toLowerCase().replace('_', '-') }]);
        // @ts-ignore - Type issue with ical-generator status method
        event.status(ICalEventStatus.CONFIRMED); // All WON inquiries are confirmed
        // @ts-ignore - Type issue with ical-generator uid method
        event.uid(`crm-${inquiry.serviceType.toLowerCase()}-${inquiry.id}@kockys.com`);
      }
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kockys-events.ics"');
    
    // Send calendar
    res.send(calendar.toString());
  } catch (error) {
    logger.error('Failed to generate iCal feed:', error);
    next(error);
  }
};

// Get event statistics
export const getEventStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const [
      todayReservations,
      todayFoodTruck,
      todayMobileBar,
      weekReservations,
      weekFoodTruck,
      weekMobileBar,
      monthReservations,
      monthFoodTruck,
      monthMobileBar,
      pendingReservations,
      pendingFoodTruck,
      pendingMobileBar,
      todayCRM,
      weekCRM,
      monthCRM,
      pendingCRM
    ] = await Promise.all([
      // Today's events
      prisma.reservation.count({ 
        where: { date: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } } 
      }),
      prisma.foodTruckBooking.count({ 
        where: { eventDate: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } } 
      }),
      prisma.mobileBarBooking.count({ 
        where: { eventDate: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } } 
      }),
      
      // This week's events
      prisma.reservation.count({ 
        where: { date: { gte: today, lt: nextWeek }, status: { not: 'CANCELLED' } } 
      }),
      prisma.foodTruckBooking.count({ 
        where: { eventDate: { gte: today, lt: nextWeek }, status: { not: 'CANCELLED' } } 
      }),
      prisma.mobileBarBooking.count({ 
        where: { eventDate: { gte: today, lt: nextWeek }, status: { not: 'CANCELLED' } } 
      }),
      
      // This month's events
      prisma.reservation.count({ 
        where: { date: { gte: today, lt: nextMonth }, status: { not: 'CANCELLED' } } 
      }),
      prisma.foodTruckBooking.count({ 
        where: { eventDate: { gte: today, lt: nextMonth }, status: { not: 'CANCELLED' } } 
      }),
      prisma.mobileBarBooking.count({ 
        where: { eventDate: { gte: today, lt: nextMonth }, status: { not: 'CANCELLED' } } 
      }),
      
      // Pending events
      prisma.reservation.count({ 
        where: { status: 'PENDING', date: { gte: today } } 
      }),
      prisma.foodTruckBooking.count({ 
        where: { status: 'PENDING', eventDate: { gte: today } } 
      }),
      prisma.mobileBarBooking.count({ 
        where: { status: 'PENDING', eventDate: { gte: today } } 
      }),
      
      // CRM Inquiries (confirmed/WON)
      prisma.contactInquiry.count({
        where: { 
          serviceType: { in: ['FOOD_TRUCK', 'MOBILE_BAR', 'CATERING'] },
          status: 'WON',
          eventDate: { gte: today, lt: tomorrow }
        }
      }),
      prisma.contactInquiry.count({
        where: { 
          serviceType: { in: ['FOOD_TRUCK', 'MOBILE_BAR', 'CATERING'] },
          status: 'WON',
          eventDate: { gte: today, lt: nextWeek }
        }
      }),
      prisma.contactInquiry.count({
        where: { 
          serviceType: { in: ['FOOD_TRUCK', 'MOBILE_BAR', 'CATERING'] },
          status: 'WON',
          eventDate: { gte: today, lt: nextMonth }
        }
      }),
      prisma.contactInquiry.count({
        where: { 
          serviceType: { in: ['FOOD_TRUCK', 'MOBILE_BAR', 'CATERING'] },
          status: { in: ['NEW', 'CONTACTED', 'QUOTED', 'NEGOTIATING'] },
          eventDate: { gte: today }
        }
      }),
    ]);
    
    res.json({
      success: true,
      stats: {
        today: {
          total: todayReservations + todayFoodTruck + todayMobileBar + todayCRM,
          reservations: todayReservations,
          foodTruck: todayFoodTruck,
          mobileBar: todayMobileBar,
          crmInquiries: todayCRM,
        },
        thisWeek: {
          total: weekReservations + weekFoodTruck + weekMobileBar + weekCRM,
          reservations: weekReservations,
          foodTruck: weekFoodTruck,
          mobileBar: weekMobileBar,
          crmInquiries: weekCRM,
        },
        thisMonth: {
          total: monthReservations + monthFoodTruck + monthMobileBar + monthCRM,
          reservations: monthReservations,
          foodTruck: monthFoodTruck,
          mobileBar: monthMobileBar,
          crmInquiries: monthCRM,
        },
        pending: {
          total: pendingReservations + pendingFoodTruck + pendingMobileBar + pendingCRM,
          reservations: pendingReservations,
          foodTruck: pendingFoodTruck,
          mobileBar: pendingMobileBar,
          crmInquiries: pendingCRM,
        }
      }
    });
  } catch (error) {
    logger.error('Failed to fetch event statistics:', error);
    next(error);
  }
};

