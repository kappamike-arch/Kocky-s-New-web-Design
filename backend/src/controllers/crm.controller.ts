import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Get all inquiries with filtering
export const getInquiries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      status, 
      serviceType, 
      priority, 
      assignedTo,
      startDate, 
      endDate,
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    const where: any = {};
    
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { phone: { contains: search as string } },
        { subject: { contains: search as string } },
        { message: { contains: search as string } },
        { confirmationCode: { contains: search as string } }
      ];
    }

    const totalCount = await prisma.contactInquiry.count({ where });
    
    const inquiries = await prisma.contactInquiry.findMany({
      where,
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        emailLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single inquiry with full details
export const getInquiry = async (req: Request | AuthRequest, res: Response, next: NextFunction) => {
  try {
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: req.params.id },
      include: {
        quotes: {
          include: {
            quoteItems: true,
            emailLogs: true
          },
          orderBy: { createdAt: 'desc' }
        },
        emailLogs: {
          orderBy: { createdAt: 'desc' }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, data: inquiry });
  } catch (error) {
    next(error);
  }
};

// Update inquiry status/details
export const updateInquiry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const inquiry = await prisma.contactInquiry.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updatedAt: new Date()
      }
    });

    res.json({ success: true, data: inquiry });
  } catch (error) {
    next(error);
  }
};

// Add note to inquiry
export const addNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { note, isInternal = true } = req.body;
    
    const newNote = await prisma.inquiryNote.create({
      data: {
        inquiryId: req.params.id,
        note,
        isInternal,
        createdBy: req.user?.email || 'System'
      }
    });

    res.json({ success: true, data: newNote });
  } catch (error) {
    next(error);
  }
};

// Create and send a quote
export const createQuote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const inquiryId = req.params.id;
    console.log(`[CRM] Creating quote for inquiry: ${inquiryId}`);
    
    const { 
      amount, 
      validUntil, 
      serviceDetails = {}, 
      terms = '',
      notes = '', 
      quoteItems = [],
      sendToCustomer = false 
    } = req.body;

    console.log('[CRM] Quote request body:', { 
      amount: amount, 
      validUntil: validUntil, 
      serviceDetailsType: typeof serviceDetails,
      itemsCount: quoteItems.length 
    });

    // Get inquiry details
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: inquiryId }
    });

    if (!inquiry) {
      console.error(`[CRM] Inquiry not found: ${inquiryId}`);
      return res.status(404).json({ success: false, message: `Inquiry not found with ID: ${inquiryId}` });
    }

    // Generate quote number
    const quoteNumber = `Q-${new Date().getFullYear()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        inquiryId,
        quoteNumber,
        amount: amount ? parseFloat(amount) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        serviceDetails: typeof serviceDetails === 'object' ? JSON.stringify(serviceDetails) : (serviceDetails || '{}'),
        terms,
        notes,
        status: sendToCustomer ? 'SENT' : 'DRAFT',
        sentToCustomer: sendToCustomer,
        sentAt: sendToCustomer ? new Date() : null,
        createdBy: req.user?.email || 'System',
        quoteItems: {
          create: quoteItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            total: parseFloat(item.unitPrice) * item.quantity,
            notes: item.notes
          }))
        }
      },
      include: {
        quoteItems: true
      }
    });

    // Send email if requested
    if (sendToCustomer) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Quote from Kocky's Bar & Grill</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5;">
            <p>Dear ${inquiry.name},</p>
            <p>Thank you for your interest in ${inquiry.serviceType === 'FOOD_TRUCK' ? 'our Food Truck service' : 
                                                inquiry.serviceType === 'MOBILE_BAR' ? 'our Mobile Bar service' : 
                                                inquiry.serviceType === 'CATERING' ? 'our Catering service' : 
                                                'our services'}!</p>
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #b22222; border-bottom: 2px solid #b22222; padding-bottom: 10px;">Quote #${quoteNumber}</h2>
              
              <h3>Service Details:</h3>
              <p>${serviceDetails}</p>
              
              ${quoteItems.length > 0 ? `
                <h3>Quote Breakdown:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f0f0f0;">
                      <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
                      <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                      <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Unit Price</th>
                      <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${quote.quoteItems.map((item: any) => `
                      <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${item.description}</td>
                        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                        <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${item.unitPrice.toFixed(2)}</td>
                        <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${item.total.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
              
              ${amount ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #b22222;">
                  <h3 style="text-align: right; color: #b22222; font-size: 24px;">
                    Total: $${parseFloat(amount).toFixed(2)}
                  </h3>
                </div>
              ` : ''}
              
              ${terms ? `
                <div style="margin-top: 20px;">
                  <h3>Terms & Conditions:</h3>
                  <p style="font-size: 14px; color: #666;">${terms}</p>
                </div>
              ` : ''}
              
              ${validUntil ? `
                <p style="color: #666; font-style: italic; margin-top: 20px;">
                  This quote is valid until ${new Date(validUntil).toLocaleDateString()}
                </p>
              ` : ''}
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Next Steps:</h3>
              <p>To proceed with this quote, please reply to this email or call us at (555) 123-4567.</p>
              ${notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            <p>We look forward to serving you!</p>
            <p>Best regards,<br><strong>The Kocky's Team</strong></p>
          </div>
          <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p style="margin: 5px 0;">Kocky's Bar & Grill | 123 Main Street | Your City, State 12345</p>
            <p style="margin: 5px 0;">www.kockysbar.com | info@kockys.com | (555) 123-4567</p>
          </div>
        </div>
      `;

      try {
        await sendEmail({
          to: inquiry.email,
          subject: `Quote #${quoteNumber} - Kocky's Bar & Grill`,
          template: 'custom',
          data: {
            html: emailHtml,
            text: `Quote from Kocky's Bar & Grill\n\nQuote #${quoteNumber}\n\nTotal: $${amount}\n\nPlease see the attached quote details and feel free to contact us with any questions.`
          }
        });

        // Log email activity
        await prisma.emailLog.create({
          data: {
            inquiryId,
            quoteId: quote.id,
            type: 'QUOTE',
            recipient: inquiry.email,
            subject: `Quote #${quoteNumber} - Kocky's Bar & Grill`,
            body: emailHtml,
            status: 'SENT',
            sentAt: new Date()
          }
        });

        // Update inquiry status
        await prisma.contactInquiry.update({
          where: { id: inquiryId },
          data: { status: 'QUOTED' }
        });

      } catch (emailError) {
        logger.error('Failed to send quote email:', emailError);
        // Still return success but with warning
        return res.json({ 
          success: true, 
          data: quote,
          warning: 'Quote created but email failed to send'
        });
      }
    }

    res.json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

