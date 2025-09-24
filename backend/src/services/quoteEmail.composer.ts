import { Quote, ContactInquiry, QuoteItem } from '@prisma/client';
import { createQuoteCheckout } from './stripe/quoteCheckout.service';
import { sendEmail } from '../utils/email';
import { PDFService } from './pdf.service';
import { logger } from '../utils/logger';

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
 * Generate PDF buffer for quote attachment
 */
const generateQuotePDF = async (quote: QuoteWithDetails): Promise<Buffer> => {
  try {
    const pdfService = PDFService.getInstance();
    const { buffer } = await pdfService.generateQuotePDF(quote);
    return buffer;
  } catch (error) {
    logger.error('Failed to generate quote PDF', {
      error: error instanceof Error ? error.message : 'Unknown error',
      quoteId: quote.id
    });
    throw error;
  }
};

/**
 * Compose and send quote email with Stripe checkout and PDF attachment
 */
export const emailQuote = async ({ quote, paymentMode }: EmailQuoteParams): Promise<EmailQuoteResult> => {
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
    const checkoutResult = await createQuoteCheckout({
      quoteId: quote.id,
      customerEmail: quote.inquiry.email,
      mode: paymentMode,
      title: `Quote ${quote.quoteNumber}`,
      totalCents: Math.round(totals.total * 100),
      depositPct: Number(quote.depositPct || 0.2)
    });

    // Generate PDF attachment
    const pdfService = PDFService.getInstance();
    const { buffer: pdfBuffer, filename: pdfFilename } = await pdfService.generateQuotePDF(quote as any);

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
      deposit: paymentMode === 'deposit' ? formatMoney(checkoutResult.amount / 100) : undefined, // Convert cents back to dollars
      terms: quote.terms || 'Payment due upon acceptance. All services subject to availability.',
      message: quote.notes || 'Thank you for choosing Kocky\'s Bar & Grill! Please find your quote attached.',
      payUrl: checkoutResult.url,
      stripePaymentLink: checkoutResult.url, // New field for the modern template
      unsubscribeLink: `${process.env.APP_BASE_URL || 'https://staging.kockys.com'}/unsubscribe?email=${encodeURIComponent(quote.inquiry.email)}` // Unsubscribe link
    };

    // Log the email data for debugging
    logger.info('Email data prepared for quote', {
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
      hasPdf: !!pdfBuffer,
      pdfFilename: pdfFilename
    });

    // Send email using centralized email system
    const emailSent = await sendEmail({
      to: quote.inquiry.email,
      subject: `Your Quote ${quote.quoteNumber} — Kocky's`,
      template: 'quote',
      data: emailData,
      cc: [process.env.EMAIL_FROM_ADDRESS || 'info@kockys.com'],
      bcc: [],
      attachments: [{
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }],
    });

    if (!emailSent) {
      throw new Error('Failed to send quote email');
    }

    // Log successful email sending
    logger.info('Quote email sent successfully', {
      templateName: 'quote',
      hasPdf: true,
      payUrl: !!checkoutResult.url,
      to: quote.inquiry.email,
      quoteId: quote.id,
      paymentMode,
      sessionId: checkoutResult.sessionId
    });

    return {
      checkoutUrl: checkoutResult.url,
      sessionId: checkoutResult.sessionId
    };

  } catch (error) {
    logger.error('Failed to send quote email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      quoteId: quote.id,
      paymentMode,
      customerEmail: quote.inquiry?.email
    });
    throw error;
  }
};

/**
 * Send quote email with PDF attachment only (no payment link)
 */
export const emailQuoteWithoutPayment = async (quote: QuoteWithDetails): Promise<void> => {
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

    // Generate PDF attachment
    const pdfBuffer = await generateQuotePDF(quote);
    const pdfFilename = `Quote-${quote.quoteNumber}.pdf`;

    // Prepare email data for template
    const emailData = {
      customerName: quote.inquiry.name,
      quoteNumber: quote.quoteNumber,
      serviceType: quote.inquiry.serviceType,
      eventDate: quote.inquiry.eventDate ? new Date(quote.inquiry.eventDate).toLocaleDateString() : undefined,
      validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A',
      total: formatMoney(totals.total),
      deposit: undefined, // No payment link
      terms: quote.terms || 'Payment due upon acceptance. All services subject to availability.',
      message: quote.notes || 'Thank you for choosing Kocky\'s Bar & Grill! Please find your quote attached.',
      payUrl: undefined // No payment link
    };

    // Send email using centralized email system
    const emailSent = await sendEmail({
      to: quote.inquiry.email,
      subject: `Your Quote ${quote.quoteNumber} — Kocky's`,
      template: 'quote',
      data: emailData,
      cc: [process.env.EMAIL_FROM_ADDRESS || 'info@kockys.com'],
      bcc: [],
      attachments: [{
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }],
    });

    if (!emailSent) {
      throw new Error('Failed to send quote email');
    }

    // Log successful email sending
    logger.info('Quote email sent successfully (no payment)', {
      templateName: 'quote',
      hasPdf: true,
      payUrl: false,
      to: quote.inquiry.email,
      quoteId: quote.id
    });

  } catch (error) {
    logger.error('Failed to send quote email without payment', {
      error: error instanceof Error ? error.message : 'Unknown error',
      quoteId: quote.id,
      customerEmail: quote.inquiry?.email
    });
    throw error;
  }
};
