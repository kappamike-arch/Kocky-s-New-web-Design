import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../utils/logger';
import { azureOAuthService } from './azureOAuthService';

export class AzureEmailService {
  private static instance: AzureEmailService;
  private transporter: Transporter | null = null;

  private constructor() {
    this.initializeAzureTransporter();
  }

  public static getInstance(): AzureEmailService {
    if (!AzureEmailService.instance) {
      AzureEmailService.instance = new AzureEmailService();
    }
    return AzureEmailService.instance;
  }

  private initializeAzureTransporter(): void {
    try {
      // Azure/Office 365 SMTP configuration
      const config = {
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'info@kockys.com', // Your Azure email
          pass: process.env.AZURE_EMAIL_PASSWORD || '', // You'll need to set this
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
        requireTLS: true,
      };

      this.transporter = nodemailer.createTransport(config);
      
      // Verify connection
      if (this.transporter) {
        this.transporter.verify((error, success) => {
          if (error) {
            logger.error('Azure email service verification failed:', error);
          } else {
            logger.info('Azure email service verified successfully');
          }
        });
      }

    } catch (error) {
      logger.error('Failed to initialize Azure email service:', error);
    }
  }

  public async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    try {
      // Get OAuth2 access token
      const accessToken = await azureOAuthService.getValidAccessToken();
      
      // Create transporter with OAuth2
      const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
          type: 'OAuth2',
          user: 'info@kockys.com',
          clientId: '46b54378-7023-4746-845f-514f2fc40f8a',
          clientSecret: '2je8Q~mXwctPuMo4qxsinNmvlajkFQOZEinkWby.',
          refreshToken: accessToken,
          accessToken: accessToken,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
        requireTLS: true,
      });

      const mailOptions = {
        from: 'info@kockys.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await transporter.sendMail(mailOptions);
      logger.info(`Azure email sent successfully to ${options.to}:`, result.messageId);
      return true;

    } catch (error) {
      logger.error('Failed to send Azure email:', error);
      return false;
    }
  }
}

export const azureEmailService = AzureEmailService.getInstance();
