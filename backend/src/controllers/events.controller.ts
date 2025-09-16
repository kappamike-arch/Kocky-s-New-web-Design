import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs/promises';

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Get all published events (public)
export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        startAt: {
          gte: new Date() // Only future events
        }
      },
      orderBy: {
        startAt: 'asc'
      },
      skip,
      take: Number(limit)
    });
    
    const total = await prisma.event.count({
      where: {
        isPublished: true,
        startAt: {
          gte: new Date()
        }
      }
    });
    
    res.json({
      success: true,
      data: events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Failed to fetch events:', error);
    next(error);
  }
};

// Get event by slug (public)
export const getEventBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { slug }
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    if (!event.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error('Failed to fetch event:', error);
    next(error);
  }
};

// Create RSVP (public) - DISABLED: RSVP model not implemented
// export const createRSVP = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { id } = req.params;
//     const { name, email, phone, wantsSms = false, wantsEmail = true } = req.body;
    
//     // Validate required fields
//     if (!name || !email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name and email are required'
//       });
//     }
    
//     // Check if event exists and is published
//     const event = await prisma.event.findUnique({
//       where: { id }
//     });
    
//     if (!event || !event.isPublished) {
//       return res.status(404).json({
//         success: false,
//         message: 'Event not found'
//       });
//     }
    
//     // Check if RSVP already exists for this email
//     const existingRSVP = await prisma.rSVP.findFirst({
//       where: {
//         eventId: id,
//         email
//       }
//     });
    
//     if (existingRSVP) {
//       return res.status(400).json({
//         success: false,
//         message: 'You have already RSVPed for this event'
//       });
//     }
    
//     const rsvp = await prisma.rSVP.create({
//       data: {
//         eventId: id,
//         name,
//         email,
//         phone: phone || null,
//         wantsSms: Boolean(wantsSms),
//         wantsEmail: Boolean(wantsEmail)
//       }
//     });
    
//     res.status(201).json({
//       success: true,
//       data: rsvp,
//       message: 'RSVP created successfully'
//     });
//   } catch (error) {
//     logger.error('Failed to create RSVP:', error);
//     next(error);
//   }
// };

// Temporary placeholder for RSVP function
export const createRSVP = async (req: Request, res: Response, next: NextFunction) => {
  res.status(501).json({
    success: false,
    message: 'RSVP functionality not yet implemented'
  });
};

// Get event ICS file (public)
export const getEventICS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!event || !event.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const icsContent = generateICS(event);
    
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${event.slug}.ics"`);
    res.send(icsContent);
  } catch (error) {
    logger.error('Failed to generate ICS:', error);
    next(error);
  }
};

// Subscribe to reminders (public)
export const subscribeToReminders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { email, phone, wantsSms = false, wantsEmail = true } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone is required'
      });
    }
    
    const event = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!event || !event.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // For now, just log the subscription
    // TODO: Implement actual email/SMS service integration
    logger.info('Event reminder subscription:', {
      eventId: id,
      eventTitle: event.title,
      email,
      phone,
      wantsSms,
      wantsEmail
    });
    
    res.json({
      success: true,
      message: 'Reminder subscription created successfully'
    });
  } catch (error) {
    logger.error('Failed to subscribe to reminders:', error);
    next(error);
  }
};

// Create event (admin)
export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      startAt,
      endAt,
      venueName,
      addressLine1,
      addressLine2,
      city,
      state,
      zip,
      videoUrl,
      isPublished = false
    } = req.body;
    
    if (!title || !startAt) {
      return res.status(400).json({
        success: false,
        message: 'Title and start date are required'
      });
    }
    
    let slug = generateSlug(title);
    
    // Ensure slug is unique
    let counter = 1;
    let originalSlug = slug;
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }
    
    const eventData: any = {
      title,
      slug,
      description,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : null,
      venueName,
      addressLine1,
      addressLine2,
      city,
      state,
      zip,
      videoUrl,
      isPublished: Boolean(isPublished)
    };
    
    if (req.file) {
      eventData.heroImageUrl = `/uploads/images/events/${req.file.filename}`;
    }
    
    const event = await prisma.event.create({
      data: eventData
    });
    
    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    logger.error('Failed to create event:', error);
    next(error);
  }
};

