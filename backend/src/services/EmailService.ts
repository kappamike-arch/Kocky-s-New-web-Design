import nodemailer, { Transporter } from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { format } from 'date-fns';

const prisma = new PrismaClient();

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface ReservationData {
  name: string;
  email: string;
  date: string;
  time: string;
  partySize: number;
  confirmationCode: string;
  specialRequests?: string;
}

interface QuoteData {
  customerName: string;
  customerEmail: string;
  quoteNumber: string;
  serviceType: string;
  eventDate: string;
  totalAmount: number;
  depositAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  validUntil: string;
  paymentLink?: string;
}

interface InquiryData {
  name: string;
  email: string;
  serviceType: string;
  eventDate: string;
  message: string;
  confirmationCode: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private fromEmail: string = '';
  private fromName: string = "Kocky's Bar & Grill";
  private companyInfo = {
    name: "Kocky's Bar & Grill",
    address: '123 Main Street, Your City, State 12345',
    phone: '(555) 123-4567',
    website: 'www.kockysbar.com',
    logoUrl: 'https://www.kockysbar.com/logo.png'
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Get email settings from database
      const settings = await prisma.settings.findFirst();
      const emailSettings = settings?.emailSettings as any;

      if (emailSettings?.smtpHost) {
        // Use database settings if available
        this.fromEmail = emailSettings.fromEmail || process.env.SMTP_USER || '';
        this.fromName = emailSettings.fromName || this.fromName;
        
        this.transporter = nodemailer.createTransport({
          host: emailSettings.smtpHost,
          port: emailSettings.smtpPort || 587,
          secure: emailSettings.smtpPort === 465,
          auth: {
            user: emailSettings.smtpUser,
            pass: emailSettings.smtpPassword,
          },
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
          },
          requireTLS: true,
        });
      } else if (process.env.SMTP_HOST) {
        // Fall back to environment variables
        this.fromEmail = process.env.SMTP_USER || '';
        
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
          },
          requireTLS: true,
        });
      }

      // Update company info from settings if available
      if (settings) {
        this.companyInfo.name = settings.siteName || this.companyInfo.name;
        const fullAddress = `${settings.address}, ${settings.city}, ${settings.state} ${settings.zipCode}`;
        this.companyInfo.address = fullAddress;
        this.companyInfo.phone = settings.contactPhone || this.companyInfo.phone;
        this.companyInfo.website = settings.onlineOrderingUrl || this.companyInfo.website;
      }

      // Verify connection
      if (this.transporter) {
        await this.transporter.verify();
        logger.info('Email service initialized successfully');
      }
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  private getBaseTemplate(content: string, preheader: string = ''): EmailTemplate {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.companyInfo.name}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <!-- Preheader Text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${preheader}
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ${this.companyInfo.name}
              </h1>
              <p style="margin: 10px 0 0 0; color: #FCD34D; font-size: 14px; font-style: italic;">
                Great Food • Amazing Drinks • Perfect Atmosphere
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #2D3748; padding: 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; color: #CBD5E0; font-size: 14px; line-height: 21px;">
                    <p style="margin: 0 0 10px 0;">
                      <strong style="color: #FCD34D;">${this.companyInfo.name}</strong>
                    </p>
                    <p style="margin: 0 0 10px 0;">
                      ${this.companyInfo.address}
                    </p>
                    <p style="margin: 0 0 10px 0;">
                      📞 ${this.companyInfo.phone} | 🌐 ${this.companyInfo.website}
                    </p>
                    <p style="margin: 20px 0 0 0; font-size: 12px; color: #A0AEC0;">
                      This email was sent from an automated system. Please do not reply directly to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `${content.replace(/<[^>]*>/g, '')}

---
${this.companyInfo.name}
${this.companyInfo.address}
${this.companyInfo.phone} | ${this.companyInfo.website}

This email was sent from an automated system.`;

    return { html, text, subject: '' };
  }

  public async sendReservationConfirmation(data: ReservationData): Promise<boolean> {
    try {
      const content = `
        <h2 style="color: #DC2626; margin: 0 0 20px 0;">Reservation Confirmed! 🎉</h2>
        <p style="color: #4A5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
          Hello ${data.name},
        </p>
        <p style="color: #4A5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
          We're delighted to confirm your reservation at ${this.companyInfo.name}. We look forward to serving you!
        </p>
        
        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 30px 0;">
          <h3 style="color: #92400E; margin: 0 0 15px 0;">Reservation Details</h3>
          <table style="width: 100%; color: #4A5568;">
            <tr>
              <td style="padding: 5px 0;"><strong>Date:</strong></td>
              <td style="padding: 5px 0;">${data.date}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Time:</strong></td>
              <td style="padding: 5px 0;">${data.time}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Party Size:</strong></td>
              <td style="padding: 5px 0;">${data.partySize} guests</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Confirmation Code:</strong></td>
              <td style="padding: 5px 0; color: #DC2626; font-weight: bold;">${data.confirmationCode}</td>
            </tr>
            ${data.specialRequests ? `
            <tr>
              <td style="padding: 5px 0;"><strong>Special Requests:</strong></td>
              <td style="padding: 5px 0;">${data.specialRequests}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <p style="color: #4A5568; font-size: 16px; line-height: 24px; margin: 20px 0;">
          Please arrive on time to ensure your table is ready. If you need to modify or cancel your reservation, 
          please call us at ${this.companyInfo.phone} at least 2 hours in advance.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.companyInfo.website}/reservations" 
             style="display: inline-block; padding: 12px 30px; background-color: #DC2626; color: #ffffff; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Reservation
          </a>
        </div>
      `;

      const template = this.getBaseTemplate(content, `Reservation confirmed for ${data.date} at ${data.time}`);
      template.subject = `✅ Reservation Confirmed - ${data.date} at ${data.time}`;

      await this.sendEmail(data.email, template);
      
      // Log email
      await this.logEmail({
        recipient: data.email,
        type: 'CONFIRMATION',
        subject: template.subject,
        body: content,
        status: 'SENT'
      });

      return true;
    } catch (error) {
      logger.error('Failed to send reservation confirmation:', error);
      return false;
    }
  }

  public async sendQuote(data: QuoteData): Promise<boolean> {
    try {
      const itemsHtml = data.items.map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${item.description}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">$${item.subtotal.toFixed(2)}</td>
        </tr>
      `).join('');

      const content = `
        <h2 style="color: #DC2626; margin: 0 0 20px 0;">Your Custom Quote is Ready! 📋</h2>
        <p style="color: #4A5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
          Dear ${data.customerName},
        </p>
        <p style="color: #4A5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
          Thank you for your interest in our ${data.serviceType} services. We've prepared a custom quote based on your requirements.
        </p>
        
        <div style="background-color: #F7FAFC; border: 1px solid #E2E8F0; padding: 20px; margin: 30px 0; border-radius: 8px;">
          <h3 style="color: #2D3748; margin: 0 0 15px 0;">Quote #${data.quoteNumber}</h3>
          <p style="color: #4A5568; margin: 0 0 10px 0;"><strong>Service:</strong> ${data.serviceType}</p>
          <p style="color: #4A5568; margin: 0 0 10px 0;"><strong>Event Date:</strong> ${data.eventDate}</p>
          <p style="color: #4A5568; margin: 0;"><strong>Valid Until:</strong> ${data.validUntil}</p>
        </div>

        <h3 style="color: #2D3748; margin: 30px 0 15px 0;">Quote Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #EDF2F7;">
              <th style="padding: 10px; text-align: left; color: #4A5568;">Description</th>
              <th style="padding: 10px; text-align: center; color: #4A5568;">Qty</th>
              <th style="padding: 10px; text-align: right; color: #4A5568;">Unit Price</th>
              <th style="padding: 10px; text-align: right; color: #4A5568;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #DC2626; font-size: 18px;">
                $${data.totalAmount.toFixed(2)}
              </td>
            </tr>
            ${data.depositAmount > 0 ? `
            <tr>
              <td colspan="3" style="padding: 5px; text-align: right;">Deposit Required:</td>
              <td style="padding: 5px; text-align: right; color: #4A5568;">
                $${data.depositAmount.toFixed(2)}
              </td>
            </tr>
            ` : ''}
          </tfoot>
        </table>

        ${data.paymentLink ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.paymentLink}" 
             style="display: inline-block; padding: 15px 40px; background-color: #10B981; color: #ffffff; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Accept Quote & Pay Deposit
          </a>
        </div>
        ` : ''}

        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 30px 0;">
          <p style="color: #92400E; margin: 0; font-size: 14px;">
            <strong>Next Steps:</strong><br>
            1. Review the quote details above<br>
            2. Click the payment link to accept and pay the deposit<br>
            3. We'll contact you to finalize the details<br>
            4. Questions? Call us at ${this.companyInfo.phone}
          </p>
        </div>
      `;

      const template = this.getBaseTemplate(content, `Quote #${data.quoteNumber} - $${data.totalAmount.toFixed(2)}`);
      template.subject = `📋 Your Quote #${data.quoteNumber} from ${this.companyInfo.name}`;

      await this.sendEmail(data.customerEmail, template);
      
      // Log email
      await this.logEmail({
        recipient: data.customerEmail,
        type: 'QUOTE',
        subject: template.subject,
        body: content,
        status: 'SENT',
        quoteId: data.quoteNumber
      });

      return true;
    } catch (error) {
      logger.error('Failed to send quote:', error);
      return false;
    }
  }

  public async sendInquiryFollowup(data: InquiryData): Promise<boolean> {
    try {
      const content = `
        <h2 style="color: #DC2626; margin: 0 0 20px 0;">Thank You for Your Inquiry! 🙏</h2>
        <p style="color: #4A5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
          Hi ${data.name},
        </p>
        <p style="color: #4A5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
          We've received your inquiry about our <strong>${data.serviceType}</strong> services for ${data.eventDate}. 
          Our team is reviewing your requirements and will prepare a custom quote for you.
        </p>
        
        <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; margin: 30px 0;">
          <h3 style="color: #14532D; margin: 0 0 15px 0;">What Happens Next?</h3>
          <ol style="color: #4A5568; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Our team will review your inquiry (within 24 hours)</li>
            <li style="margin-bottom: 10px;">We'll prepare a custom quote based on your needs</li>
            <li style="margin-bottom: 10px;">You'll receive the quote via email</li>
            <li style="margin-bottom: 10px;">We'll follow up to answer any questions</li>
          </ol>
        </div>

        <div style="background-color: #F7FAFC; border: 1px solid #E2E8F0; padding: 20px; margin: 30px 0; border-radius: 8px;">
          <h3 style="color: #2D3748; margin: 0 0 15px 0;">Your Inquiry Details</h3>
          <p style="color: #4A5568; margin: 0 0 10px 0;"><strong>Service Type:</strong> ${data.serviceType}</p>
          <p style="color: #4A5568; margin: 0 0 10px 0;"><strong>Event Date:</strong> ${data.eventDate}</p>
          <p style="color: #4A5568; margin: 0 0 10px 0;"><strong>Your Message:</strong></p>
          <p style="color: #4A5568; margin: 0; padding: 10px; background-color: #ffffff; border-radius: 4px;">
            ${data.message}
          </p>
          <p style="color: #DC2626; margin: 15px 0 0 0; font-weight: bold;">
            Reference Code: ${data.confirmationCode}
          </p>
        </div>

        <p style="color: #4A5568; font-size: 16px; line-height: 24px; margin: 20px 0;">
          Need immediate assistance? Don't hesitate to call us at <strong>${this.companyInfo.phone}</strong> 
          and reference your inquiry code: <strong>${data.confirmationCode}</strong>
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #4A5568; margin: 0 0 15px 0;">Connect with us:</p>
          <a href="${this.companyInfo.website}" 
             style="display: inline-block; margin: 0 5px; padding: 10px 20px; background-color: #DC2626; 
                    color: #ffffff; text-decoration: none; border-radius: 5px;">
            Visit Website
          </a>
          <a href="tel:${this.companyInfo.phone.replace(/\D/g, '')}" 
             style="display: inline-block; margin: 0 5px; padding: 10px 20px; background-color: #4A5568; 
                    color: #ffffff; text-decoration: none; border-radius: 5px;">
            Call Us
          </a>
        </div>
      `;

      const template = this.getBaseTemplate(content, `Inquiry received for ${data.serviceType} on ${data.eventDate}`);
      template.subject = `✅ We've Received Your ${data.serviceType} Inquiry - ${this.companyInfo.name}`;

      await this.sendEmail(data.email, template);
      
      // Log email
      await this.logEmail({
        recipient: data.email,
        type: 'FOLLOW_UP',
        subject: template.subject,
        body: content,
        status: 'SENT'
      });

      return true;
    } catch (error) {
      logger.error('Failed to send inquiry followup:', error);
      return false;
    }
  }

  public async sendTestEmail(toEmail: string): Promise<boolean> {
    try {
      const content = `
        <h2 style="color: #DC2626; margin: 0 0 20px 0;">Test Email Successfully Sent! ✅</h2>
        <p style="color: #4A5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
          This is a test email from your ${this.companyInfo.name} email system.
        </p>
        
        <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; margin: 30px 0;">
          <h3 style="color: #14532D; margin: 0 0 15px 0;">Email Configuration Status</h3>
          <table style="width: 100%; color: #4A5568;">
            <tr>
              <td style="padding: 5px 0;"><strong>SMTP Host:</strong></td>
              <td style="padding: 5px 0;">smtp.office365.com</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Port:</strong></td>
              <td style="padding: 5px 0;">587 (TLS)</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>From Email:</strong></td>
              <td style="padding: 5px 0;">${this.fromEmail}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>From Name:</strong></td>
              <td style="padding: 5px 0;">${this.fromName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Status:</strong></td>
              <td style="padding: 5px 0; color: #10B981; font-weight: bold;">✅ Working</td>
            </tr>
          </table>
        </div>

        <p style="color: #4A5568; font-size: 16px; line-height: 24px; margin: 20px 0;">
          <strong>Email Templates Available:</strong>
        </p>
        <ul style="color: #4A5568; margin: 0 0 20px 0;">
          <li>Reservation Confirmation</li>
          <li>Quote Delivery</li>
          <li>Inquiry Follow-up</li>
          <li>Order Confirmation</li>
          <li>Payment Receipt</li>
        </ul>

        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 30px 0;">
          <p style="color: #92400E; margin: 0; font-size: 14px;">
            <strong>Note:</strong> This test confirms that your email system is properly configured 
            and ready to send automated emails. If you received this email in your inbox 
            (not spam), your configuration is optimal.
          </p>
        </div>

        <p style="color: #4A5568; font-size: 14px; line-height: 21px; margin: 20px 0;">
          Test performed at: ${format(new Date(), 'PPpp')}
        </p>
      `;

      const template = this.getBaseTemplate(content, 'Email system test - Configuration verified');
      template.subject = `🧪 Test Email from ${this.companyInfo.name} - Configuration Verified`;

      await this.sendEmail(toEmail, template);
      
      // Log email
      await this.logEmail({
        recipient: toEmail,
        type: 'CUSTOM',
        subject: template.subject,
        body: content,
        status: 'SENT'
      });

      return true;
    } catch (error) {
      logger.error('Failed to send test email:', error);
      return false;
    }
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    if (!this.transporter) {
      logger.warn('Email transporter not configured, skipping email send');
      logger.info('Email would be sent to:', { to, subject: template.subject });
      return;
    }

    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    await this.transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}`);
  }

  private async logEmail(data: {
    recipient: string;
    type: string;
    subject: string;
    body: string;
    status: string;
    inquiryId?: string;
    quoteId?: string;
  }): Promise<void> {
    try {
      await prisma.emailLog.create({
        data: {
          recipient: data.recipient,
          recipientEmail: data.recipient,
          type: data.type as any,
          subject: data.subject,
          body: data.body,
          status: data.status as any,
          sentAt: data.status === 'SENT' ? new Date() : undefined,
          failedAt: data.status === 'FAILED' ? new Date() : undefined,
          inquiryId: data.inquiryId,
          quoteId: data.quoteId,
        },
      });
    } catch (error) {
      logger.error('Failed to log email:', error);
    }
  }

  public async updateEmailSettings(settings: {
    fromEmail: string;
    fromName: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  }): Promise<void> {
    try {
      // Update settings in database
      await prisma.settings.upsert({
        where: { id: 'default' },
        update: {
          emailSettings: settings
        },
        create: {
          id: 'default',
          siteName: this.companyInfo.name,
          contactEmail: settings.fromEmail,
          contactPhone: '(555) 123-4567',
          address: '123 Main Street',
          city: 'Your City',
          state: 'Your State',
          zipCode: '12345',
          country: 'USA',
          emailSettings: settings,
          socialMedia: {},
          businessHours: {},
          paymentSettings: {},
          reservationSettings: {}
        }
      });

      // Reinitialize transporter with new settings
      this.fromEmail = settings.fromEmail;
      this.fromName = settings.fromName;
      
      this.transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort,
        secure: settings.smtpPort === 465,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPassword,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        },
        requireTLS: true,
      });

      if (this.transporter) {
        await this.transporter.verify();
      }
      logger.info('Email settings updated successfully');
    } catch (error) {
      logger.error('Failed to update email settings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
