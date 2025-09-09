import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/email';
import { createPaymentLink, calculateDepositAmount } from '../utils/payment';
import { Decimal } from '@prisma/client/runtime/library';
import { PDFService } from '../services/pdf.service';
import path from 'path';
import fs from 'fs';

// Generate unique quote number
const generateQuoteNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Count existing quotes this month
  const startOfMonth = new Date(year, date.getMonth(), 1);
  const count = await prisma.quote.count({
    where: {
      createdAt: {
        gte: startOfMonth,
      },
    },
  });
  
  const sequenceNumber = String(count + 1).padStart(4, '0');
  return `Q-${year}${month}-${sequenceNumber}`;
};

// Create a new quote for an inquiry
export const createQuote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { inquiryId } = req.params;
    const { 
      serviceDetails, 
      items, 
      validDays = 30, 
      terms, 
      notes,
      deposit 
    } = req.body;

    // Verify inquiry exists
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Calculate total amount from items
    let totalAmount = 0;
    if (items && items.length > 0) {
      items.forEach((item: any) => {
        const itemTotal = item.quantity * item.unitPrice;
        totalAmount += itemTotal;
      });
    }

    // Calculate deposit if specified
    let depositAmount = null;
    let balanceDue = new Decimal(totalAmount);
    let depositDueDate = null;

    if (deposit) {
      if (deposit.type === 'percentage') {
        depositAmount = new Decimal(totalAmount * (deposit.amount / 100));
      } else if (deposit.type === 'fixed') {
        depositAmount = new Decimal(deposit.amount);
      }
      
      if (depositAmount) {
        balanceDue = new Decimal(totalAmount).minus(depositAmount);
        depositDueDate = deposit.dueDate ? new Date(deposit.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
      }
    }

    // Generate quote number
    const quoteNumber = await generateQuoteNumber();

    // Calculate validity date
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    // Create quote with items
    const quote = await prisma.quote.create({
      data: {
        inquiryId,
        quoteNumber,
        amount: new Decimal(totalAmount),
        depositType: deposit?.type || null,
        depositAmount: depositAmount,
        depositDueDate: depositDueDate,
        balanceDue: balanceDue,
        validUntil,
        serviceDetails: typeof serviceDetails === 'object' ? JSON.stringify(serviceDetails) : serviceDetails,
        terms: terms || 'Payment due upon acceptance. All services subject to availability.',
        notes,
        status: 'DRAFT',
        quoteItems: {
          create: items?.map((item: any) => ({
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: new Decimal(item.unitPrice),
            total: new Decimal(item.quantity * item.unitPrice),
            notes: item.notes,
          })) || [],
        },
      },
      include: {
        quoteItems: true,
        inquiry: true,
      },
    });

    // Update inquiry status
    await prisma.contactInquiry.update({
      where: { id: inquiryId },
      data: { status: 'QUOTED' },
    });

    res.status(201).json({
      success: true,
      message: 'Quote created successfully',
      quote,
    });
  } catch (error) {
    next(error);
  }
};

// Get all quotes
export const getAllQuotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, inquiryId, serviceType } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (inquiryId) where.inquiryId = inquiryId;
    if (serviceType) {
      where.inquiry = {
        serviceType: serviceType,
      };
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        inquiry: true,
        quoteItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      quotes,
    });
  } catch (error) {
    next(error);
  }
};

// Get single quote
export const getQuote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        inquiry: true,
        quoteItems: true,
        emailLogs: true,
      },
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found',
      });
    }

    res.json({
      success: true,
      quote,
    });
  } catch (error) {
    next(error);
  }
};

