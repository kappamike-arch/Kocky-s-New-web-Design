import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const confirmationCode = uuidv4().slice(0, 8).toUpperCase();
    const booking = await prisma.mobileBarBooking.create({
      data: {
        ...req.body,
        userId: req.user?.id,
        confirmationCode,
        eventDate: new Date(req.body.eventDate),
      },
    });

    await sendEmail({
      to: req.body.contactEmail,
      subject: 'Mobile Bar Service Booking Request Received',
      template: 'booking-received',
      data: {
        name: req.body.contactName,
        bookingType: 'Mobile Bar Service',
        date: new Date(req.body.eventDate).toLocaleDateString(),
        confirmationCode,
      },
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const getPackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packages = [
      {
        id: 'BASIC',
        name: 'Basic Package',
        description: 'Essential bar service for smaller events',
        price: 500,
        includes: ['2 Bartenders', 'Basic mixers', 'Disposable cups', 'Up to 50 guests'],
      },
      {
        id: 'STANDARD',
        name: 'Standard Package',
        description: 'Full bar service for medium events',
        price: 1000,
        includes: ['3 Bartenders', 'Premium mixers', 'Glassware', 'Up to 100 guests', 'Bar setup'],
      },
      {
        id: 'PREMIUM',
        name: 'Premium Package',
        description: 'Luxury bar experience for large events',
        price: 2000,
        includes: ['5 Bartenders', 'Top-shelf liquors', 'Premium glassware', 'Up to 200 guests', 'Full bar setup', 'Signature cocktails'],
      },
      {
        id: 'CUSTOM',
        name: 'Custom Package',
        description: 'Tailored to your specific needs',
        price: null,
        includes: ['Customizable options', 'Flexible pricing', 'Consultation required'],
      },
    ];
    res.json({ success: true, packages });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.mobileBarBooking.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.mobileBarBooking.findUnique({
      where: { id: req.params.id },
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.mobileBarBooking.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.mobileBarBooking.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    next(error);
  }
};

export const getBookingByConfirmationCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.mobileBarBooking.findUnique({
      where: { confirmationCode: req.params.confirmationCode },
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};
