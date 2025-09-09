import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { sendEmail, sendInquiryAutoReply } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

export const createInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, subject, message, serviceType, eventDate, guestCount, location } = req.body;

    // Generate confirmation code
    const confirmationCode = `INQ-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone,
        subject: subject || 'General Inquiry',
        message,
        serviceType: serviceType || 'GENERAL',
        eventDate: eventDate ? new Date(eventDate) : null,
        guestCount: guestCount ? parseInt(guestCount) : null,
        confirmationCode,
        status: 'NEW',
        priority: 'MEDIUM' as any
      },
    });

    // Try to send emails but don't fail if email service is not configured
    try {
      // Send automatic inquiry confirmation using the new service
      const autoReplyData = {
        name,
        email,
        serviceType: serviceType || 'GENERAL',
        eventDate: eventDate ? new Date(eventDate).toLocaleDateString() : undefined,
        confirmationCode,
        message
      };

      await sendInquiryAutoReply(autoReplyData);

      // Send notification to admin
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@kockysbar.com',
        subject: `🔔 New ${serviceType || 'General'} Inquiry - ${confirmationCode}`,
        template: 'booking-received',
        data: {
          name: 'Admin Team',
          bookingType: serviceType || 'General Inquiry',
          date: eventDate || 'Not specified',
          eventTime: 'Not specified',
          guestCount: guestCount || 'Not specified',
          confirmationCode,
          message
        },
      });

      // Log the email activity
      await prisma.emailLog.create({
        data: {
          inquiryId: inquiry.id,
          type: 'FOLLOW_UP',
          recipient: email,
          recipientEmail: email,
          recipientName: name,
          subject: `✅ Thank you for your inquiry - Kocky's Bar & Grill`,
          body: 'Automatic inquiry confirmation sent',
          status: 'SENT',
          sentAt: new Date(),
          metadata: {
            confirmationCode,
            serviceType: serviceType || 'GENERAL'
          } as any
        }
      });

    } catch (emailError) {
      // Log email error but don't fail the request
      console.log('Email notification failed (non-critical):', emailError);
      
      // Log failed email attempt
      try {
        await prisma.emailLog.create({
          data: {
            inquiryId: inquiry.id,
            type: 'FOLLOW_UP',
            recipient: email,
            recipientEmail: email,
            recipientName: name,
            subject: 'Auto-reply failed',
            body: emailError instanceof Error ? emailError.message : 'Unknown error',
            status: 'FAILED',
            failedAt: new Date(),
            metadata: {
              confirmationCode,
              error: emailError instanceof Error ? emailError.message : 'Unknown error'
            } as any
          }
        });
      } catch (logError) {
        console.log('Failed to log email error:', logError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllInquiries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const where: any = {};
    
    if (status) where.status = status;

    const inquiries = await prisma.contactInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, inquiries });
  } catch (error) {
    next(error);
  }
};

export const getInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: req.params.id },
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Mark as contacted if new
    if (inquiry.status === 'NEW') {
      await prisma.contactInquiry.update({
        where: { id: req.params.id },
        data: { status: 'CONTACTED' },
      });
    }

    res.json({ success: true, inquiry });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    
    const inquiry = await prisma.contactInquiry.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({
      success: true,
      message: 'Inquiry status updated',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { response } = req.body;
    
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: req.params.id },
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Send response email
    await sendEmail({
      to: inquiry.email,
      subject: `Re: ${inquiry.subject}`,
      template: 'welcome',
      data: {
        name: inquiry.name,
        content: response,
      },
    });

    // Update inquiry status
    await prisma.contactInquiry.update({
      where: { id: req.params.id },
      data: { status: 'CONTACTED' },
    });

    res.json({
      success: true,
      message: 'Response sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.contactInquiry.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Inquiry deleted',
    });
  } catch (error) {
    next(error);
  }
};
