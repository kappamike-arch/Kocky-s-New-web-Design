import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { graphEmailService } from '../services/MicrosoftGraphEmailService';
import { logger } from '../utils/logger';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const microsoftAppSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  tenantId: z.string().optional(),
});

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, 'Subject is required'),
  templateId: z.string().optional(),
  templateData: z.record(z.any()).optional(),
  htmlContent: z.string().optional(),
  fromEmail: z.string().email().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    content: z.string(),
    contentType: z.string()
  })).optional()
});

const emailAccountSchema = z.object({
  email: z.string().email(),
  displayName: z.string(),
  isDefault: z.boolean()
});

const templateUpdateSchema = z.object({
  subject: z.string().optional(),
  bodyHtml: z.string().optional(),
  headerHtml: z.string().optional(),
  footerHtml: z.string().optional(),
});

// Configure Microsoft App registration
export const configureMicrosoftApp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = microsoftAppSchema.parse(req.body);
    
    // Save to database
    const settings = await prisma.settings.findFirst();
    const emailSettings = (settings?.emailSettings as any) || {};
    
    emailSettings.microsoftClientId = validatedData.clientId;
    emailSettings.microsoftClientSecret = validatedData.clientSecret;
    emailSettings.microsoftTenantId = validatedData.tenantId || 'common';
    
    await prisma.settings.upsert({
      where: { id: settings?.id || 'default' },
      update: { emailSettings },
      create: {
        id: 'default',
        siteName: "Kocky's Bar & Grill",
        contactEmail: 'info@kockysbar.com',
        contactPhone: '(555) 123-4567',
        address: '123 Main Street',
        city: 'Your City',
        state: 'Your State',
        zipCode: '12345',
        country: 'USA',
        onlineOrderingUrl: 'https://www.kockysbar.com',
        emailSettings,
        businessHours: {},
        socialMedia: {},
        paymentSettings: {},
        reservationSettings: {}
      }
    });
    
    logger.info('Microsoft App configuration saved');
    res.json({
      success: true,
      message: 'Microsoft App configuration saved successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }
    logger.error('Error configuring Microsoft App:', error);
    next(error);
  }
};

