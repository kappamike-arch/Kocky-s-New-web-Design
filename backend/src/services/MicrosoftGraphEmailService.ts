import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication, PublicClientApplication } from '@azure/msal-node';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { format } from 'date-fns';
import 'isomorphic-fetch';

const prisma = new PrismaClient();

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  headerHtml?: string;
  bodyHtml: string;
  footerHtml?: string;
  variables?: string[];
}

interface EmailAccount {
  email: string;
  displayName: string;
  isDefault: boolean;
}

interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string;
}

export class MicrosoftGraphEmailService {
  private msalClient: ConfidentialClientApplication | null = null;
  private graphClient: Client | null = null;
  private tokens: OAuthTokens | null = null;
  private companyInfo = {
    name: "Kocky's Bar & Grill",
    address: '123 Main Street, Your City, State 12345',
    phone: '(555) 123-4567',
    website: 'www.kockysbar.com',
    logoUrl: 'https://www.kockysbar.com/logo.png'
  };
  private emailAccounts: EmailAccount[] = [
    { email: 'info@kockysbar.com', displayName: 'Kocky\'s Info', isDefault: true },
    { email: 'reservations@kockysbar.com', displayName: 'Kocky\'s Reservations', isDefault: false },
    { email: 'catering@kockysbar.com', displayName: 'Kocky\'s Catering', isDefault: false },
    { email: 'events@kockysbar.com', displayName: 'Kocky\'s Events', isDefault: false }
  ];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Get OAuth settings from database
      const settings = await prisma.settings.findFirst();
      const oauthSettings = settings?.emailSettings as any;

      if (oauthSettings?.microsoftClientId && oauthSettings?.microsoftClientSecret) {
        // Initialize MSAL client for OAuth2
        const msalConfig = {
          auth: {
            clientId: oauthSettings.microsoftClientId,
            authority: `https://login.microsoftonline.com/${oauthSettings.microsoftTenantId || 'common'}`,
            clientSecret: oauthSettings.microsoftClientSecret,
          }
        };

        this.msalClient = new ConfidentialClientApplication(msalConfig);

        // Load stored tokens if available
        if (oauthSettings.microsoftTokens) {
          this.tokens = oauthSettings.microsoftTokens;
          await this.refreshTokenIfNeeded();
          this.initializeGraphClient();
        }

        // Load email accounts from settings
        if (oauthSettings.emailAccounts) {
          this.emailAccounts = oauthSettings.emailAccounts;
        }
      }

      // Update company info from settings if available
      if (settings) {
        this.companyInfo.name = settings.siteName || this.companyInfo.name;
        const fullAddress = `${settings.address}, ${settings.city}, ${settings.state} ${settings.zipCode}`;
        this.companyInfo.address = fullAddress;
        this.companyInfo.phone = settings.contactPhone || this.companyInfo.phone;
        this.companyInfo.website = settings.onlineOrderingUrl || this.companyInfo.website;
      }

