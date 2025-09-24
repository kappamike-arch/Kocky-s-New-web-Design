import { Quote, ContactInquiry, QuoteItem } from '@prisma/client';
import { createQuoteCheckout } from './stripe/quoteCheckout.service';
import { sendEmail } from '../utils/email';
import { PDFService } from './pdf.service';
import { logger } from '../utils/logger';
import { prisma } from '../server';

interface QuoteWithDetails extends Quote {
  inquiry: ContactInquiry;
  quoteItems: QuoteItem[];
}

interface EmailQuoteParams {
  quote: QuoteWithDetails;
  paymentMode: 'deposit' | 'full';
}

interface EmailQuoteResult {
  checkoutUrl: string;
  sessionId: string;
  emailSent: boolean;
  pdfGenerated: boolean;
  stripeSessionCreated: boolean;
}

/**
 * Format money amount as currency string
 */
const formatMoney = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

/**
 * Calculate quote totals including tax and gratuity
 */
const calculateQuoteTotals = (quote: QuoteWithDetails) => {
  const subtotal = Number(quote.amount || 0);
  const taxRate = Number(quote.taxRate || 0);
  const gratuityRate = Number(quote.gratuityRate || 0);
  
  const tax = subtotal * (taxRate / 100);
  const gratuity = subtotal * (gratuityRate / 100);
  const total = subtotal + tax + gratuity;
  
  return {
    subtotal,
    tax,
    gratuity,
    total,
    taxRate,
    gratuityRate
  };
};

/**
 * Generate PDF buffer for quote attachment with fallback
 */
