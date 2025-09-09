import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    const msg = {
      to,
      from: {
        email: this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@kockysbar.com',
        name: this.configService.get('SENDGRID_FROM_NAME') || "Kocky's Bar & Grill",
      },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    return this.sendWithRetry(msg);
  }

  async sendBulkEmails(recipients: string[], subject: string, html: string) {
    const messages = recipients.map(to => ({
      to,
      from: {
        email: this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@kockysbar.com',
        name: this.configService.get('SENDGRID_FROM_NAME') || "Kocky's Bar & Grill",
      },
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''),
    }));

    // Send in batches of 100 (SendGrid limit)
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      try {
        const result = await this.sendWithRetry({ multiple: batch });
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to send batch ${i / batchSize + 1}`, error);
        results.push({ error: error.message, batch: i / batchSize + 1 });
      }
    }

    return results;
  }

  async sendReservationConfirmation(reservation: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reservation Confirmed!</h1>
        <p>Dear ${reservation.guestName},</p>
        <p>Your reservation at Kocky's Bar & Grill has been confirmed.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Reservation Details:</h3>
          <p><strong>Confirmation Code:</strong> ${reservation.confirmationCode}</p>
          <p><strong>Date:</strong> ${new Date(reservation.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(reservation.date).toLocaleTimeString()}</p>
          <p><strong>Party Size:</strong> ${reservation.partySize} guests</p>
        </div>
        <p>If you need to modify or cancel your reservation, please call us at (555) 123-4567.</p>
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>Kocky's Bar & Grill Team</p>
      </div>
    `;

    return this.sendEmail(
      reservation.guestEmail,
      'Reservation Confirmation - Kocky\'s Bar & Grill',
      html,
    );
  }

  async sendQuoteEmail(quote: any, customer: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your Quote from Kocky's Bar & Grill</h1>
        <p>Dear ${customer.firstName} ${customer.lastName},</p>
        <p>Thank you for your inquiry. Please find your quote below:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Quote #${quote.quoteNumber}</h3>
          <p><strong>Valid Until:</strong> ${new Date(quote.validUntil).toLocaleDateString()}</p>
          <p><strong>Total:</strong> $${quote.total.toFixed(2)}</p>
        </div>
        ${quote.stripePaymentLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${quote.stripePaymentLink}" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Pay Now
            </a>
          </div>
        ` : ''}
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Kocky's Bar & Grill Team</p>
      </div>
    `;

    return this.sendEmail(
      customer.email,
      `Quote #${quote.quoteNumber} - Kocky's Bar & Grill`,
      html,
    );
  }

  private async sendWithRetry(msg: any, attempt = 1): Promise<any> {
    try {
      // If SendGrid is not configured, log and return
      if (!this.configService.get('SENDGRID_API_KEY')) {
        this.logger.warn('SendGrid API key not configured, skipping email send');
        return { message: 'Email service not configured' };
      }

      const result = await sgMail.send(msg);
      this.logger.log(`Email sent successfully on attempt ${attempt}`);
      return result;
    } catch (error) {
      this.logger.error(`Email send failed on attempt ${attempt}:`, error.message);

      if (attempt < this.maxRetries) {
        this.logger.log(`Retrying email send... Attempt ${attempt + 1}/${this.maxRetries}`);
        await this.delay(this.retryDelay * attempt); // Exponential backoff
        return this.sendWithRetry(msg, attempt + 1);
      }

      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
