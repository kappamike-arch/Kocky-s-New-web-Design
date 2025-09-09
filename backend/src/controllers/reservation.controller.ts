import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

export const createReservation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { guestName, guestEmail, guestPhone, date, time, partySize, specialRequests } = req.body;
    const confirmationCode = uuidv4().slice(0, 8).toUpperCase();

    const reservation = await prisma.reservation.create({
      data: {
        userId: req.user?.id,
        guestName,
        guestEmail,
        guestPhone,
        date: new Date(date),
        time,
        partySize,
        specialRequests,
        confirmationCode,
      },
    });

    // Send confirmation email
    await sendEmail({
      to: guestEmail,
      subject: 'Reservation Confirmation - Kocky\'s Bar & Grill',
      template: 'reservation-confirmation',
      data: {
        name: guestName,
        date: new Date(date).toLocaleDateString(),
        time,
        partySize,
        confirmationCode,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReservations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, status, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (date) where.date = new Date(date as string);
    if (status) where.status = status;

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.reservation.count({ where }),
    ]);

    res.json({
      success: true,
      reservations,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    res.json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
};

export const updateReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.update({
      where: { id },
      data: req.body,
    });

    res.json({
      success: true,
      message: 'Reservation updated successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.reservation.delete({ where: { id } });
    res.json({
      success: true,
      message: 'Reservation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getReservationByConfirmationCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { confirmationCode } = req.params;
    const reservation = await prisma.reservation.findUnique({
      where: { confirmationCode },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    res.json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
};

export const checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, time, partySize } = req.query;
    
    // In a real implementation, check against restaurant capacity
    const available = true; // Placeholder
    
    res.json({
      success: true,
      available,
      message: available ? 'Time slot available' : 'Time slot not available',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, reservations });
  } catch (error) {
    next(error);
  }
};

export const confirmReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });

    res.json({
      success: true,
      message: 'Reservation confirmed',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({
      success: true,
      message: 'Reservation cancelled',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};
