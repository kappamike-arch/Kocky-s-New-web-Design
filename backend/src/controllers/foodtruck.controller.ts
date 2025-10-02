import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const confirmationCode = uuidv4().slice(0, 8).toUpperCase();
    const booking = await prisma.foodTruckBooking.create({
      data: {
        ...req.body,
        userId: req.user?.id,
        confirmationCode,
        eventDate: new Date(req.body.eventDate),
      },
    });

    await sendEmail({
      to: req.body.contactEmail,
      subject: 'Food Truck Booking Request Received',
      template: 'booking-received',
      data: {
        name: req.body.contactName,
        bookingType: 'Food Truck',
        date: new Date(req.body.eventDate).toLocaleDateString(),
        confirmationCode,
      },
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.foodTruckBooking.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.foodTruckBooking.findUnique({
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
    const booking = await prisma.foodTruckBooking.update({
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
    await prisma.foodTruckBooking.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    next(error);
  }
};

export const getBookingByConfirmationCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.foodTruckBooking.findUnique({
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
