import { prisma } from '../server';
import { logger } from '../utils/logger';

export class QuoteService {
  /**
   * Attach a Stripe payment session to a quote
   */
  static async attachPaymentSession(quoteId: string, sessionId: string, mode: 'deposit' | 'full'): Promise<void> {
    try {
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          stripeSessionId: sessionId,
          paymentLink: `https://checkout.stripe.com/pay/${sessionId}`
        }
      });

      logger.info('Payment session attached to quote', {
        quoteId,
        sessionId,
        mode
      });
    } catch (error) {
      logger.error('Failed to attach payment session to quote', {
        error: error instanceof Error ? error.message : 'Unknown error',
        quoteId,
        sessionId,
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
}
