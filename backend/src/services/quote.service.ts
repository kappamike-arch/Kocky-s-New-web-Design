import { prisma } from '../server';
import { logger } from '../utils/logger';

export class QuoteService {
  /**
   * Attach a Stripe payment session to a quote
   */
  static async attachPaymentSession(quoteId: string, sessionId: string, checkoutUrl: string, mode: 'deposit' | 'full'): Promise<void> {
    try {
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          stripeSessionId: sessionId,
          paymentLink: checkoutUrl
        }
      });

      logger.info('Payment session attached to quote', {
        quoteId,
        sessionId,
        checkoutUrl,
        mode
      });
    } catch (error) {
      logger.error('Failed to attach payment session to quote', {
        error: error instanceof Error ? error.message : 'Unknown error',
        quoteId,
        sessionId,
        checkoutUrl,
        mode
      });
      throw error;
    }
  }

  /**
   * Mark a quote as having received a deposit payment
   */
  static async markDepositPaid(quoteId: string, sessionId: string): Promise<void> {
    try {
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          status: 'DEPOSIT_PAID',
          depositPaidAt: new Date(),
          stripeSessionId: sessionId
        }
      });

      logger.info('Quote marked as deposit paid', {
        quoteId,
        sessionId
      });
    } catch (error) {
      logger.error('Failed to mark quote as deposit paid', {
        error: error instanceof Error ? error.message : 'Unknown error',
        quoteId,
        sessionId
      });
      throw error;
    }
  }

  /**
   * Mark a quote as fully paid
   */
  static async markPaid(quoteId: string, sessionId: string): Promise<void> {
    try {
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          stripeSessionId: sessionId
        }
      });

      logger.info('Quote marked as fully paid', {
        quoteId,
        sessionId
      });
    } catch (error) {
      logger.error('Failed to mark quote as fully paid', {
        error: error instanceof Error ? error.message : 'Unknown error',
        quoteId,
        sessionId
      });
      throw error;
    }
  }

  /**
   * Mark a quote as refunded (optional stub)
   */
  static async markRefunded(quoteId: string, chargeId: string): Promise<void> {
    try {
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          status: 'REFUNDED'
        }
      });

      logger.info('Quote marked as refunded', {
        quoteId,
        chargeId
      });
    } catch (error) {
      logger.error('Failed to mark quote as refunded', {
        error: error instanceof Error ? error.message : 'Unknown error',
        quoteId,
        chargeId
      });
      throw error;
    }
  }

  /**
   * Calculate the total amount for a quote including items
   */
  static async calculateQuoteTotal(quoteId: string): Promise<number> {
    try {
      const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: {
          quoteItems: true
        }
      });

      if (!quote) {
        throw new Error('Quote not found');
      }

      // Calculate total from items
      const itemsTotal = quote.quoteItems.reduce((sum, item) => {
        return sum + Number(item.total);
      }, 0);

      // Update the quote total if it's not set or different
      if (!quote.total || Number(quote.total) !== itemsTotal) {
        await prisma.quote.update({
          where: { id: quoteId },
          data: { total: itemsTotal }
        });
      }

      return itemsTotal;
    } catch (error) {
      logger.error('Failed to calculate quote total', {
        error: error instanceof Error ? error.message : 'Unknown error',
        quoteId
      });
      throw error;
    }
  }

  /**
   * Get quote with calculated totals
   */
  static async getQuoteWithTotals(quoteId: string) {
    try {
      const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: {
          inquiry: true,
          quoteItems: true
        }
      });

      if (!quote) {
        return null;
      }

      // Calculate totals
      const itemsTotal = quote.quoteItems.reduce((sum, item) => {
        return sum + Number(item.total);
      }, 0);

      const total = Number(quote.total) || itemsTotal;
      const depositPct = Number(quote.depositPct) || 0.2;
      const depositAmount = total * depositPct;

      return {
        ...quote,
        calculatedTotal: total,
        calculatedDepositAmount: depositAmount,
        calculatedDepositPct: depositPct
      };
    } catch (error) {
      logger.error('Failed to get quote with totals', {
        error: error instanceof Error ? error.message : 'Unknown error',
        quoteId
      });
      throw error;
    }
  }

  /**
   * Send quote email with Stripe checkout and PDF attachment (DEPRECATED - Use quoteEmail.service.ts instead)
   */
  static async sendQuoteEmail(quoteId: string, paymentMode: 'deposit' | 'full') {
    const processId = `quote_service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.warn(`⚠️ USING DEPRECATED sendQuoteEmail [${processId}] - Use quoteEmail.service.ts instead`, {
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

      // Import the email composer
      const { emailQuote } = await import('./quoteEmail.composer');
      
      // Send the quote email
      const result = await emailQuote({
        quote: quote as any,
        paymentMode
      });

      // Persist Stripe checkout URL and session ID
      await this.attachPaymentSession(quoteId, result.sessionId, result.checkoutUrl, paymentMode);

      // Update quote status to SENT
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          status: 'SENT',
          sentToCustomer: true,
          sentAt: new Date()
        }
      });

      logger.info(`✅ QUOTE EMAIL SENT SUCCESSFULLY [${processId}]`, {
        quoteId,
        paymentMode,
        checkoutUrl: result.checkoutUrl,
        sessionId: result.sessionId,
        customerEmail: quote.inquiry.email
      });

      return {
        success: true,
        checkoutUrl: result.checkoutUrl,
        sessionId: result.sessionId
      };

    } catch (error) {
      logger.error(`❌ QUOTE EMAIL FAILED [${processId}]`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        quoteId,
        paymentMode,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}