// Update quote
export const updateQuote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { serviceDetails, items, validDays, terms, notes, status } = req.body;

    // Get existing quote
    const existingQuote = await prisma.quote.findUnique({
      where: { id },
      include: { quoteItems: true },
    });

    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found',
      });
    }

    // Calculate new total if items provided
    let totalAmount = existingQuote.amount ? Number(existingQuote.amount) : 0;
    if (items && items.length > 0) {
      totalAmount = 0;
      items.forEach((item: any) => {
        const itemTotal = item.quantity * item.unitPrice;
        totalAmount += itemTotal;
      });
    }

    // Calculate new validity date if validDays provided
    let validUntil = existingQuote.validUntil;
    if (validDays) {
      validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validDays);
    }

    // Update quote and items
    const quote = await prisma.quote.update({
      where: { id },
      data: {
        amount: new Decimal(totalAmount),
        validUntil,
        serviceDetails: serviceDetails ? (typeof serviceDetails === 'object' ? JSON.stringify(serviceDetails) : serviceDetails) : undefined,
        terms,
        notes,
        status,
        // Delete existing items if new items provided
        ...(items && {
          quoteItems: {
            deleteMany: {},
            create: items.map((item: any) => ({
              description: item.description,
              quantity: item.quantity || 1,
              unitPrice: new Decimal(item.unitPrice),
              total: new Decimal(item.quantity * item.unitPrice),
              notes: item.notes,
            })),
          },
        }),
      },
      include: {
        quoteItems: true,
        inquiry: true,
      },
    });

    res.json({
      success: true,
      message: 'Quote updated successfully',
      quote,
    });
  } catch (error) {
    next(error);
  }
};

// Update quote status
export const updateQuoteStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        status,
        ...(status === 'ACCEPTED' && { acceptedAt: new Date() }),
        ...(status === 'PAID' && { paidAt: new Date() }),
      },
      include: {
        inquiry: true,
      },
    });

    // Update inquiry status based on quote status
    if (status === 'ACCEPTED' || status === 'PAID') {
      await prisma.contactInquiry.update({
        where: { id: quote.inquiryId },
        data: { status: 'WON' },
      });
    } else if (status === 'REJECTED' || status === 'EXPIRED') {
      await prisma.contactInquiry.update({
        where: { id: quote.inquiryId },
        data: { status: 'LOST' },
      });
    }

    res.json({
      success: true,
      message: `Quote status updated to ${status}`,
      quote,
    });
  } catch (error) {
    next(error);
  }
};

