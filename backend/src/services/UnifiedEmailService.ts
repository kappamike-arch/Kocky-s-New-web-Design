import { emailService } from './EmailService';
import { azureMailerService } from './AzureMailerService';
import { logger } from '../utils/logger';

export type EmailProvider = 'smtp' | 'azure' | 'auto';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  provider?: EmailProvider;
}

export class UnifiedEmailService {
  private preferredProvider: EmailProvider = 'auto';

  constructor() {
    // Determine preferred provider based on configuration
    this.determinePreferredProvider();
  }

  private determinePreferredProvider(): void {
    const azureConfigured = azureMailerService.isConfigured();
    const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;

    if (azureConfigured) {
      this.preferredProvider = 'azure';
      logger.info('Using Azure as preferred email provider');
    } else if (smtpConfigured) {
      this.preferredProvider = 'smtp';
      logger.info('Using SMTP as preferred email provider');
    } else {
      this.preferredProvider = 'auto';
      logger.warn('No email provider configured, using auto mode');
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    const provider = options.provider || this.preferredProvider;

    try {
      switch (provider) {
        case 'azure':
          return await this.sendViaAzure(options);
        
        case 'smtp':
          return await this.sendViaSMTP(options);
        
        case 'auto':
        default:
          return await this.sendWithFallback(options);
      }
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  private async sendViaAzure(options: EmailOptions): Promise<boolean> {
    if (!azureMailerService.isConfigured()) {
      logger.warn('Azure email not configured, falling back to SMTP');
      return await this.sendViaSMTP(options);
    }

    logger.info('Sending email via Azure OAuth2');
    return await azureMailerService.sendEmail(
      options.to,
      options.subject,
      options.html,
      options.text
    );
  }

  private async sendViaSMTP(options: EmailOptions): Promise<boolean> {
    logger.info('Sending email via SMTP');
    
    const template: EmailTemplate = {
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '')
    };

    // Use the existing email service's sendEmail method
    // We need to create a temporary transporter for this specific email
    try {
      const nodemailer = require('nodemailer');
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get email settings from database
      const settings = await prisma.settings.findFirst();
      const emailSettings = settings?.emailSettings as any;

      if (!emailSettings?.smtpHost) {
        logger.warn('SMTP not configured in database, checking environment variables');
        if (!process.env.SMTP_HOST) {
          throw new Error('No SMTP configuration available');
        }
      }

      const transporter = nodemailer.createTransport({
        host: emailSettings?.smtpHost || process.env.SMTP_HOST,
        port: emailSettings?.smtpPort || parseInt(process.env.SMTP_PORT || '587'),
        secure: (emailSettings?.smtpPort || process.env.SMTP_PORT) === '465',
        auth: {
          user: emailSettings?.smtpUser || process.env.SMTP_USER,
          pass: emailSettings?.smtpPassword || process.env.SMTP_PASS,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        },
        requireTLS: true,
      });

      const fromEmail = emailSettings?.fromEmail || process.env.SMTP_USER || 'info@kockys.com';
      const fromName = emailSettings?.fromName || "Kocky's Bar & Grill";

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      const result = await transporter.sendMail(mailOptions);
      logger.info(`SMTP email sent successfully to ${options.to}`, { messageId: result.messageId });
      
      await prisma.$disconnect();
      return true;
    } catch (error) {
      logger.error('Failed to send SMTP email:', error);
      return false;
    }
  }

  private async sendWithFallback(options: EmailOptions): Promise<boolean> {
    logger.info('Attempting to send email with automatic provider selection');

    // Try Azure first if configured
    if (azureMailerService.isConfigured()) {
      logger.info('Trying Azure first...');
      const azureResult = await this.sendViaAzure(options);
      if (azureResult) {
        return true;
      }
      logger.warn('Azure email failed, falling back to SMTP');
    }

    // Fall back to SMTP
    logger.info('Trying SMTP...');
    return await this.sendViaSMTP(options);
  }

  public async sendTestEmail(to: string, provider?: EmailProvider): Promise<boolean> {
    const subject = `🧪 Email Service Test - ${provider || this.preferredProvider}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0078d4;">Unified Email Service Test</h2>
        <p>This is a test email to verify your email configuration.</p>
        
        <div style="background-color: #f3f2f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Service Configuration:</h3>
          <ul>
            <li><strong>Provider:</strong> ${provider || this.preferredProvider}</li>
            <li><strong>Azure Configured:</strong> ${azureMailerService.isConfigured() ? '✅ Yes' : '❌ No'}</li>
            <li><strong>SMTP Configured:</strong> ${process.env.SMTP_HOST ? '✅ Yes' : '❌ No'}</li>
            <li><strong>Preferred Provider:</strong> ${this.preferredProvider}</li>
          </ul>
        </div>

        <div style="background-color: #e1f5fe; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Available Email Templates:</h3>
          <ul>
            <li>Reservation Confirmation</li>
            <li>Quote Delivery</li>
            <li>Inquiry Follow-up</li>
            <li>Order Confirmation</li>
            <li>Payment Receipt</li>
            <li>Custom Campaigns</li>
          </ul>
        </div>
        
        <p>If you received this email, your email system is working correctly!</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Test performed at: ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
      provider
    });
  }

  public getProviderStatus(): {
    azure: boolean;
    smtp: boolean;
    preferred: EmailProvider;
  } {
    return {
      azure: azureMailerService.isConfigured(),
      smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      preferred: this.preferredProvider
    };
  }

  public getAzureConfig(): any {
    return azureMailerService.getConfig();
  }

  public setPreferredProvider(provider: EmailProvider): void {
    this.preferredProvider = provider;
    logger.info(`Email provider preference set to: ${provider}`);
  }
}

// Export singleton instance
export const unifiedEmailService = new UnifiedEmailService();
