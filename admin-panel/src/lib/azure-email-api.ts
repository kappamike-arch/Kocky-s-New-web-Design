import { apiJson } from './api';

// Azure Email API Types
export interface AzureEmailStatus {
  providers: {
    azure: boolean;
    smtp: boolean;
    preferred: 'smtp' | 'azure' | 'auto';
  };
  azure: {
    configured: boolean;
    config?: {
      fromEmail?: string;
      fromName?: string;
      tenantId?: string;
      clientId?: string;
      clientSecret?: string;
    };
  };
  environment: {
    azureClientId: string;
    azureTenantId: string;
    azureClientSecret: string;
    smtpHost: string;
    smtpUser: string;
  };
}

export interface TestEmailRequest {
  toEmail: string;
  provider?: 'smtp' | 'azure' | 'auto';
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  provider?: 'smtp' | 'azure' | 'auto';
}

export interface EmailProviderRequest {
  provider: 'smtp' | 'azure' | 'auto';
}

// Azure Email API Functions
export async function getAzureEmailStatus(): Promise<{ success: boolean; data: AzureEmailStatus }> {
  try {
    const response = await apiJson<{ success: boolean; data: AzureEmailStatus }>('/azure-email/status');
    return response;
  } catch (error) {
    console.error('Error fetching Azure email status:', error);
    throw error;
  }
}

export async function getAzureEmailConfig(): Promise<{ success: boolean; data: any }> {
  try {
    const response = await apiJson<{ success: boolean; data: any }>('/azure-email/config');
    return response;
  } catch (error) {
    console.error('Error fetching Azure email config:', error);
    throw error;
  }
}

export async function testAzureEmail(request: TestEmailRequest): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await apiJson<{ success: boolean; message: string; data?: any }>('/azure-email/test', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return response;
  } catch (error) {
    console.error('Error testing Azure email:', error);
    throw error;
  }
}

export async function setEmailProvider(request: EmailProviderRequest): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await apiJson<{ success: boolean; message: string; data?: any }>('/azure-email/provider', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return response;
  } catch (error) {
    console.error('Error setting email provider:', error);
    throw error;
  }
}

export async function sendEmail(request: SendEmailRequest): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await apiJson<{ success: boolean; message: string; data?: any }>('/azure-email/send', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

