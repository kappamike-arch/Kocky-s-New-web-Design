import axios from 'axios';
import { logger } from '../utils/logger';

/**
 * Centralized Office 365 Email Service
 * 
 * This service handles all transactional emails for Kocky's website:
 * - Reservations
 * - Contact inquiries
 * - Job applications
 * - Catering/Events
 * 
 * Uses Office 365 OAuth2 client credentials flow with Microsoft Graph API
 */

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface EmailRecipient {
  emailAddress: {
    address: string;
    name?: string;
  };
}

interface EmailMessage {
  subject: string;
  body: {
    contentType: 'Text' | 'HTML';
    content: string;
  };
  toRecipients: EmailRecipient[];
  ccRecipients?: EmailRecipient[];
  bccRecipients?: EmailRecipient[];
}

interface SendMailRequest {
  message: EmailMessage;
  saveToSentItems: boolean;
}

interface InquiryData {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  serviceType?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  guestCount?: string | number;
  companyName?: string;
  confirmationCode?: string;
  packageType?: string;
  budget?: string;
  specialRequests?: string;
  position?: string;
  coverLetter?: string;
  resume?: string;
  applicationId?: string;
  eventType?: string;
  location?: string;
}

interface EmailResults {
  adminSent: boolean;
  customerSent: boolean;
}

class CentralizedEmailService {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private fromEmail: string;
  private fromName: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private tokenEndpoint: string;
  private graphEndpoint: string;
  public isConfigured: boolean;

  constructor() {
    this.clientId = process.env.O365_CLIENT_ID || '';
    this.clientSecret = process.env.O365_CLIENT_SECRET || '';
    this.tenantId = process.env.O365_TENANT_ID || '';
    this.fromEmail = process.env.O365_FROM_EMAIL || 'info@kockys.com';
    this.fromName = process.env.O365_FROM_NAME || "Kocky's Bar & Grill";
    
    this.tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    this.graphEndpoint = 'https://graph.microsoft.com/v1.0';
    
    this.isConfigured = !!(this.clientId && this.clientSecret && this.tenantId);
  }