      logger.info('Microsoft Graph Email Service initialized');
    } catch (error) {
      logger.error('Failed to initialize Microsoft Graph Email Service:', error);
    }
  }

  // Generate OAuth2 authorization URL for admin to authenticate
  public async getAuthorizationUrl(): Promise<string> {
    if (!this.msalClient) {
      throw new Error('MSAL client not configured. Please set up Microsoft App registration.');
    }

    const authCodeUrlParameters = {
      scopes: ['Mail.Send', 'Mail.ReadWrite', 'User.Read'],
      redirectUri: process.env.ADMIN_URL + '/api/email/oauth/callback',
      prompt: 'consent'
    };

    const authUrl = await this.msalClient.getAuthCodeUrl(authCodeUrlParameters);
    return authUrl;
  }

  // Handle OAuth2 callback and exchange code for tokens
  public async handleOAuthCallback(code: string): Promise<boolean> {
    if (!this.msalClient) {
      throw new Error('MSAL client not configured');
    }

    try {
      const tokenRequest = {
        code,
        scopes: ['Mail.Send', 'Mail.ReadWrite', 'User.Read'],
        redirectUri: process.env.ADMIN_URL + '/api/email/oauth/callback',
      };

      const response = await this.msalClient.acquireTokenByCode(tokenRequest);
      
      // Store tokens
      this.tokens = {
        accessToken: response.accessToken,
        refreshToken: '', // MSAL doesn't provide refresh token directly
        expiresAt: new Date(response.expiresOn || Date.now() + 3600000),
        scope: response.scopes.join(' ')
      };

      // Save tokens to database
      await this.saveTokensToDatabase();
      
      // Initialize Graph client
      this.initializeGraphClient();

      logger.info('OAuth2 authentication successful');
      return true;
    } catch (error) {
      logger.error('OAuth2 callback error:', error);
      return false;
    }
  }

  // Refresh access token if expired
  private async refreshTokenIfNeeded() {
    if (!this.tokens || !this.msalClient) return;

    const now = new Date();
    const expiresAt = new Date(this.tokens.expiresAt);
    
    // Refresh if token expires in less than 5 minutes
    if (expiresAt.getTime() - now.getTime() < 300000) {
      try {
        const refreshTokenRequest = {
          refreshToken: this.tokens.refreshToken || '',
          scopes: ['Mail.Send', 'Mail.ReadWrite', 'User.Read'],
        };

        const response = await this.msalClient.acquireTokenByRefreshToken(refreshTokenRequest);
        
        if (response) {
          this.tokens = {
            accessToken: response.accessToken,
            refreshToken: this.tokens.refreshToken, // Keep the same refresh token
            expiresAt: new Date(response.expiresOn || Date.now() + 3600000),
            scope: response.scopes.join(' ')
          };
        }

        await this.saveTokensToDatabase();
        this.initializeGraphClient();
        
        logger.info('Access token refreshed successfully');
      } catch (error) {
        logger.error('Failed to refresh access token:', error);
        throw error;
      }
    }
  }

  // Initialize Microsoft Graph client
  private initializeGraphClient() {
    if (!this.tokens) return;

    this.graphClient = Client.init({
      authProvider: (done) => {
        done(null, this.tokens!.accessToken);
      }
    });
  }

  // Save tokens to database
  private async saveTokensToDatabase() {
    try {
      const settings = await prisma.settings.findFirst();
      const emailSettings = (settings?.emailSettings as any) || {};
      
      emailSettings.microsoftTokens = this.tokens;
      
      await prisma.settings.upsert({
        where: { id: settings?.id || 'default' },
        update: { emailSettings },
        create: {
          id: 'default',
          siteName: this.companyInfo.name,
          contactEmail: this.emailAccounts[0].email,
          contactPhone: this.companyInfo.phone,
          address: '123 Main Street',
          city: 'Your City',
          state: 'Your State',
          zipCode: '12345',
          country: 'USA',
          onlineOrderingUrl: this.companyInfo.website,
          emailSettings,
          businessHours: {},
          socialMedia: {},
          paymentSettings: {},
          reservationSettings: {}
        }
      });
    } catch (error) {
      logger.error('Failed to save tokens to database:', error);
    }
  }

  // Get available email templates
  public async getEmailTemplates(): Promise<EmailTemplate[]> {
    const templates: EmailTemplate[] = [
      {
        id: 'reservation-confirmation',
        name: 'Reservation Confirmation',
        subject: 'Your Reservation at {{companyName}} - {{date}}',
        bodyHtml: this.getDefaultTemplateBody('reservation'),
        variables: ['customerName', 'date', 'time', 'partySize', 'confirmationCode']
      },
      {
        id: 'quote',
        name: 'Quote/Estimate',
        subject: 'Your Quote from {{companyName}} - {{quoteNumber}}',
        bodyHtml: this.getDefaultTemplateBody('quote'),
        variables: ['customerName', 'quoteNumber', 'serviceType', 'eventDate', 'totalAmount', 'items']
      },
      {
        id: 'inquiry-followup',
        name: 'Inquiry Follow-up',
        subject: 'Thank you for your inquiry - {{companyName}}',
        bodyHtml: this.getDefaultTemplateBody('inquiry'),
        variables: ['customerName', 'serviceType', 'eventDate', 'message']
      },
      {
        id: 'thank-you',
        name: 'Thank You',
        subject: 'Thank you from {{companyName}}',
        bodyHtml: this.getDefaultTemplateBody('thankyou'),
        variables: ['customerName', 'serviceName', 'date']
      }
    ];

    // Load custom templates from database
    const settings = await prisma.settings.findFirst();
    const customTemplates = (settings?.emailSettings as any)?.templates;
    
    if (customTemplates) {
      // Merge custom templates with defaults
      templates.forEach(template => {
        const custom = customTemplates[template.id];
        if (custom) {
          template.subject = custom.subject || template.subject;
          template.bodyHtml = custom.bodyHtml || template.bodyHtml;
          template.headerHtml = custom.headerHtml;
          template.footerHtml = custom.footerHtml;
        }
      });
    }

    return templates;
  }

  // Update email template
  public async updateEmailTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<void> {
    const settings = await prisma.settings.findFirst();
    const emailSettings = (settings?.emailSettings as any) || {};
    
    if (!emailSettings.templates) {
      emailSettings.templates = {};
    }
    
    emailSettings.templates[templateId] = {
      ...emailSettings.templates[templateId],
      ...updates,
      updatedAt: new Date()
    };
    
    await prisma.settings.update({
      where: { id: settings?.id || 'default' },
      data: { emailSettings }
    });
    
    logger.info(`Email template ${templateId} updated`);
  }

  // Send email using Microsoft Graph API
  public async sendEmail(
    to: string | string[],
    subject: string,
    htmlContent: string,
    fromEmail?: string,
    attachments?: Array<{ name: string; content: string; contentType: string }>
  ): Promise<boolean> {
    if (!this.graphClient) {
      logger.warn('Graph client not initialized, falling back to SMTP');
      return this.sendEmailViaSMTP(to, subject, htmlContent);
    }

    try {
      await this.refreshTokenIfNeeded();

      const toRecipients = Array.isArray(to) ? to : [to];
      const from = fromEmail || this.getDefaultEmailAccount().email;

      const message = {
        subject,
        body: {
          contentType: 'HTML',
          content: this.wrapEmailContent(htmlContent)
        },
        toRecipients: toRecipients.map(email => ({
          emailAddress: { address: email }
        })),
        from: {
          emailAddress: {
            address: from,
            name: this.companyInfo.name
          }
        },
        attachments: attachments?.map(att => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: att.name,
          contentType: att.contentType,
          contentBytes: att.content
        }))
      };

      await this.graphClient
        .api('/me/sendMail')
        .post({ message, saveToSentItems: true });

      logger.info(`Email sent successfully via Graph API to ${toRecipients.join(', ')}`);
      
      // Log email
      await this.logEmail({
        recipient: toRecipients.join(', '),
        subject,
        type: 'CUSTOM',
        status: 'SENT',
        sentFrom: from
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email via Graph API:', error);
      return false;
    }
  }

  // Fallback SMTP sending (uses existing EmailService)
  private async sendEmailViaSMTP(to: string | string[], subject: string, htmlContent: string): Promise<boolean> {
    // Import and use the existing EmailService as fallback
    const EmailServiceModule = await import('./EmailService');
    const emailService = EmailServiceModule.emailService;
    return emailService.sendTestEmail(Array.isArray(to) ? to[0] : to);
  }

  // Get default email account
  private getDefaultEmailAccount(): EmailAccount {
    return this.emailAccounts.find(acc => acc.isDefault) || this.emailAccounts[0];
  }

  // Get all email accounts
  public getEmailAccounts(): EmailAccount[] {
    return this.emailAccounts;
  }

  // Set email accounts
  public async setEmailAccounts(accounts: EmailAccount[]): Promise<void> {
    this.emailAccounts = accounts;
    
    const settings = await prisma.settings.findFirst();
    const emailSettings = (settings?.emailSettings as any) || {};
    emailSettings.emailAccounts = accounts;
    
    await prisma.settings.update({
      where: { id: settings?.id || 'default' },
      data: { emailSettings }
    });
  }

  // Wrap email content with header and footer
  private wrapEmailContent(content: string): string {
    const header = `
      <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 30px 40px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
          ${this.companyInfo.name}
        </h1>
        <p style="margin: 10px 0 0 0; color: #FCD34D; font-size: 14px; font-style: italic;">
          Great Food • Amazing Drinks • Perfect Atmosphere
        </p>
      </div>
    `;

    const footer = `
      <div style="background-color: #2D3748; padding: 30px 40px; margin-top: 40px;">
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
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <tr>
                  <td>${header}</td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    ${content}
                  </td>
                </tr>
                <tr>
                  <td>${footer}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // Get default template body
  private getDefaultTemplateBody(type: string): string {
    const templates: Record<string, string> = {
      reservation: `
        <h2 style="color: #DC2626;">Reservation Confirmed!</h2>
        <p>Hello {{customerName}},</p>
        <p>Your reservation has been confirmed for:</p>
        <ul>
          <li><strong>Date:</strong> {{date}}</li>
          <li><strong>Time:</strong> {{time}}</li>
          <li><strong>Party Size:</strong> {{partySize}}</li>
          <li><strong>Confirmation Code:</strong> {{confirmationCode}}</li>
        </ul>
        <p>We look forward to seeing you!</p>
      `,
      quote: `
        <h2 style="color: #DC2626;">Your Custom Quote</h2>
        <p>Dear {{customerName}},</p>
        <p>Thank you for your interest in our {{serviceType}} services.</p>
        <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
        <p><strong>Event Date:</strong> {{eventDate}}</p>
        <p><strong>Total Amount:</strong> ${'{{totalAmount}}'}</p>
        <div>{{items}}</div>
        <p>This quote is valid for 30 days.</p>
      `,
      inquiry: `
        <h2 style="color: #DC2626;">Thank You for Your Inquiry</h2>
        <p>Hi {{customerName}},</p>
        <p>We've received your inquiry about our {{serviceType}} services for {{eventDate}}.</p>
        <p>Your message:</p>
        <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #DC2626;">
          {{message}}
        </blockquote>
        <p>Our team will review your request and contact you within 24 hours.</p>
      `,
      thankyou: `
        <h2 style="color: #DC2626;">Thank You!</h2>
        <p>Dear {{customerName}},</p>
        <p>Thank you for choosing {{companyName}} for your {{serviceName}} on {{date}}.</p>
        <p>We hope you had a wonderful experience and look forward to serving you again!</p>
        <p>If you have any feedback, please don't hesitate to reach out.</p>
      `
    };

    return templates[type] || templates.thankyou;
  }

  // Log email
  private async logEmail(data: {
    recipient: string;
    subject: string;
    type: string;
    status: string;
    sentFrom: string;
  }): Promise<void> {
    try {
      await prisma.emailLog.create({
        data: {
          recipient: data.recipient,
          recipientEmail: data.recipient,
          type: data.type as any,
          subject: data.subject,
          body: '',
          status: data.status as any,
          sentAt: data.status === 'SENT' ? new Date() : undefined,
        },
      });
    } catch (error) {
      logger.error('Failed to log email:', error);
    }
  }

  // Check if service is configured
  public isConfigured(): boolean {
    return !!this.graphClient || !!this.msalClient;
  }

  // Check if authenticated
  public isAuthenticated(): boolean {
    return !!this.tokens && !!this.graphClient;
  }

  // Get authentication status
  public getAuthStatus(): {
    isConfigured: boolean;
    isAuthenticated: boolean;
    authenticatedEmail?: string;
    expiresAt?: Date;
  } {
    return {
      isConfigured: this.isConfigured(),
      isAuthenticated: this.isAuthenticated(),
      authenticatedEmail: this.tokens ? this.getDefaultEmailAccount().email : undefined,
      expiresAt: this.tokens?.expiresAt
    };
  }
}

// Export singleton instance
export const graphEmailService = new MicrosoftGraphEmailService();