// Send quote to customer
export const sendQuote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { message: customMessage, generatePaymentLink = true } = req.body;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        inquiry: true,
        quoteItems: true,
      },
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found',
      });
    }

    // Generate payment link if requested and not already generated
    let paymentLink = quote.paymentLink;
    if (generatePaymentLink && !paymentLink && process.env.STRIPE_SECRET_KEY) {
      try {
        const amountInCents = quote.amount ? Math.round(quote.amount.toNumber() * 100) : 0;
        const depositInCents = quote.depositAmount ? Math.round(quote.depositAmount.toNumber() * 100) : 0;
        
        paymentLink = await createPaymentLink({
          quoteId: quote.id,
          quoteNumber: quote.quoteNumber,
          customerEmail: quote.inquiry.email,
          customerName: quote.inquiry.name,
          amount: amountInCents,
          depositAmount: depositInCents,
          isDeposit: quote.depositType !== null && quote.depositAmount !== null,
          description: `Payment for ${quote.inquiry.serviceType} Service - ${quote.quoteNumber}`,
        });

        // Save payment link to quote
        await prisma.quote.update({
          where: { id },
          data: { paymentLink },
        });
      } catch (paymentError) {
        console.error('Failed to generate payment link:', paymentError);
        // Continue without payment link
      }
    }

    // Format quote items for email
    let itemsHtml = '';
    if (quote.quoteItems.length > 0) {
      itemsHtml = '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
      itemsHtml += '<thead><tr style="background: #f3f4f6;">';
      itemsHtml += '<th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Description</th>';
      itemsHtml += '<th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">Qty</th>';
      itemsHtml += '<th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Unit Price</th>';
      itemsHtml += '<th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Total</th>';
      itemsHtml += '</tr></thead><tbody>';
      
      quote.quoteItems.forEach((item) => {
        itemsHtml += '<tr>';
        itemsHtml += `<td style="padding: 10px; border: 1px solid #e5e7eb;">${item.description}</td>`;
        itemsHtml += `<td style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">${item.quantity}</td>`;
        itemsHtml += `<td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">$${item.unitPrice}</td>`;
        itemsHtml += `<td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">$${item.total}</td>`;
        itemsHtml += '</tr>';
      });
      
      itemsHtml += '</tbody>';
      itemsHtml += '<tfoot><tr style="background: #f3f4f6; font-weight: bold;">';
      itemsHtml += '<td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Total:</td>';
      itemsHtml += `<td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">$${quote.amount}</td>`;
      itemsHtml += '</tr></tfoot></table>';
    }

    // Send email with quote details
    try {
      await sendEmail({
        to: quote.inquiry.email,
        subject: `Quote #${quote.quoteNumber} - Kocky's Bar & Grill`,
        template: 'quote',
        data: {
          name: quote.inquiry.name,
          quoteNumber: quote.quoteNumber,
          serviceType: quote.inquiry.serviceType,
          serviceDetails: quote.serviceDetails,
          items: itemsHtml,
          totalAmount: quote.amount,
          validUntil: quote.validUntil?.toLocaleDateString(),
          terms: quote.terms,
          notes: quote.notes,
          customMessage,
        },
      });

      // Log email activity
      await prisma.emailLog.create({
        data: {
          inquiryId: quote.inquiryId,
          type: 'QUOTE',
          recipient: quote.inquiry.email,
          subject: `Quote #${quote.quoteNumber}`,
          body: 'Quote sent to customer',
          status: 'SENT',
          sentAt: new Date(),
        },
      });
    } catch (emailError) {
      console.log('Email sending failed:', emailError);
      // Continue even if email fails
    }

    // Update quote status
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        status: 'SENT',
        sentToCustomer: true,
        sentAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Quote sent successfully',
      quote: updatedQuote,
    });
  } catch (error) {
    next(error);
  }
};

// Delete quote
export const deleteQuote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.quote.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Quote deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get quotes by inquiry
export const getQuotesByInquiry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { inquiryId } = req.params;

    const quotes = await prisma.quote.findMany({
      where: { inquiryId },
      include: {
        quoteItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      quotes,
    });
  } catch (error) {
    next(error);
  }
};

// Clone quote (create revision)
export const cloneQuote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const originalQuote = await prisma.quote.findUnique({
      where: { id },
      include: { quoteItems: true },
    });

    if (!originalQuote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found',
      });
    }

    const quoteNumber = await generateQuoteNumber();

    const newQuote = await prisma.quote.create({
      data: {
        inquiryId: originalQuote.inquiryId,
        quoteNumber: `${quoteNumber}-REV`,
        amount: originalQuote.amount ? new Decimal(originalQuote.amount.toString()) : null,
        validUntil: originalQuote.validUntil,
        serviceDetails: originalQuote.serviceDetails,
        terms: originalQuote.terms,
        notes: `Revision of quote #${originalQuote.quoteNumber}`,
        status: 'DRAFT',
        quoteItems: {
          create: originalQuote.quoteItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice.toString()),
            total: new Decimal(item.total.toString()),
            notes: item.notes,
          })),
        },
      },
      include: {
        quoteItems: true,
        inquiry: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Quote cloned successfully',
      quote: newQuote,
    });
  } catch (error) {
    next(error);
  }
};

// Generate PDF for a quote
export const generateQuotePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Fetch quote with all related data
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        inquiry: true,
        quoteItems: true,
      },
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found',
      });
    }

    // Generate PDF
    const pdfService = PDFService.getInstance();
    const { buffer, filename } = await pdfService.generateQuotePDF(quote as any);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());

    // Send PDF buffer
    res.send(buffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    next(error);
  }
};

