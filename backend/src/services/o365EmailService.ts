import axios from 'axios';
import { logger } from '../utils/logger';
import o365AuthService from './o365AuthService';

/**
 * Office 365 Email Service using Microsoft Graph API
 * 
 * Handles sending transactional emails via Office 365
 */

interface EmailRecipient {
  emailAddress: {
    address: string;
    name?: string;
  };
}

interface EmailBody {
  contentType: 'Text' | 'HTML';
  content: string;
}

interface EmailMessage {
  subject: string;
  body: EmailBody;
  toRecipients: EmailRecipient[];
  ccRecipients?: EmailRecipient[];
  bccRecipients?: EmailRecipient[];
}

interface SendMailRequest {
  message: EmailMessage;
  saveToSentItems: boolean;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

class O365EmailService {
  private readonly graphEndpoint: string;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.graphEndpoint = process.env.GRAPH_API_ENDPOINT || 'https://graph.microsoft.com/v1.0';
    this.fromEmail = process.env.O365_FROM_EMAIL || 'info@kockys.com';
    this.fromName = process.env.O365_FROM_NAME || "Kocky's Bar & Grill";
  }

  /**
   * Send email using Microsoft Graph API
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const emailId = `o365_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`📧 O365 EMAIL SEND ATTEMPT [${emailId}]`, {
      to: options.to,
      subject: options.subject,
      hasHtml: !!options.html,
      hasText: !!options.text,
      ccCount: options.cc?.length || 0,
      bccCount: options.bcc?.length || 0,
      attachmentCount: options.attachments?.length || 0
    });

    try {
      if (!o365AuthService.isConfigured()) {
        logger.error(`❌ O365 NOT CONFIGURED [${emailId}]`);
        return false;
      }

      const accessToken = await o365AuthService.getAccessToken();
      if (!accessToken) {
        logger.error(`❌ O365 ACCESS TOKEN FAILED [${emailId}]`);
        return false;
      }
      
      // Prepare recipients
      const toRecipients = this.prepareRecipients(options.to);
      const ccRecipients = options.cc ? this.prepareRecipients(options.cc) : undefined;
      const bccRecipients = options.bcc ? this.prepareRecipients(options.bcc) : undefined;

      // Process attachments if present
      let attachments: any[] | undefined;
      if (options.attachments && options.attachments.length > 0) {
        logger.info(`📎 PROCESSING ATTACHMENTS [${emailId}]`, {
          attachmentCount: options.attachments.length,
          filenames: options.attachments.map(att => att.filename)
        });
        
        attachments = options.attachments.map(attachment => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: attachment.filename,
          contentType: attachment.contentType || 'application/octet-stream',
          contentBytes: attachment.content.toString('base64')
        }));
      }

      // Create email message
      const emailMessage: EmailMessage = {
        subject: options.subject,
        body: {
          contentType: 'HTML',
          content: options.html || options.text || '',
        },
        toRecipients,
        ...(ccRecipients && { ccRecipients }),
        ...(bccRecipients && { bccRecipients }),
        ...(attachments && { attachments }),
      };

      const sendMailRequest: SendMailRequest = {
        message: emailMessage,
        saveToSentItems: true,
      };

      // Send email via Graph API
      const sendMailUrl = `${this.graphEndpoint}/users/${this.fromEmail}/sendMail`;
      
      const recipientList = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      
      logger.info(`📤 SENDING EMAIL VIA O365 [${emailId}]`, {
        to: recipientList,
        subject: options.subject,
        ccCount: ccRecipients?.length || 0,
        bccCount: bccRecipients?.length || 0,
        contentLength: emailMessage.body.content.length,
        fromEmail: this.fromEmail
      });

      const response = await axios.post(sendMailUrl, sendMailRequest, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (response.status === 202) {
        logger.info(`✅ EMAIL SENT VIA O365 [${emailId}]`, {
          to: recipientList,
          subject: options.subject,
          status: response.status,
          provider: 'Office 365 Graph API'
        });
        return true;
      } else {
        logger.error(`❌ O365 UNEXPECTED RESPONSE [${emailId}]`, {
          status: response.status,
          data: response.data
        });
        return false;
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || 
                           error.response?.data?.error_description || 
                           error.message;
        logger.error(`❌ O365 EMAIL FAILED [${emailId}]`, {
          to: options.to,
          subject: options.subject,
          error: errorMessage,
          status: error.response?.status,
          isAuthError: error.response?.status === 401
        });
        
        // If it's an authentication error, clear the token to force refresh
        if (error.response?.status === 401) {
          logger.info(`🔄 O365 AUTH ERROR - CLEARING TOKEN [${emailId}]`);
          o365AuthService.clearToken();
        }
      } else {
        logger.error(`❌ O365 EMAIL FAILED [${emailId}]`, {
          to: options.to,
          subject: options.subject,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      return false;
    }
  }

  /**
   * Prepare recipients array for Graph API
   */
  private prepareRecipients(recipients: string | string[]): EmailRecipient[] {
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    
    return recipientList.map(email => ({
      emailAddress: {
        address: email.trim(),
        name: email.trim(),
      },
    }));
  }

  /**
   * Test the email service configuration
   */
  async testEmailService(): Promise<boolean> {
    try {
      logger.info('Testing Office 365 email service...');
      
      if (!o365AuthService.isConfigured()) {
        logger.error('Office 365 service not configured');
        return false;
      }

      // Test authentication
      const token = await o365AuthService.getAccessToken();
      if (!token) {
        logger.error('Failed to obtain access token');
        return false;
      }

      logger.info('✅ Office 365 authentication test passed');
      
      // Test Graph API connection
      const testUrl = `${this.graphEndpoint}/users/${this.fromEmail}`;
      const response = await axios.get(testUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        logger.info('✅ Office 365 Graph API connection test passed');
        logger.info(`From email: ${this.fromEmail}`);
        return true;
      } else {
        logger.error('Graph API connection test failed:', response.status);
        return false;
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        logger.error('Office 365 service test failed:', errorMessage);
      } else {
        logger.error('Office 365 service test failed:', error);
      }
      return false;
    }
  }

  /**
   * Get service status information
   */
  getServiceStatus(): {
    configured: boolean;
    fromEmail: string;
    fromName: string;
    tokenInfo: any;
  } {
    return {
      configured: o365AuthService.isConfigured(),
      fromEmail: this.fromEmail,
      fromName: this.fromName,
      tokenInfo: o365AuthService.getTokenInfo(),
    };
  }
}

// Export singleton instance
export const o365EmailService = new O365EmailService();
export default o365EmailService;