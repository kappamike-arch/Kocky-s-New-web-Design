import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EmailOptions {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface TrackingOptions {
  contactId: string;
  campaignId?: string;
  baseUrl: string;
}

class EmailMailer {
  private transporter: nodemailer.Transporter;
  private provider: string;

  constructor() {
    this.provider = process.env.SMTP_PROVIDER || 'smtp';
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    switch (this.provider.toLowerCase()) {
      case 'sendgrid':
        return nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });

      case 'mailgun':
        return nodemailer.createTransport({
          service: 'Mailgun',
          auth: {
            user: process.env.MAILGUN_USERNAME,
            pass: process.env.MAILGUN_PASSWORD
          }
        });

      case 'ses':
        return nodemailer.createTransport({
          service: 'SES',
          auth: {
            user: process.env.AWS_ACCESS_KEY_ID,
            pass: process.env.AWS_SECRET_ACCESS_KEY
          }
        });

      default: // smtp
        return nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
    }
  }

  /**
   * Inject tracking pixel and rewrite links in HTML
   */
  private injectTracking(html: string, tracking: TrackingOptions): string {
    const { contactId, campaignId, baseUrl } = tracking;
    
    // Add tracking pixel
    const trackingPixel = `<img src="${baseUrl}/api/email/track/open?cid=${contactId}&cmp=${campaignId || ''}" width="1" height="1" style="display:none;" />`;
    
    // Rewrite links to include click tracking
    const linkRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi;
    const trackedHtml = html.replace(linkRegex, (match, beforeHref, url, afterHref) => {
      // Skip if it's already a tracking link
      if (url.includes('/api/email/track/')) {
        return match;
      }
      
      const encodedUrl = Buffer.from(url).toString('base64url');
      const trackingUrl = `${baseUrl}/api/email/track/click?cid=${contactId}&cmp=${campaignId || ''}&u=${encodedUrl}`;
      
      return `<a ${beforeHref}href="${trackingUrl}"${afterHref}>`;
    });

    // Insert tracking pixel before closing body tag
    return trackedHtml.replace('</body>', `${trackingPixel}</body>`);
  }

  /**
   * Send email with tracking
   */
  async sendEmail(options: EmailOptions, tracking?: TrackingOptions): Promise<boolean> {
    try {
      let html = options.html;
      
      // Inject tracking if provided
      if (tracking) {
        html = this.injectTracking(html, tracking);
      }

      const mailOptions = {
        from: options.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
        text: options.text,
        replyTo: options.replyTo
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // Log the email event if tracking is provided
      if (tracking) {
        await this.logEmailEvent(tracking.contactId, tracking.campaignId, 'SENT', {
          messageId: result.messageId,
          to: options.to,
          subject: options.subject
        });
      }

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Log failed email event if tracking is provided
      if (tracking) {
        await this.logEmailEvent(tracking.contactId, tracking.campaignId, 'BOUNCE', {
          error: error instanceof Error ? error.message : String(error),
          to: options.to,
          subject: options.subject
        });
      }
      
      return false;
    }
  }

  /**
   * Log email event to database
   */
  private async logEmailEvent(
    contactId: string, 
    campaignId: string | undefined, 
    type: 'SENT' | 'BOUNCE' | 'COMPLAINT', 
    meta: any
  ): Promise<void> {
    try {
      await prisma.emailEvent.create({
        data: {
          contactId,
          campaignId,
          type: type as any,
          meta
        }
      });
    } catch (error) {
      console.error('Failed to log email event:', error);
    }
  }

  /**
   * Record email open event
   */
  async recordOpen(contactId: string, campaignId?: string): Promise<void> {
    try {
      await prisma.emailEvent.create({
        data: {
          contactId,
          campaignId,
          type: 'OPEN',
          meta: { timestamp: new Date().toISOString() }
        }
      });
    } catch (error) {
      console.error('Failed to record email open:', error);
    }
  }

  /**
   * Record email click event
   */
  async recordClick(contactId: string, campaignId: string | undefined, url: string): Promise<void> {
    try {
      await prisma.emailEvent.create({
        data: {
          contactId,
          campaignId,
          type: 'CLICK',
          meta: { 
            url,
            timestamp: new Date().toISOString() 
          }
        }
      });
    } catch (error) {
      console.error('Failed to record email click:', error);
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return false;
    }
  }
}

export const mailer = new EmailMailer();
export default mailer;
