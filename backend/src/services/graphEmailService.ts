import axios from 'axios';
import { logger } from '../utils/logger';
import { azureOAuthService } from './azureOAuthService';

interface GraphEmailMessage {
  message: {
    subject: string;
    body: {
      contentType: 'Text' | 'HTML';
      content: string;
    };
    toRecipients: Array<{
      emailAddress: {
        address: string;
        name?: string;
      };
    }>;
    from?: {
      emailAddress: {
        address: string;
        name?: string;
      };
    };
  };
  saveToSentItems?: boolean;
}

export class GraphEmailService {
  private static instance: GraphEmailService;

  private constructor() {}

  public static getInstance(): GraphEmailService {
    if (!GraphEmailService.instance) {
      GraphEmailService.instance = new GraphEmailService();
    }
    return GraphEmailService.instance;
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
      
      // Prepare the email message for Microsoft Graph API
      const emailMessage: GraphEmailMessage = {
        message: {
          subject: options.subject,
          body: {
            contentType: 'HTML',
            content: options.html,
          },
          toRecipients: [
            {
              emailAddress: {
                address: options.to,
                name: options.to.split('@')[0], // Use email prefix as name
              },
            },
          ],
          from: {
            emailAddress: {
              address: 'info@kockys.com',
              name: "Kocky's Bar & Grill",
            },
          },
        },
        saveToSentItems: true,
      };

      // Send email via Microsoft Graph API
      const graphUrl = 'https://graph.microsoft.com/v1.0/users/info@kockys.com/sendMail';
      
      const response = await axios.post(graphUrl, emailMessage, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 202) {
        logger.info(`Graph API email sent successfully to ${options.to}`);
        return true;
      } else {
        logger.error(`Graph API email failed with status: ${response.status}`);
        return false;
      }

    } catch (error) {
      logger.error('Failed to send email via Graph API:', error);
      if (axios.isAxiosError(error)) {
        logger.error('Graph API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      }
      return false;
    }
  }
}

export const graphEmailService = GraphEmailService.getInstance();