  /**
   * Get a valid access token for Microsoft Graph API
   * Automatically handles token refresh if needed
   */
  async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid token (with 1 minute buffer)
      if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
        return this.accessToken;
      }

      // Request new token
      await this.requestNewToken();
      return this.accessToken!;
    } catch (error) {
      logger.error('Failed to get Office 365 access token:', error);
      throw new Error('Office 365 authentication failed');
    }
  }

  /**
   * Request a new access token from Microsoft OAuth2 endpoint
   */
  private async requestNewToken(): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('scope', 'https://graph.microsoft.com/.default');
      params.append('grant_type', 'client_credentials');

      logger.info('Requesting new Office 365 access token...');

      const response = await axios.post<TokenResponse>(this.tokenEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        
        logger.info('✅ Office 365 access token obtained successfully');
        logger.info(`Token expires in: ${response.data.expires_in} seconds`);
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error_description || 
                           error.response?.data?.error || 
                           error.message;
        logger.error('Office 365 token request failed:', errorMessage);
        throw new Error(`Office 365 authentication failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Send email using Microsoft Graph API
   * 
   * @param to - Recipient email(s)
   * @param subject - Email subject
   * @param htmlBody - HTML email content
   * @param textBody - Plain text email content (optional)
   * @param cc - CC recipients (optional)
   * @param bcc - BCC recipients (optional)
   * @returns Success status
   */
  async sendEmail(
    to: string | string[], 
    subject: string, 
    htmlBody: string, 
    textBody?: string, 
    cc?: string[], 
    bcc?: string[]
  ): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        logger.error('Office 365 email service not configured');
        return false;
      }

      const accessToken = await this.getAccessToken();
      
      // Prepare recipients
      const toRecipients = this.prepareRecipients(to);
      const ccRecipients = cc ? this.prepareRecipients(cc) : undefined;
      const bccRecipients = bcc ? this.prepareRecipients(bcc) : undefined;

      // Create email message
      const emailMessage: EmailMessage = {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: htmlBody,
        },
        toRecipients,
        ...(ccRecipients && { ccRecipients }),
        ...(bccRecipients && { bccRecipients }),
      };

      const sendMailRequest: SendMailRequest = {
        message: emailMessage,
        saveToSentItems: true,
      };

      // Send email via Graph API
      const sendMailUrl = `${this.graphEndpoint}/users/${this.fromEmail}/sendMail`;
      
      const recipientList = Array.isArray(to) ? to.join(', ') : to;
      logger.info(`Sending email via Office 365 Graph API to: ${recipientList}`);

      const response = await axios.post(sendMailUrl, sendMailRequest, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (response.status === 202) {
        logger.info('✅ Email sent successfully via Office 365 Graph API');
        return true;
      } else {
        logger.error('Unexpected response from Office 365 Graph API:', response.status, response.data);
        return false;
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || 
                           error.response?.data?.error_description || 
                           error.message;
        logger.error('❌ Office 365 email sending failed:', errorMessage);
        
        // If it's an authentication error, clear the token to force refresh
        if (error.response?.status === 401) {
          logger.info('Authentication error detected, clearing token for refresh');
          this.accessToken = null;
          this.tokenExpiry = 0;
        }
      } else {
        logger.error('❌ Office 365 email sending failed:', error);
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
   * Send inquiry notification to admin
   * 
   * @param inquiryType - Type of inquiry (reservation, contact, job, catering, event)
   * @param data - Inquiry data
   * @returns Success status
   */
  async sendAdminNotification(inquiryType: string, data: InquiryData): Promise<boolean> {
    const subject = `New ${inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Inquiry - Kocky's Bar & Grill`;
    const htmlBody = this.generateAdminNotificationTemplate(inquiryType, data);
    
    return await this.sendEmail('info@kockys.com', subject, htmlBody);
  }

  /**
   * Send confirmation email to customer
   * 
   * @param inquiryType - Type of inquiry
   * @param data - Inquiry data
   * @param customerEmail - Customer's email address
   * @returns Success status
   */
  async sendCustomerConfirmation(inquiryType: string, data: InquiryData, customerEmail: string): Promise<boolean> {
    const subject = `${inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Confirmation - Kocky's Bar & Grill`;
    const htmlBody = this.generateCustomerConfirmationTemplate(inquiryType, data);
    
    return await this.sendEmail(customerEmail, subject, htmlBody);
  }

  /**
   * Send both admin notification and customer confirmation
   * 
   * @param inquiryType - Type of inquiry
   * @param data - Inquiry data
   * @param customerEmail - Customer's email address
   * @returns Results
   */
  async sendInquiryEmails(inquiryType: string, data: InquiryData, customerEmail: string): Promise<EmailResults> {
    const results: EmailResults = {
      adminSent: false,
      customerSent: false
    };

    try {
      // Send admin notification
      results.adminSent = await this.sendAdminNotification(inquiryType, data);
      
      // Send customer confirmation
      if (customerEmail) {
        results.customerSent = await this.sendCustomerConfirmation(inquiryType, data, customerEmail);
      }

      return results;
    } catch (error) {
      logger.error('Error sending inquiry emails:', error);
      return results;
    }
  }

  /**
   * Generate admin notification email template
   */
  private generateAdminNotificationTemplate(inquiryType: string, data: InquiryData): string {
    const timestamp = new Date().toLocaleString();
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🔔 New ${inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Inquiry</h1>
        </div>
        <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">A new ${inquiryType} inquiry has been submitted through the website:</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
            ${this.generateInquiryDetails(inquiryType, data)}
          </div>
          <p style="font-size: 16px; margin-bottom: 20px;"><strong>Action Required:</strong> Please review this inquiry and contact the customer if needed.</p>
          <p style="font-size: 16px;">This inquiry was automatically created through the website system.</p>
        </div>
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p style="margin: 5px 0;">Kocky's Bar & Grill Inquiry System</p>
          <p style="margin: 5px 0;">Generated on ${timestamp}</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate customer confirmation email template
   */
  private generateCustomerConfirmationTemplate(inquiryType: string, data: InquiryData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Confirmed!</h1>
        </div>
        <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.name || 'there'},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your ${inquiryType} inquiry at Kocky's Bar & Grill!</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
            ${this.generateConfirmationDetails(inquiryType, data)}
          </div>
          <p style="font-size: 16px; margin-bottom: 20px;">We have received your inquiry and will contact you within 24 hours.</p>
          <p style="font-size: 16px; margin-bottom: 20px;">If you have any immediate questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
          <p style="font-size: 16px;">Thank you for choosing Kocky's Bar & Grill!</p>
          <p style="font-size: 16px;">Best regards,<br><strong>The Kocky's Team</strong></p>
        </div>
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p style="margin: 5px 0;">Kocky's Bar & Grill | 123 Main Street | Your City, State 12345</p>
          <p style="margin: 5px 0;">www.kockys.com | info@kockys.com | (555) 123-4567</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate inquiry-specific details for admin notification
   */
  private generateInquiryDetails(inquiryType: string, data: InquiryData): string {
    const baseDetails = `
      <h3 style="margin-top: 0; color: #b22222;">Customer Information</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${data.name ? `<li style="margin: 10px 0; font-size: 16px;"><strong>👤 Name:</strong> ${data.name}</li>` : ''}
        ${data.email ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📧 Email:</strong> ${data.email}</li>` : ''}
        ${data.phone ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📞 Phone:</strong> ${data.phone}</li>` : ''}
      </ul>
    `;

    switch (inquiryType) {
      case 'reservation':
        return baseDetails + `
          <h3 style="color: #b22222; margin-top: 20px;">Reservation Details</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${data.eventDate ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📅 Date:</strong> ${data.eventDate}</li>` : ''}
            ${data.eventTime ? `<li style="margin: 10px 0; font-size: 16px;"><strong>🕐 Time:</strong> ${data.eventTime}</li>` : ''}
            ${data.guestCount ? `<li style="margin: 10px 0; font-size: 16px;"><strong>👥 Party Size:</strong> ${data.guestCount} guests</li>` : ''}
            ${data.confirmationCode ? `<li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${data.confirmationCode}</span></li>` : ''}
            ${data.specialRequests ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📝 Special Requests:</strong> ${data.specialRequests}</li>` : ''}
          </ul>
        `;

      case 'contact':
        return baseDetails + `
          <h3 style="color: #b22222; margin-top: 20px;">Contact Details</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${data.subject ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📋 Subject:</strong> ${data.subject}</li>` : ''}
            ${data.message ? `<li style="margin: 10px 0; font-size: 16px;"><strong>💬 Message:</strong> ${data.message}</li>` : ''}
          </ul>
        `;

      case 'job':
        return baseDetails + `
          <h3 style="color: #b22222; margin-top: 20px;">Job Application Details</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${data.position ? `<li style="margin: 10px 0; font-size: 16px;"><strong>💼 Position:</strong> ${data.position}</li>` : ''}
            ${data.coverLetter ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📝 Cover Letter:</strong> ${data.coverLetter}</li>` : ''}
            ${data.resume ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📄 Resume:</strong> ${data.resume}</li>` : ''}
          </ul>
        `;

      case 'catering':
      case 'event':
        return baseDetails + `
          <h3 style="color: #b22222; margin-top: 20px;">Event Details</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${data.eventType ? `<li style="margin: 10px 0; font-size: 16px;"><strong>🎉 Event Type:</strong> ${data.eventType}</li>` : ''}
            ${data.eventDate ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📅 Event Date:</strong> ${data.eventDate}</li>` : ''}
            ${data.guestCount ? `<li style="margin: 10px 0; font-size: 16px;"><strong>👥 Guest Count:</strong> ${data.guestCount}</li>` : ''}
            ${data.location ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📍 Location:</strong> ${data.location}</li>` : ''}
            ${data.budget ? `<li style="margin: 10px 0; font-size: 16px;"><strong>💰 Budget:</strong> ${data.budget}</li>` : ''}
            ${data.specialRequests ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📝 Special Requests:</strong> ${data.specialRequests}</li>` : ''}
          </ul>
        `;

      default:
        return baseDetails;
    }
  }

  /**
   * Generate inquiry-specific confirmation details
   */
  private generateConfirmationDetails(inquiryType: string, data: InquiryData): string {
    switch (inquiryType) {
      case 'reservation':
        return `
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${data.eventDate ? `<li style="margin: 10px 0; font-size: 16px;"><strong>📅 Date:</strong> ${data.eventDate}</li>` : ''}
            ${data.eventTime ? `<li style="margin: 10px 0; font-size: 16px;"><strong>🕐 Time:</strong> ${data.eventTime}</li>` : ''}
            ${data.guestCount ? `<li style="margin: 10px 0; font-size: 16px;"><strong>👥 Party Size:</strong> ${data.guestCount} guests</li>` : ''}
            ${data.confirmationCode ? `<li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${data.confirmationCode}</span></li>` : ''}
          </ul>
        `;

      case 'contact':
        return `
          <p style="font-size: 16px; margin-bottom: 20px;">We have received your message and will respond within 24 hours.</p>
          ${data.subject ? `<p style="font-size: 16px;"><strong>Subject:</strong> ${data.subject}</p>` : ''}
        `;

      case 'job':
        return `
          <p style="font-size: 16px; margin-bottom: 20px;">We have received your job application and will review it within 3-5 business days.</p>
          ${data.position ? `<p style="font-size: 16px;"><strong>Position Applied For:</strong> ${data.position}</p>` : ''}
        `;

      case 'catering':
      case 'event':
        return `
          <p style="font-size: 16px; margin-bottom: 20px;">We have received your ${inquiryType} inquiry and will contact you within 24 hours with a customized quote.</p>
          ${data.eventType ? `<p style="font-size: 16px;"><strong>Event Type:</strong> ${data.eventType}</p>` : ''}
          ${data.eventDate ? `<p style="font-size: 16px;"><strong>Event Date:</strong> ${data.eventDate}</p>` : ''}
          ${data.guestCount ? `<p style="font-size: 16px;"><strong>Guest Count:</strong> ${data.guestCount}</p>` : ''}
        `;

      default:
        return `<p style="font-size: 16px;">We have received your inquiry and will contact you soon.</p>`;
    }
  }

  /**
   * Test the email service configuration
   */
  async testEmailService(): Promise<boolean> {
    try {
      logger.info('Testing centralized Office 365 email service...');
      
      if (!this.isConfigured) {
        logger.error('Office 365 service not configured');
        return false;
      }

      // Test authentication
      const token = await this.getAccessToken();
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
    hasToken: boolean;
    tokenExpiresIn: number;
    isExpired: boolean;
  } {
    return {
      configured: this.isConfigured,
      fromEmail: this.fromEmail,
      fromName: this.fromName,
      hasToken: !!this.accessToken,
      tokenExpiresIn: Math.max(0, this.tokenExpiry - Date.now()),
      isExpired: this.accessToken ? this.tokenExpiry <= Date.now() : false,
    };
  }
}

// Export singleton instance
const centralizedEmailService = new CentralizedEmailService();
export default centralizedEmailService;