// Update event (admin)
export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startAt,
      endAt,
      venueName,
      addressLine1,
      addressLine2,
      city,
      state,
      zip,
      videoUrl,
      isPublished
    } = req.body;
    
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const updateData: any = {};
    
    if (title) {
      updateData.title = title;
      updateData.slug = generateSlug(title);
      
      // Ensure slug is unique (excluding current event)
      let counter = 1;
      let originalSlug = updateData.slug;
      while (await prisma.event.findFirst({ 
        where: { 
          slug: updateData.slug,
          id: { not: id }
        } 
      })) {
        updateData.slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }
    
    if (description !== undefined) updateData.description = description;
    if (startAt) updateData.startAt = new Date(startAt);
    if (endAt !== undefined) updateData.endAt = endAt ? new Date(endAt) : null;
    if (venueName !== undefined) updateData.venueName = venueName;
    if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zip !== undefined) updateData.zip = zip;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
    
    if (req.file) {
      updateData.heroImageUrl = `/uploads/images/events/${req.file.filename}`;
      
      // Try to delete old image
      if (existingEvent.heroImageUrl) {
        const oldImagePath = path.join(__dirname, '../../../', existingEvent.heroImageUrl);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          // File might not exist
        }
      }
    }
    
    const event = await prisma.event.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update event:', error);
    next(error);
  }
};

// Delete event (admin)
export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Delete from database (RSVPs will be cascade deleted)
    await prisma.event.delete({
      where: { id }
    });
    
    // Try to delete associated files
    if (event.heroImageUrl) {
      const imagePath = path.join(__dirname, '../../../', event.heroImageUrl);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        // File might not exist
      }
    }
    
    if (event.videoUrl && event.videoUrl.startsWith('/uploads/')) {
      const videoPath = path.join(__dirname, '../../../', event.videoUrl);
      try {
        await fs.unlink(videoPath);
      } catch (err) {
        // File might not exist
      }
    }
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete event:', error);
    next(error);
  }
};

// Toggle event publish status (admin)
export const toggleEventPublish = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { isPublished: !event.isPublished }
    });
    
    res.json({
      success: true,
      data: updatedEvent,
      message: `Event ${updatedEvent.isPublished ? 'published' : 'unpublished'}`
    });
  } catch (error) {
    logger.error('Failed to toggle event publish status:', error);
    next(error);
  }
};

// Upload event image (admin)
export const uploadEventImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }
    
    const imageUrl = `/uploads/images/events/${req.file.filename}`;
    
    res.json({
      success: true,
      data: { url: imageUrl },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    logger.error('Failed to upload event image:', error);
    next(error);
  }
};

// Upload event video (admin)
export const uploadEventVideo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required'
      });
    }
    
    const videoUrl = `/uploads/videos/events/${req.file.filename}`;
    
    res.json({
      success: true,
      data: { url: videoUrl },
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    logger.error('Failed to upload event video:', error);
    next(error);
  }
};

// Generate ICS content
const generateICS = (event: any): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startDate = formatDate(new Date(event.startAt));
  const endDate = event.endAt ? formatDate(new Date(event.endAt)) : startDate;
  
  let location = '';
  if (event.venueName) {
    location = event.venueName;
    if (event.addressLine1) {
      location += `, ${event.addressLine1}`;
    }
    if (event.city) {
      location += `, ${event.city}`;
    }
    if (event.state) {
      location += `, ${event.state}`;
    }
  }
  
  const description = event.description || '';
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kocky's Bar & Grill//Event Calendar//EN
BEGIN:VEVENT
UID:${event.id}@kockys.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
};