// Get OAuth authorization URL
export const getAuthorizationUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUrl = await graphEmailService.getAuthorizationUrl();
    
    res.json({
      success: true,
      authUrl
    });
  } catch (error: any) {
    logger.error('Error getting authorization URL:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate authorization URL'
    });
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, error: authError, error_description } = req.query;
    
    if (authError) {
      logger.error('OAuth error:', authError, error_description);
      return res.redirect(`${process.env.ADMIN_URL}/email-settings?error=${encodeURIComponent(error_description as string || 'Authentication failed')}`);
    }
    
    if (!code) {
      return res.redirect(`${process.env.ADMIN_URL}/email-settings?error=${encodeURIComponent('No authorization code received')}`);
    }
    
    const success = await graphEmailService.handleOAuthCallback(code as string);
    
    if (success) {
      res.redirect(`${process.env.ADMIN_URL}/email-settings?success=true&message=${encodeURIComponent('Email authentication successful!')}`);
    } else {
      res.redirect(`${process.env.ADMIN_URL}/email-settings?error=${encodeURIComponent('Failed to complete authentication')}`);
    }
  } catch (error: any) {
    logger.error('OAuth callback error:', error);
    res.redirect(`${process.env.ADMIN_URL}/email-settings?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
  }
};

// Get authentication status
export const getAuthStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = graphEmailService.getAuthStatus();
    const settings = await prisma.settings.findFirst();
    const emailSettings = (settings?.emailSettings as any) || {};
    
    res.json({
      success: true,
      data: {
        ...status,
        hasClientCredentials: !!(emailSettings.microsoftClientId && emailSettings.microsoftClientSecret),
        clientId: emailSettings.microsoftClientId ? emailSettings.microsoftClientId.substring(0, 8) + '...' : null,
        emailAccounts: graphEmailService.getEmailAccounts()
      }
    });
  } catch (error) {
    logger.error('Error getting auth status:', error);
    next(error);
  }
};

// Get email accounts
export const getEmailAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = graphEmailService.getEmailAccounts();
    
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    logger.error('Error getting email accounts:', error);
    next(error);
  }
};

// Update email accounts
export const updateEmailAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = z.array(emailAccountSchema).parse(req.body.accounts);
    
    // Ensure only one default account
    const defaultAccounts = accounts.filter(acc => acc.isDefault);
    if (defaultAccounts.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Exactly one account must be set as default'
      });
    }
    
    await graphEmailService.setEmailAccounts(accounts);
    
    res.json({
      success: true,
      message: 'Email accounts updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }
    logger.error('Error updating email accounts:', error);
    next(error);
  }
};

// Get email templates
export const getEmailTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await graphEmailService.getEmailTemplates();
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error getting email templates:', error);
    next(error);
  }
};

// Update email template
export const updateEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateId } = req.params;
    const updates = templateUpdateSchema.parse(req.body);
    
    await graphEmailService.updateEmailTemplate(templateId, updates);
    
    res.json({
      success: true,
      message: 'Template updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }
    logger.error('Error updating email template:', error);
    next(error);
  }
};

// Send email
export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = sendEmailSchema.parse(req.body);
    
    let htmlContent = validatedData.htmlContent || '';
    
    // If template is specified, load and process it
    if (validatedData.templateId) {
      const templates = await graphEmailService.getEmailTemplates();
      const template = templates.find(t => t.id === validatedData.templateId);
      
      if (!template) {
        return res.status(400).json({
          success: false,
          message: 'Template not found'
        });
      }
      
      // Replace template variables
      htmlContent = template.bodyHtml;
      let subject = template.subject;
      
      if (validatedData.templateData) {
        Object.entries(validatedData.templateData).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          htmlContent = htmlContent.replace(regex, String(value));
          subject = subject.replace(regex, String(value));
        });
        
        // Update subject if template variables were replaced
        if (!validatedData.subject) {
          validatedData.subject = subject;
        }
      }
    }
    
    const success = await graphEmailService.sendEmail(
      validatedData.to,
      validatedData.subject,
      htmlContent,
      validatedData.fromEmail,
      validatedData.attachments
    );
    
    if (success) {
      res.json({
        success: true,
        message: 'Email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }
    logger.error('Error sending email:', error);
    next(error);
  }
};

// Send test email
export const sendTestEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { toEmail, fromEmail } = req.body;
    
    if (!toEmail || !z.string().email().safeParse(toEmail).success) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address required'
      });
    }
    
    const testContent = `
      <h2 style="color: #DC2626;">Test Email Successful!</h2>
      <p>This is a test email from your Kocky's Bar & Grill email system.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Configuration Status:</h3>
        <ul style="color: #555;">
          <li><strong>Authentication:</strong> ${graphEmailService.isAuthenticated() ? '✅ Connected' : '❌ Not Connected'}</li>
          <li><strong>From Email:</strong> ${fromEmail || graphEmailService.getEmailAccounts()[0].email}</li>
          <li><strong>Sent Via:</strong> ${graphEmailService.isAuthenticated() ? 'Microsoft Graph API' : 'SMTP Fallback'}</li>
          <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
      </div>
      <p>If you received this email, your configuration is working correctly!</p>
    `;
    
    const success = await graphEmailService.sendEmail(
      toEmail,
      '🧪 Test Email from Kocky\'s Bar & Grill',
      testContent,
      fromEmail
    );
    
    if (success) {
      res.json({
        success: true,
        message: `Test email sent successfully to ${toEmail}. Please check your inbox (and spam folder).`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email. Please check your configuration.'
      });
    }
  } catch (error: any) {
    logger.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send test email'
    });
  }
};