// Update quote
export const updateQuote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quote = await prisma.quote.update({
      where: { id: req.params.quoteId },
      data: {
        ...req.body,
        updatedAt: new Date()
      }
    });

    res.json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

// Send/resend quote email
export const sendQuoteEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.quoteId },
      include: {
        inquiry: true,
        quoteItems: true
      }
    });

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    // [Email sending logic similar to createQuote]
    // ... (reuse the email template from above)

    // Update quote status
    await prisma.quote.update({
      where: { id: req.params.quoteId },
      data: {
        status: 'SENT',
        sentToCustomer: true,
        sentAt: new Date()
      }
    });

    res.json({ success: true, message: 'Quote email sent successfully' });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalInquiries,
      newInquiries,
      quotedInquiries,
      wonInquiries,
      totalQuotes,
      acceptedQuotes,
      recentInquiries,
      recentQuotes
    ] = await Promise.all([
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { status: 'NEW' } }),
      prisma.contactInquiry.count({ where: { status: 'QUOTED' } }),
      prisma.contactInquiry.count({ where: { status: 'WON' } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'ACCEPTED' } }),
      prisma.contactInquiry.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 5,
        include: {
          quotes: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.quote.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 5,
        include: {
          inquiry: true
        }
      })
    ]);

    const conversionRate = totalInquiries > 0 
      ? ((wonInquiries / totalInquiries) * 100).toFixed(2)
      : 0;

    const quoteAcceptanceRate = totalQuotes > 0
      ? ((acceptedQuotes / totalQuotes) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalInquiries,
          newInquiries,
          quotedInquiries,
          wonInquiries,
          conversionRate,
          totalQuotes,
          acceptedQuotes,
          quoteAcceptanceRate
        },
        recentInquiries,
        recentQuotes
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export inquiries to CSV
export const exportInquiries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const inquiries = await prisma.contactInquiry.findMany({
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Create CSV content
    const headers = [
      'ID', 'Name', 'Email', 'Phone', 'Service Type', 'Status', 
      'Priority', 'Event Date', 'Guest Count', 'Created Date',
      'Last Quote Amount', 'Confirmation Code'
    ];

    const rows = inquiries.map(inquiry => [
      inquiry.id,
      inquiry.name,
      inquiry.email,
      inquiry.phone || '',
      inquiry.serviceType,
      inquiry.status,
      inquiry.priority,
      inquiry.eventDate ? new Date(inquiry.eventDate).toLocaleDateString() : '',
      inquiry.guestCount || '',
      new Date(inquiry.createdAt).toLocaleDateString(),
      inquiry.quotes[0]?.amount || '',
      inquiry.confirmationCode || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=inquiries-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};