// Save PDF to server and return URL
export const saveQuotePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Fetch quote with all related data
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        inquiry: true,
        quoteItems: true,
      },
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found',
      });
    }

    // Save PDF to file
    const pdfService = PDFService.getInstance();
    const filepath = await pdfService.savePDFToFile(quote as any);
    const filename = path.basename(filepath);
    const pdfUrl = `/uploads/quotes/${filename}`;

    // Update quote with PDF URL
    await prisma.quote.update({
      where: { id },
      data: {
        pdfUrl,
      },
    });

    res.json({
      success: true,
      message: 'PDF saved successfully',
      pdfUrl,
      filepath,
    });
  } catch (error) {
    console.error('Error saving PDF:', error);
    next(error);
  }
};

// Email quote PDF to customer
export const emailQuotePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { message = '', cc = [] } = req.body;

    // Fetch quote with all related data
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        inquiry: true,
        quoteItems: true,
      },
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found',
      });
    }

    // Generate PDF
    const pdfService = PDFService.getInstance();
    const { buffer, filename } = await pdfService.generateQuotePDF(quote as any);

    // Calculate totals for email
    const amount = parseFloat(quote.amount?.toString() || '0');
    const taxRate = parseFloat(quote.taxRate?.toString() || '0');
    const gratuityRate = parseFloat(quote.gratuityRate?.toString() || '0');
    const tax = amount * (taxRate / 100);
    const gratuity = amount * (gratuityRate / 100);
    const total = amount + tax + gratuity;

    // Prepare email data
    const emailData = {
      to: quote.inquiry.email,
      cc: cc.length > 0 ? cc : undefined,
      subject: `Quote #${quote.quoteNumber} - Kocky's Bar & Grill`,
      template: 'quote',
      data: {
        customerName: quote.inquiry.name,
        quoteNumber: quote.quoteNumber,
        eventDate: quote.inquiry.eventDate ? new Date(quote.inquiry.eventDate).toLocaleDateString() : 'TBD',
        serviceType: quote.inquiry.serviceType,
        total: total.toFixed(2),
        validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A',
        message: message || 'Thank you for choosing Kocky\'s Bar & Grill! Please find your quote attached.',
        viewQuoteUrl: quote.paymentLink || `${process.env.FRONTEND_URL}/quotes/${quote.id}/view`,
      },
      attachments: [
        {
          filename,
          content: buffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // Send email
    await sendEmail(emailData as any);

    // Update quote status
    await prisma.quote.update({
      where: { id },
      data: {
        status: 'SENT',
        sentToCustomer: true,
        sentAt: new Date(),
      },
    });

    // Log email activity
    await prisma.emailLog.create({
      data: {
        recipient: quote.inquiry.email,
        recipientEmail: quote.inquiry.email,
        recipientName: quote.inquiry.name,
        subject: emailData.subject,
        body: emailData.data.message,
        type: 'QUOTE',
        status: 'SENT',
        metadata: {
          quoteId: quote.id,
          quoteNumber: quote.quoteNumber,
        } as any,
      },
    });

    res.json({
      success: true,
      message: 'Quote emailed successfully',
      recipient: quote.inquiry.email,
    });
  } catch (error) {
    console.error('Error emailing quote:', error);
    
    // Log failed email
    if (req.params.id) {
      await prisma.emailLog.create({
        data: {
          recipient: 'unknown',
          recipientEmail: 'unknown',
          recipientName: 'unknown',
          subject: 'Quote Email Failed',
          body: error instanceof Error ? error.message : 'Unknown error',
          type: 'QUOTE',
          status: 'FAILED',
          metadata: {
            quoteId: req.params.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          } as any,
        },
      });
    }

    next(error);
  }
};

// Get quote PDF preview (inline display)
export const previewQuotePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Fetch quote with all related data
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        inquiry: true,
        quoteItems: true,
      },
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found',
      });
    }

    // Generate PDF
    const pdfService = PDFService.getInstance();
    const { buffer, filename } = await pdfService.generateQuotePDF(quote as any);

    // Set response headers for inline PDF display
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());

    // Send PDF buffer
    res.send(buffer);
  } catch (error) {
    console.error('Error previewing PDF:', error);
    next(error);
  }
};
