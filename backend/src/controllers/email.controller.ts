import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { emailService } from '../services/EmailService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const emailSettingsSchema = z.object({
  fromEmail: z.string().email('Invalid email address'),
  fromName: z.string().min(1, 'From name is required'),
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.number().min(1).max(65535),
  smtpUser: z.string().min(1, 'SMTP username is required'),
  smtpPassword: z.string().min(1, 'SMTP password is required'),
  allowedEmails: z.array(z.string().email()).optional(),
});

const testEmailSchema = z.object({
  toEmail: z.string().email('Invalid email address'),
  fromEmail: z.string().email('Invalid from email').optional(),
});

// Get email settings
export const getEmailSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.settings.findFirst();
    const emailSettings = settings?.emailSettings as any || {};
    
    // Don't send password to frontend
    if (emailSettings.smtpPassword) {
      emailSettings.smtpPassword = '********';
    }

    res.json({
      success: true,
      data: {
        fromEmail: emailSettings.fromEmail || process.env.SMTP_USER || '',
        fromName: emailSettings.fromName || "Kocky's Bar & Grill",
        smtpHost: emailSettings.smtpHost || process.env.SMTP_HOST || 'smtp.office365.com',
        smtpPort: emailSettings.smtpPort || parseInt(process.env.SMTP_PORT || '587'),
        smtpUser: emailSettings.smtpUser || process.env.SMTP_USER || '',
        allowedEmails: emailSettings.allowedEmails || [
          process.env.SMTP_USER,
          'info@kockysbar.com',
          'reservations@kockysbar.com',
          'events@kockysbar.com',
          'catering@kockysbar.com'
        ].filter(Boolean),
        isConfigured: !!(emailSettings.smtpUser || process.env.SMTP_USER)
      }
    });
  } catch (error) {
    logger.error('Error fetching email settings:', error);
    next(error);
  }
};

// Update email settings
export const updateEmailSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = emailSettingsSchema.parse(req.body);
    
    // Test connection before saving
    try {
      await emailService.updateEmailSettings({
        fromEmail: validatedData.fromEmail,
        fromName: validatedData.fromName,
        smtpHost: validatedData.smtpHost,
        smtpPort: validatedData.smtpPort,
        smtpUser: validatedData.smtpUser,
        smtpPassword: validatedData.smtpPassword,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: `Failed to connect to SMTP server: ${error.message}`,
        error: error.message
      });
    }

    // Save to database
    const settings = await prisma.settings.upsert({
      where: { id: 'default' },
      update: {
        emailSettings: {
          fromEmail: validatedData.fromEmail,
          fromName: validatedData.fromName,
          smtpHost: validatedData.smtpHost,
          smtpPort: validatedData.smtpPort,
          smtpUser: validatedData.smtpUser,
          smtpPassword: validatedData.smtpPassword,
          allowedEmails: validatedData.allowedEmails || [validatedData.fromEmail],
        }
      },
      create: {
        id: 'default',
        siteName: "Kocky's Bar & Grill",
        contactEmail: validatedData.fromEmail,
        contactPhone: '(555) 123-4567',
        address: '123 Main Street',
        city: 'Your City',
        state: 'Your State',
        zipCode: '12345',
        country: 'USA',
        emailSettings: {
          fromEmail: validatedData.fromEmail,
          fromName: validatedData.fromName,
          smtpHost: validatedData.smtpHost,
          smtpPort: validatedData.smtpPort,
          smtpUser: validatedData.smtpUser,
          smtpPassword: validatedData.smtpPassword,
          allowedEmails: validatedData.allowedEmails || [validatedData.fromEmail],
        },
        socialMedia: {},
        businessHours: {},
        paymentSettings: {},
        reservationSettings: {}
      }
    });

    logger.info('Email settings updated successfully');
    res.json({
      success: true,
      message: 'Email settings updated successfully',
      data: {
        isConfigured: true
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }
    logger.error('Error updating email settings:', error);
    next(error);
  }
};

// Send test email
export const sendTestEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = testEmailSchema.parse(req.body);
    
    // If a specific from email is provided, validate it's in the allowed list
    if (validatedData.fromEmail) {
      const settings = await prisma.settings.findFirst();
      const emailSettings = settings?.emailSettings as any || {};
      const allowedEmails = emailSettings.allowedEmails || [];
      
      // Also add the SMTP user email to allowed list
      if (emailSettings.fromEmail) {
        allowedEmails.push(emailSettings.fromEmail);
      }
      if (emailSettings.smtpUser) {
        allowedEmails.push(emailSettings.smtpUser);
      }
      
      if (!allowedEmails.includes(validatedData.fromEmail)) {
        return res.status(400).json({
          success: false,
          message: 'The specified from email is not in the allowed list'
        });
      }
    }

    const success = await emailService.sendTestEmail(validatedData.toEmail);
    
    if (success) {
      res.json({
        success: true,
        message: `Test email sent successfully to ${validatedData.toEmail}. Please check your inbox (and spam folder).`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email. Please check your email configuration.'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
        errors: error.errors
      });
    }
    logger.error('Error sending test email:', error);
    next(error);
  }
};

// Get email logs
export const getEmailLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          inquiry: {
            select: {
              id: true,
              name: true,
              serviceType: true
            }
          },
          quote: {
            select: {
              id: true,
              quoteNumber: true,
              status: true
            }
          }
        }
      }),
      prisma.emailLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching email logs:', error);
    next(error);
  }
};

