import { ConfidentialClientApplication } from "@azure/msal-node";
import { logger } from '../utils/logger';

interface AzureConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  fromEmail: string;
  fromName: string;
}

export class AzureMailerService {
  private cca: ConfidentialClientApplication | null = null;
  private config: AzureConfig | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Get Azure configuration from environment variables
      const clientId = process.env.AZURE_CLIENT_ID;
      const clientSecret = process.env.AZURE_CLIENT_SECRET;
      const tenantId = process.env.AZURE_TENANT_ID;
      const fromEmail = process.env.AZURE_FROM_EMAIL || 'info@kockys.com';
      const fromName = process.env.AZURE_FROM_NAME || "Kocky's Bar & Grill";

      if (!clientId || !clientSecret || !tenantId) {
        logger.warn('Azure email configuration incomplete. Missing required environment variables.');
        logger.info('Required: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID');
        return;
      }

      this.config = {
        clientId,
        clientSecret,
        tenantId,
        fromEmail,
        fromName
      };

      // Initialize MSAL ConfidentialClientApplication
      this.cca = new ConfidentialClientApplication({
        auth: {
          clientId: this.config.clientId,
          authority: `https://login.microsoftonline.com/${this.config.tenantId}`,
          clientSecret: this.config.clientSecret,
        },
      });

      logger.info('Azure Mailer Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Azure Mailer Service:', error);
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.cca) {
      throw new Error('Azure MSAL not initialized');
    }

    try {
      const tokenRequest = {
        scopes: ["https://graph.microsoft.com/.default"],
      };

      const response = await this.cca.acquireTokenByClientCredential(tokenRequest);
      
      if (!response?.accessToken) {
        throw new Error('Failed to acquire access token');
      }

      return response.accessToken;
    } catch (error) {
      logger.error('Failed to get Azure access token:', error);
      throw error;
    }
  }

  private async sendViaGraphAPI(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    if (!this.config) {
      throw new Error('Azure configuration not available');
    }

    try {
      const accessToken = await this.getAccessToken();

      // Create the email message for Microsoft Graph API
      const message = {
        message: {
          subject: subject,
          body: {
            contentType: "HTML",
            content: html
          },
          toRecipients: [
            {
              emailAddress: {
                address: to
              }
            }
          ]
        },
        saveToSentItems: true
      };

      // Send email via Microsoft Graph API
      const response = await fetch(`https://graph.microsoft.com/v1.0/users/${this.config.fromEmail}/sendMail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Microsoft Graph API error: ${response.status} ${response.statusText}`, errorText);
        return false;
      }

      logger.info(`Email sent successfully via Microsoft Graph API to ${to}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email via Microsoft Graph API:', error);
      return false;
    }
  }

  public async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    try {
      if (!this.config) {
        logger.warn('Azure email not configured, skipping email send');
        return false;
      }

      // Use Microsoft Graph API instead of Nodemailer
      return await this.sendViaGraphAPI(to, subject, html, text);
    } catch (error) {
      logger.error('Failed to send Azure email:', error);
      return false;
    }
  }

  public async sendTestEmail(to: string): Promise<boolean> {
    const subject = `🧪 Azure Email Test from ${this.config?.fromName || 'Kocky\'s Bar & Grill'}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0078d4;">Azure Email Service Test</h2>
        <p>This is a test email sent through Azure/Office 365 integration.</p>
        
        <div style="background-color: #f3f2f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Configuration Details:</h3>
          <ul>
            <li><strong>Service:</strong> Azure/Office 365</li>
            <li><strong>Authentication:</strong> OAuth2 with MSAL</li>
            <li><strong>From Email:</strong> ${this.config?.fromEmail}</li>
            <li><strong>From Name:</strong> ${this.config?.fromName}</li>
            <li><strong>Status:</strong> ✅ Working</li>
          </ul>
        </div>
        
        <p>If you received this email, your Azure email integration is working correctly!</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Test performed at: ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    return await this.sendEmail(to, subject, html);
  }

  public isConfigured(): boolean {
    return !!(this.config && this.cca);
  }

  public getConfig(): Partial<AzureConfig> | null {
    if (!this.config) return null;
    
    return {
      fromEmail: this.config.fromEmail,
      fromName: this.config.fromName,
      tenantId: this.config.tenantId,
      // Don't expose sensitive data
      clientId: this.config.clientId ? `${this.config.clientId.substring(0, 8)}...` : undefined,
      clientSecret: this.config.clientSecret ? '***' : undefined,
    };
  }
}

// Export singleton instance
export const azureMailerService = new AzureMailerService();
