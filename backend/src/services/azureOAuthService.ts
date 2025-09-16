import axios from 'axios';
import { logger } from '../utils/logger';

interface AzureTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export class AzureOAuthService {
  private static instance: AzureOAuthService;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private constructor() {}

  public static getInstance(): AzureOAuthService {
    if (!AzureOAuthService.instance) {
      AzureOAuthService.instance = new AzureOAuthService();
    }
    return AzureOAuthService.instance;
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const clientId = '46b54378-7023-4746-845f-514f2fc40f8a';
      const clientSecret = '2je8Q~mXwctPuMo4qxsinNmvlajkFQOZEinkWby.';
      const tenantId = '8eb62d31-a2c3-4af1-a6ac-da1ed966dd14';

      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('scope', 'https://graph.microsoft.com/.default');
      params.append('grant_type', 'client_credentials');

      const response = await axios.post<AzureTokenResponse>(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000); // 5 minutes buffer

      logger.info('Azure OAuth2 access token obtained successfully');
      return this.accessToken;

    } catch (error) {
      logger.error('Failed to get Azure OAuth2 access token:', error);
      throw error;
    }
  }

  public async getValidAccessToken(): Promise<string> {
    return await this.getAccessToken();
  }
}

export const azureOAuthService = AzureOAuthService.getInstance();