// Resend email
export const resendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const emailLog = await prisma.emailLog.findUnique({
      where: { id },
      include: {
        inquiry: true,
        quote: true
      }
    });

    if (!emailLog) {
      return res.status(404).json({
        success: false,
        message: 'Email log not found'
      });
    }

    let success = false;
    
    // Resend based on type
    switch (emailLog.type) {
      case 'CONFIRMATION':
        // Resend reservation confirmation
        if (emailLog.inquiry) {
          // Implementation would depend on your reservation model
          success = true;
        }
        break;
        
      case 'QUOTE':
        // Resend quote
        if (emailLog.quote) {
          // Implementation would use the quote data
          success = true;
        }
        break;
        
      case 'FOLLOW_UP':
        // Resend inquiry followup
        if (emailLog.inquiry) {
          success = await emailService.sendInquiryFollowup({
            name: emailLog.inquiry.name,
            email: emailLog.inquiry.email,
            serviceType: emailLog.inquiry.serviceType,
            eventDate: emailLog.inquiry.eventDate instanceof Date 
              ? emailLog.inquiry.eventDate.toLocaleDateString() 
              : emailLog.inquiry.eventDate || 'TBD',
            message: emailLog.inquiry.message,
            confirmationCode: emailLog.inquiry.confirmationCode || 'N/A'
          });
        }
        break;
        
      default:
        success = false;
    }

    if (success) {
      // Update email log
      await prisma.emailLog.update({
        where: { id },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Email resent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to resend email'
      });
    }
  } catch (error) {
    logger.error('Error resending email:', error);
    next(error);
  }
};

// Get email templates preview
export const getEmailTemplates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const templates = [
      {
        id: 'reservation-confirmation',
        name: 'Reservation Confirmation',
        description: 'Sent when a customer makes a reservation',
        variables: ['name', 'date', 'time', 'partySize', 'confirmationCode', 'specialRequests']
      },
      {
        id: 'quote',
        name: 'Quote Delivery',
        description: 'Sent when a quote is created for a customer',
        variables: ['customerName', 'quoteNumber', 'serviceType', 'eventDate', 'totalAmount', 'items']
      },
      {
        id: 'inquiry-followup',
        name: 'Inquiry Follow-up',
        description: 'Sent immediately after receiving an inquiry',
        variables: ['name', 'serviceType', 'eventDate', 'message', 'confirmationCode']
      },
      {
        id: 'order-confirmation',
        name: 'Order Confirmation',
        description: 'Sent when an online order is placed',
        variables: ['name', 'orderNumber', 'total', 'orderType', 'pickupTime']
      },
      {
        id: 'payment-receipt',
        name: 'Payment Receipt',
        description: 'Sent when a payment is processed',
        variables: ['name', 'amount', 'paymentMethod', 'transactionId', 'date']
      }
    ];

    logger.info("email.templates.list", { userId: req.user?.id, count: templates?.length ?? 0 });

    res.json({
      success: true,
      data: {
        templates: templates ?? []
      }
    });
  } catch (error) {
    logger.error('Error fetching email templates:', error);
    next(error);
  }
};

// Get email contacts (newsletter subscribers)
export const getEmailContacts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (status) {
      where.subscribed = status === 'subscribed';
    }

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          email: true,
          name: true,
          subscribed: true,
          subscribedAt: true,
          unsubscribedAt: true,
          tags: true,
          createdAt: true
        }
      }),
      prisma.newsletterSubscriber.count({ where })
    ]);

    logger.info("email.contacts.list", { userId: req.user?.id, count: subscribers?.length ?? 0, total, page: Number(page) });

    res.json({
      success: true,
      data: {
        contacts: subscribers ?? [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching email contacts:', error);
    next(error);
  }
};

// Get email campaigns
export const getEmailCampaigns = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // For now, return mock campaign data since we don't have a campaigns table
    const campaigns = [
      {
        id: '1',
        name: 'Welcome Series',
        status: 'active',
        recipients: 1250,
        sent: 1250,
        opened: 890,
        clicked: 234,
        createdAt: new Date('2025-09-01'),
        lastSent: new Date('2025-09-10')
      },
      {
        id: '2',
        name: 'Monthly Newsletter',
        status: 'draft',
        recipients: 0,
        sent: 0,
        opened: 0,
        clicked: 0,
        createdAt: new Date('2025-09-05'),
        lastSent: null
      },
      {
        id: '3',
        name: 'Event Promotion',
        status: 'completed',
        recipients: 850,
        sent: 850,
        opened: 567,
        clicked: 123,
        createdAt: new Date('2025-08-15'),
        lastSent: new Date('2025-08-20')
      }
    ];

    logger.info("email.campaigns.list", { userId: req.user?.id, count: campaigns?.length ?? 0 });

    res.json({
      success: true,
      data: {
        campaigns: campaigns ?? []
      }
    });
  } catch (error) {
    logger.error('Error fetching email campaigns:', error);
    next(error);
  }
};

// Get email analytics
export const getEmailAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get newsletter subscriber stats
    const [totalSubscribers, activeSubscribers, recentSubscribers] = await Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { subscribed: true } }),
      prisma.newsletterSubscriber.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    // Get email log stats
    const [totalEmails, sentEmails, failedEmails] = await Promise.all([
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { status: 'SENT' } }),
      prisma.emailLog.count({ where: { status: 'FAILED' } })
    ]);

    const analytics = {
      subscribers: {
        total: totalSubscribers,
        active: activeSubscribers,
        recent: recentSubscribers,
        growth: recentSubscribers > 0 ? ((recentSubscribers / totalSubscribers) * 100).toFixed(1) : '0'
      },
      emails: {
        total: totalEmails,
        sent: sentEmails,
        failed: failedEmails,
        successRate: totalEmails > 0 ? ((sentEmails / totalEmails) * 100).toFixed(1) : '0'
      },
      campaigns: {
        total: 3,
        active: 1,
        completed: 2,
        draft: 0
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching email analytics:', error);
    next(error);
  }
};