const generateQuotePDFWithFallback = async (quote: QuoteWithDetails): Promise<{ buffer: Buffer; filename: string; success: boolean }> => {
  try {
    const pdfService = PDFService.getInstance();
    const { buffer, filename } = await pdfService.generateQuotePDF(quote);
    
    logger.info('PDF generated successfully', {
      quoteId: quote.id,
      filename,
      bufferSize: buffer.length
    });
    
    return { buffer, filename, success: true };
  } catch (error) {
    logger.error('PDF generation failed, continuing without attachment', {
      quoteId: quote.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Return empty buffer as fallback
    return { 
      buffer: Buffer.from(''), 
      filename: `quote-${quote.quoteNumber}.pdf`, 
      success: false 
    };
  }
};

/**
 * Compose and send quote email with Stripe checkout and PDF attachment
 */
export const emailQuote = async ({ quote, paymentMode }: EmailQuoteParams): Promise<EmailQuoteResult> => {
  const emailId = `quote_email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.info(`📧 QUOTE EMAIL PROCESS STARTED [${emailId}]`, {
    quoteId: quote.id,
    quoteNumber: quote.quoteNumber,
    customerEmail: quote.inquiry?.email,
    customerName: quote.inquiry?.name,
    paymentMode,
    totalAmount: quote.amount
  });

  try {
    // Validate required fields
    if (!quote.inquiry?.email) {
      throw new Error('Customer email is required to send quote');
    }

    if (!quote.inquiry?.name) {
      throw new Error('Customer name is required to send quote');
    }

    // Calculate totals
    const totals = calculateQuoteTotals(quote);
    
    // Create Stripe checkout session
    let checkoutResult;
    let stripeSessionCreated = false;
    
    try {
      checkoutResult = await createQuoteCheckout({
        quoteId: quote.id,
        customerEmail: quote.inquiry.email,
        mode: paymentMode,
        title: `Quote ${quote.quoteNumber}`,
        totalCents: Math.round(totals.total * 100),
        depositPct: Number(quote.depositPct || 0.2)
      });
      
      stripeSessionCreated = true;
      
      logger.info(`💳 STRIPE SESSION CREATED [${emailId}]`, {
        sessionId: checkoutResult.sessionId,
        checkoutUrl: checkoutResult.url,
        amount: checkoutResult.amount
      });
    } catch (stripeError) {
      logger.error(`❌ STRIPE SESSION FAILED [${emailId}]`, {
        error: stripeError instanceof Error ? stripeError.message : 'Unknown error'
      });
      
      // Continue without Stripe - use fallback payment URL
      checkoutResult = {
        url: `${process.env.APP_BASE_URL || 'https://staging.kockys.com'}/contact?quote=${quote.id}`,
        sessionId: 'fallback',
        amount: totals.total
      };
    }

    // Generate PDF attachment with fallback
    logger.info(`📄 GENERATING PDF ATTACHMENT [${emailId}]`, {
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      customerName: quote.inquiry.name
    });
    
    const pdfResult = await generateQuotePDFWithFallback(quote);
    
    logger.info(`📄 PDF GENERATION RESULT [${emailId}]`, {
      success: pdfResult.success,
      filename: pdfResult.filename,
      bufferSize: pdfResult.buffer.length,
      bufferSizeKB: Math.round(pdfResult.buffer.length / 1024)
    });

    // Prepare email data for template
    const emailData = {
      customerName: quote.inquiry.name,
      quoteNumber: quote.quoteNumber,
      serviceType: quote.inquiry.serviceType,
      eventDate: quote.inquiry.eventDate ? new Date(quote.inquiry.eventDate).toLocaleDateString() : undefined,
      validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A',
      subtotal: formatMoney(totals.subtotal),
      tax: formatMoney(totals.tax),
      gratuity: formatMoney(totals.gratuity),
      total: formatMoney(totals.total),
      deposit: paymentMode === 'deposit' ? formatMoney(checkoutResult.amount) : undefined,
      terms: quote.terms || 'Payment due upon acceptance. All services subject to availability.',
      message: quote.notes || 'Thank you for choosing Kocky\'s Bar & Grill! Please find your quote attached.',
      payUrl: checkoutResult.url,
      stripePaymentLink: checkoutResult.url,
      unsubscribeLink: `${process.env.APP_BASE_URL || 'https://staging.kockys.com'}/unsubscribe?email=${encodeURIComponent(quote.inquiry.email)}`,
      // Add quote items for detailed breakdown
      items: quote.quoteItems?.map(item => ({
        description: item.description || 'Service Item',
        quantity: item.quantity || 1,
        unitPrice: Number(item.unitPrice || 0).toFixed(2),
        total: Number(item.total || 0).toFixed(2)
      })) || []
    };

    // Log the email data for debugging
    logger.info(`📋 EMAIL DATA PREPARED [${emailId}]`, {
      customerName: emailData.customerName,
      quoteNumber: emailData.quoteNumber,
      serviceType: emailData.serviceType,
      total: emailData.total,
      subtotal: emailData.subtotal,
      tax: emailData.tax,
      gratuity: emailData.gratuity,
      deposit: emailData.deposit,
      hasStripeLink: !!emailData.stripePaymentLink,
      stripeUrl: emailData.stripePaymentLink,
      hasPdf: pdfResult.success,
      pdfFilename: pdfResult.filename,
      itemCount: emailData.items.length,
      items: emailData.items
    });

    // Prepare email options
    const emailOptions = {
      to: quote.inquiry.email,
      subject: `Your Quote ${quote.quoteNumber} — Kocky's`,
      template: 'quote',
      data: emailData,
      cc: [process.env.EMAIL_FROM_ADDRESS || 'info@kockys.com'],
      attachments: pdfResult.success ? [{
        filename: pdfResult.filename,
        content: pdfResult.buffer,
        contentType: 'application/pdf'
      }] : [],
      tags: ["quote", "stripe", "customer"],
      meta: { quoteId: quote.id, paymentMode }
    };

    // Log email options for debugging
    logger.info(`📧 EMAIL OPTIONS PREPARED [${emailId}]`, {
      to: emailOptions.to,
      subject: emailOptions.subject,
      template: emailOptions.template,
      hasAttachments: emailOptions.attachments.length > 0,
      attachmentCount: emailOptions.attachments.length,
      attachmentFilenames: emailOptions.attachments.map(a => a.filename),
      hasStripeLink: !!emailData.stripePaymentLink,
      stripeUrl: emailData.stripePaymentLink
    });

    // Send email using centralized email system
    logger.info(`📤 SENDING EMAIL VIA CENTRALIZED SERVICE [${emailId}]`, {
      to: emailOptions.to,
      subject: emailOptions.subject,
      hasAttachments: emailOptions.attachments.length > 0,
      attachmentCount: emailOptions.attachments.length
    });

    try {
      const emailSent = await sendEmail(emailOptions);

      if (!emailSent) {
        throw new Error('Email service returned false - email not sent');
      }

      logger.info(`✅ EMAIL SENT SUCCESSFULLY [${emailId}]`, {
        to: emailOptions.to,
        subject: emailOptions.subject,
        hasAttachments: emailOptions.attachments.length > 0,
        attachmentCount: emailOptions.attachments.length
      });
    } catch (error) {
      logger.error(`❌ EMAIL SEND FAILED [${emailId}]`, {
        to: emailOptions.to,
        subject: emailOptions.subject,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error; // Propagate the error
    }

    // Log successful email sending
    logger.info(`✅ QUOTE EMAIL SENT SUCCESSFULLY [${emailId}]`, {
      recipient: quote.inquiry.email,
      subject: emailOptions.subject,
      hasPdf: pdfResult.success,
      hasStripeLink: stripeSessionCreated,
      providerUsed: 'centralizedEmailService',
      templateName: 'quote'
    });

    return { 
      checkoutUrl: checkoutResult.url, 
      sessionId: checkoutResult.sessionId,
      emailSent: true,
      pdfGenerated: pdfResult.success,
      stripeSessionCreated
    };

  } catch (error) {
    logger.error(`❌ QUOTE EMAIL FAILED [${emailId}]`, {
      quoteId: quote.id,
      customerEmail: quote.inquiry?.email,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

/**
 * Send quote email with comprehensive error handling and logging
 */
export const sendQuoteEmail = async (quoteId: string, paymentMode: 'deposit' | 'full'): Promise<EmailQuoteResult> => {
  const processId = `send_quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.info(`🚀 SEND QUOTE EMAIL STARTED [${processId}]`, {
    quoteId,
    paymentMode
  });

  try {
    // Get quote with all related data
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        inquiry: true,
        quoteItems: true
      }
    });

    if (!quote) {
      throw new Error('Quote not found');
    }

    if (!quote.inquiry) {
      throw new Error('Quote inquiry not found');
    }

    if (!quote.inquiry.email) {
      throw new Error('Customer email is required to send quote');
    }

    logger.info(`📋 QUOTE DATA LOADED [${processId}]`, {
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      customerName: quote.inquiry.name,
      customerEmail: quote.inquiry.email,
      itemCount: quote.quoteItems?.length || 0,
      totalAmount: quote.amount
    });

    // Send the quote email
    const result = await emailQuote({
      quote: quote as any,
      paymentMode
    });

    // Persist Stripe checkout URL and session ID
    if (result.stripeSessionCreated) {
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          stripeSessionId: result.sessionId,
          paymentLink: result.checkoutUrl
        }
      });
    }

    // Update quote status to SENT
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'SENT',
        sentToCustomer: true,
        sentAt: new Date()
      }
    });

    logger.info(`✅ SEND QUOTE EMAIL COMPLETED [${processId}]`, {
      quoteId,
      paymentMode,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
      customerEmail: quote.inquiry.email,
      emailSent: result.emailSent,
      pdfGenerated: result.pdfGenerated,
      stripeSessionCreated: result.stripeSessionCreated
    });

    return result;

  } catch (error) {
    logger.error(`❌ SEND QUOTE EMAIL FAILED [${processId}]`, {
      quoteId,
      paymentMode,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};
