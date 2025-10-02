import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../utils/email';

export const createInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, subject, message, serviceType } = req.body;

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone,
        subject: subject || 'General Inquiry',
        message,
        serviceType: serviceType || 'GENERAL',
      },
    });

    // Try to send emails but don't fail if email service is not configured
    try {
      // Send notification to admin
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@kockysbar.com',
        subject: `New Contact Inquiry: ${subject}`,
        template: 'welcome', // Use a generic template for now
        data: {
          name: 'Admin',
          content: `New inquiry from ${name} (${email}):\n\n${message}`,
        },
      });

      // Send confirmation to user
      await sendEmail({
        to: email,
        subject: 'We received your message - Kocky\'s Bar & Grill',
        template: 'welcome',
        data: {
          name,
          content: 'Thank you for contacting us. We\'ll get back to you within 24 hours.',
        },
      });
    } catch (emailError) {
      // Log email error but don't fail the request
      console.log('Email notification failed (non-critical):', emailError);
      // Continue - the inquiry was still saved successfully
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
