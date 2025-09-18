import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { unifiedEmailService } from '../services/UnifiedEmailService';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Validation schemas
const azureConfigSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  fromEmail: z.string().email('Invalid email address').optional(),
  fromName: z.string().min(1, 'From name is required').optional(),
});

const testEmailSchema = z.object({
  toEmail: z.string().email('Invalid email address'),
  provider: z.enum(['smtp', 'azure', 'auto']).optional(),
});

// Get Azure email configuration status
export const getAzureEmailStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = unifiedEmailService.getProviderStatus();
    const azureConfig = unifiedEmailService.getAzureConfig();

    res.json({
      success: true,
      data: {
        providers: status,
        azure: {
          configured: status.azure,
          config: azureConfig
        },
        environment: {
          azureClientId: process.env.AZURE_CLIENT_ID ? '***configured***' : 'not set',
          azureTenantId: process.env.AZURE_TENANT_ID ? '***configured***' : 'not set',
          azureClientSecret: process.env.AZURE_CLIENT_SECRET ? '***configured***' : 'not set',
          smtpHost: process.env.SMTP_HOST ? '***configured***' : 'not set',
          smtpUser: process.env.SMTP_USER ? '***configured***' : 'not set',
        }
      }
    });
  } catch (error) {
    logger.error('Error getting Azure email status:', error);
    next(error);
  }
};

// Test Azure email service
export const testAzureEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { toEmail, provider } = testEmailSchema.parse(req.body);

    logger.info('Testing email service', { toEmail, provider });

    const result = await unifiedEmailService.sendTestEmail(toEmail, provider);

    if (result) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          toEmail,
          provider: provider || 'auto',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: 'Email service returned false'
      });
    }
  } catch (error) {
    logger.error('Error testing Azure email:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    } else {
      next(error);
    }
  }
};

// Get Azure email configuration (without sensitive data)
export const getAzureEmailConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const config = unifiedEmailService.getAzureConfig();
    const status = unifiedEmailService.getProviderStatus();

    res.json({
      success: true,
      data: {
        configured: status.azure,
        config: config,
        environment: {
          hasClientId: !!process.env.AZURE_CLIENT_ID,
          hasClientSecret: !!process.env.AZURE_CLIENT_SECRET,
          hasTenantId: !!process.env.AZURE_TENANT_ID,
          fromEmail: process.env.AZURE_FROM_EMAIL || 'info@kockys.com',
          fromName: process.env.AZURE_FROM_NAME || "Kocky's Bar & Grill",
        }
      }
    });
  } catch (error) {
    logger.error('Error getting Azure email config:', error);
    next(error);
  }
};

// Set preferred email provider
export const setEmailProvider = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { provider } = z.object({
      provider: z.enum(['smtp', 'azure', 'auto'])
    }).parse(req.body);

    unifiedEmailService.setPreferredProvider(provider);

    res.json({
      success: true,
      message: `Email provider set to: ${provider}`,
      data: {
        provider,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error setting email provider:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    } else {
      next(error);
    }
  }
};

// Send email via specific provider
export const sendEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { to, subject, html, text, provider } = z.object({
      to: z.string().email('Invalid email address'),
      subject: z.string().min(1, 'Subject is required'),
      html: z.string().min(1, 'HTML content is required'),
      text: z.string().optional(),
      provider: z.enum(['smtp', 'azure', 'auto']).optional(),
    }).parse(req.body);

    logger.info('Sending email via API', { to, subject, provider });

    const result = await unifiedEmailService.sendEmail({
      to,
      subject,
      html,
      text,
      provider
    });

    if (result) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        data: {
          to,
          subject,
          provider: provider || 'auto',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: 'Email service returned false'
      });
    }
  } catch (error) {
    logger.error('Error sending email:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    } else {
      next(error);
    }
  }
};
