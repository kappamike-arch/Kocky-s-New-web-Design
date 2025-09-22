import axios from 'axios';
import { logger } from '../utils/logger';

/**
 * Office 365 OAuth2 Authentication Service
 * 
 * Handles token acquisition, caching, and refresh for Microsoft Graph API
 */

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

class O365AuthService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly tenantId: string;
  private readonly tokenEndpoint: string;

  constructor() {
    this.clientId = process.env.O365_CLIENT_ID || '';
    this.clientSecret = process.env.O365_CLIENT_SECRET || '';
    this.tenantId = process.env.O365_TENANT_ID || '';
    this.tokenEndpoint = process.env.OAUTH_TOKEN_ENDPOINT || 
      `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;

    if (!this.clientId || !this.clientSecret || !this.tenantId) {
      logger.error('Office 365 credentials not properly configured');
      throw new Error('Office 365 credentials missing. Please check O365_CLIENT_ID, O365_CLIENT_SECRET, and O365_TENANT_ID in .env');
    }
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
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.tenantId);
  }

  /**
   * Get token expiry information
   */
  getTokenInfo(): { hasToken: boolean; expiresIn: number; isExpired: boolean } {
    const hasToken = !!this.accessToken;
    const expiresIn = this.tokenExpiry - Date.now();
    const isExpired = hasToken && expiresIn <= 0;

    return {
      hasToken,
      expiresIn: Math.max(0, expiresIn),
      isExpired,
    };
  }

  /**
   * Clear the current token (force refresh on next request)
   */
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
    logger.info('Office 365 access token cleared');
  }
}

// Export singleton instance
export const o365AuthService = new O365AuthService();
export default o365AuthService;