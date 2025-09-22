import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/email';
import o365EmailService from '../services/o365EmailService';
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

    // Send emails using Office 365 service
    let emailStatus = { adminSent: false, customerSent: false };
    
    try {
      // Send internal admin notification
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔔 New Reservation Inquiry</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">A new reservation has been submitted through the website:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <h3 style="margin-top: 0; color: #b22222;">Customer Information</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>👤 Name:</strong> ${guestName}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📧 Email:</strong> ${guestEmail}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📞 Phone:</strong> ${guestPhone}</li>
              </ul>
              <h3 style="color: #b22222; margin-top: 20px;">Reservation Details</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📅 Date:</strong> ${new Date(date).toLocaleDateString()}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🕐 Time:</strong> ${time}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>👥 Party Size:</strong> ${partySize} guests</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${confirmationCode}</span></li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📝 Special Requests:</strong> ${specialRequests || 'None'}</li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;"><strong>Action Required:</strong> Please confirm this reservation and contact the customer if needed.</p>
          </div>
        </div>
      `;

      emailStatus.adminSent = await o365EmailService.sendEmail({
        to: 'info@kockys.com',
        subject: 'New Reservation Inquiry - Kocky\'s Bar & Grill',
        html: adminEmailHtml,
      });

      // Send customer confirmation
      const customerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Reservation Confirmed!</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${guestName},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">Your reservation has been confirmed at Kocky's Bar & Grill:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📅 Date:</strong> ${new Date(date).toLocaleDateString()}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🕐 Time:</strong> ${time}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>👥 Party Size:</strong> ${partySize} guests</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${confirmationCode}</span></li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">We look forward to welcoming you to Kocky's Bar & Grill!</p>
            <p style="font-size: 16px; margin-bottom: 20px;">If you need to make any changes or have questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
            <p style="font-size: 16px;">Best regards,<br><strong>The Kocky's Team</strong></p>
          </div>
        </div>
      `;

      emailStatus.customerSent = await o365EmailService.sendEmail({
        to: guestEmail,
        subject: 'Reservation Confirmation - Kocky\'s Bar & Grill',
        html: customerEmailHtml,
      });

      if (emailStatus.adminSent) {
        console.log('✅ Internal reservation notification sent to info@kockys.com');
      } else {
        console.log('⚠️ Internal reservation notification not sent (email service not configured)');
      }

      if (emailStatus.customerSent) {
        console.log('✅ Reservation confirmation sent to customer:', guestEmail);
      } else {
        console.log('⚠️ Customer confirmation not sent (email service not configured)');
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.log('Email notification failed (non-critical):', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation,
      emailStatus,
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
