import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { sendEmail, sendInquiryAutoReply } from '../utils/email';
import o365EmailService from '../services/o365EmailService';
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
        priority: 'NORMAL'
      },
    });

    // Send emails using Office 365 service
    let emailStatus = { adminSent: false, customerSent: false };
    
    try {
      // Send internal admin notification
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔔 New Contact Inquiry</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">A new contact inquiry has been submitted through the website:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <h3 style="margin-top: 0; color: #b22222;">Customer Information</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>👤 Name:</strong> ${name}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📧 Email:</strong> ${email}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📞 Phone:</strong> ${phone || 'Not provided'}</li>
              </ul>
              <h3 style="color: #b22222; margin-top: 20px;">Inquiry Details</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📋 Subject:</strong> ${subject || 'General Inquiry'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>💬 Message:</strong> ${message}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${confirmationCode}</span></li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;"><strong>Action Required:</strong> Please review this inquiry and contact the customer if needed.</p>
          </div>
        </div>
      `;

      emailStatus.adminSent = await o365EmailService.sendEmail({
        to: 'info@kockys.com',
        subject: 'New Contact Inquiry - Kocky\'s Bar & Grill',
        html: adminEmailHtml,
      });

      // Send customer confirmation
      const customerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Message Received!</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for contacting Kocky's Bar & Grill! We have received your message and will respond within 24 hours.</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📋 Subject:</strong> ${subject || 'General Inquiry'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${confirmationCode}</span></li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">If you have any immediate questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
            <p style="font-size: 16px;">Best regards,<br><strong>The Kocky's Team</strong></p>
          </div>
        </div>
      `;

      emailStatus.customerSent = await o365EmailService.sendEmail({
        to: email,
        subject: 'Message Received - Kocky\'s Bar & Grill',
        html: customerEmailHtml,
      });

      if (emailStatus.adminSent) {
        console.log('✅ Internal contact notification sent to info@kockys.com');
      } else {
        console.log('⚠️ Internal contact notification not sent (email service not configured)');
      }

      if (emailStatus.customerSent) {
        console.log('✅ Contact confirmation sent to customer:', email);
      } else {
        console.log('⚠️ Contact confirmation not sent (email service not configured)');
      }

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
      emailStatus,
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
