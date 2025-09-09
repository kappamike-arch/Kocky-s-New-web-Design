import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { renderEmailTemplate } from '../utils/email-template';

// Get all email templates
export const getAllTemplates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      templates,
    });
  } catch (error) {
    next(error);
  }
};

// Get single template
export const getTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    res.json({
      success: true,
      template,
    });
  } catch (error) {
    next(error);
  }
};

// Get template by name
export const getTemplateByName = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;

    const template = await prisma.emailTemplate.findUnique({
      where: { name },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    res.json({
      success: true,
      template,
    });
  } catch (error) {
    next(error);
  }
};

// Create or update template
export const upsertTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      name, 
      subject, 
      htmlContent, 
      textContent, 
      variables, 
      logoUrl, 
      footerText, 
      paymentLink 
    } = req.body;

    const template = await prisma.emailTemplate.upsert({
      where: { name },
      update: {
        subject,
        htmlContent,
        textContent,
        variables,
        logoUrl,
        footerText,
        paymentLink,
      },
      create: {
        name,
        subject,
        htmlContent,
        textContent,
        variables: variables || [],
        logoUrl,
        footerText,
        paymentLink,
      },
    });

    res.json({
      success: true,
      message: 'Template saved successfully',
      template,
    });
  } catch (error) {
    next(error);
  }
};

// Update template
export const updateTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Template updated successfully',
      template,
    });
  } catch (error) {
    next(error);
  }
};

// Delete template
export const deleteTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.emailTemplate.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Preview template with sample data
export const previewTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { sampleData } = req.body;

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Render template with sample data
    const rendered = renderEmailTemplate(template.htmlContent, sampleData || {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      serviceName: 'Mobile Bar Service',
      eventDate: new Date().toLocaleDateString(),
      eventLocation: '123 Main Street, City',
      guestCount: '100',
      confirmationCode: 'ABC123',
      quoteNumber: 'Q-2024-0001',
      totalAmount: '$2,500',
      paymentLink: 'https://payment.example.com/pay/ABC123',
    });

    res.json({
      success: true,
      preview: {
        subject: renderEmailTemplate(template.subject, sampleData || { customerName: 'John Doe' }),
        html: rendered,
        text: template.textContent ? renderEmailTemplate(template.textContent, sampleData || {}) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Initialize default templates
export const initializeDefaultTemplates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const defaultTemplates = [
      {
        name: 'inquiry_confirmation',
        subject: 'Thank you for contacting Kocky\'s Bar & Grill, {{customerName}}!',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
    .logo { max-width: 200px; margin-bottom: 10px; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #d4af37; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      {{#if logoUrl}}<img src="{{logoUrl}}" alt="Kocky's Bar & Grill" class="logo">{{/if}}
      <h1>Thank You for Your Inquiry!</h1>
    </div>
    <div class="content">
      <p>Dear {{customerName}},</p>
      <p>We've received your inquiry for <strong>{{serviceName}}</strong> and are excited to help make your event special!</p>
      
      <h3>Your Inquiry Details:</h3>
      <ul>
        <li><strong>Service:</strong> {{serviceName}}</li>
        {{#if eventDate}}<li><strong>Event Date:</strong> {{eventDate}}</li>{{/if}}
        {{#if eventLocation}}<li><strong>Location:</strong> {{eventLocation}}</li>{{/if}}
        {{#if guestCount}}<li><strong>Expected Guests:</strong> {{guestCount}}</li>{{/if}}
        {{#if confirmationCode}}<li><strong>Confirmation Code:</strong> {{confirmationCode}}</li>{{/if}}
      </ul>
      
      <p>Our team will review your request and contact you within 24 hours with more information and pricing.</p>
      
      <p>If you have any immediate questions, feel free to reach out:</p>
      <ul>
        <li>📞 Phone: (555) 123-4567</li>
        <li>✉️ Email: info@kockys.com</li>
      </ul>
      
      <p>We look forward to serving you!</p>
      
      <p>Best regards,<br>
      The Kocky's Bar & Grill Team</p>
    </div>
    <div class="footer">
      {{footerText}}
      <br>
      © 2024 Kocky's Bar & Grill. All rights reserved.
    </div>
  </div>
</body>
</html>`,
        textContent: `Thank you for contacting Kocky's Bar & Grill!

Dear {{customerName}},

We've received your inquiry for {{serviceName}} and are excited to help make your event special!

Your Inquiry Details:
- Service: {{serviceName}}
- Event Date: {{eventDate}}
- Location: {{eventLocation}}
- Expected Guests: {{guestCount}}
- Confirmation Code: {{confirmationCode}}

Our team will review your request and contact you within 24 hours.

Best regards,
The Kocky's Bar & Grill Team`,
        variables: ['customerName', 'customerEmail', 'serviceName', 'eventDate', 'eventLocation', 'guestCount', 'confirmationCode'],
        logoUrl: '/api/uploads/logos/kockys-logo.png',
        footerText: 'Kocky\'s Bar & Grill | 123 Main Street, City | (555) 123-4567',
      },
      {
        name: 'quote_sent',
        subject: 'Your Quote #{{quoteNumber}} from Kocky\'s Bar & Grill',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
    .logo { max-width: 200px; margin-bottom: 10px; }
    .content { padding: 20px; background: #f9f9f9; }
    .quote-box { background: white; padding: 15px; border: 1px solid #ddd; margin: 15px 0; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #d4af37; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .payment-button { background: #28a745; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      {{#if logoUrl}}<img src="{{logoUrl}}" alt="Kocky's Bar & Grill" class="logo">{{/if}}
      <h1>Your Custom Quote</h1>
    </div>
    <div class="content">
      <p>Dear {{customerName}},</p>
      <p>Thank you for considering Kocky's Bar & Grill for your {{serviceName}} needs. We're pleased to provide you with the following quote:</p>
      
      <div class="quote-box">
        <h3>Quote #{{quoteNumber}}</h3>
        <p><strong>Service:</strong> {{serviceName}}</p>
        <p><strong>Event Date:</strong> {{eventDate}}</p>
        <p><strong>Total Amount:</strong> {{totalAmount}}</p>
      </div>
      
      <p>This quote is valid for 30 days. To accept this quote and secure your booking:</p>
      
      {{#if paymentLink}}
      <center>
        <a href="{{paymentLink}}" class="button payment-button">Make Payment</a>
      </center>
      {{/if}}
      
      <p>Or contact us directly:</p>
      <ul>
        <li>📞 Phone: (555) 123-4567</li>
        <li>✉️ Email: info@kockys.com</li>
      </ul>
      
      <p>We look forward to serving you!</p>
      
      <p>Best regards,<br>
      The Kocky's Bar & Grill Team</p>
    </div>
    <div class="footer">
      {{footerText}}
      <br>
      © 2024 Kocky's Bar & Grill. All rights reserved.
    </div>
  </div>
</body>
</html>`,
        textContent: null,
        variables: ['customerName', 'serviceName', 'eventDate', 'quoteNumber', 'totalAmount', 'paymentLink'],
        logoUrl: '/api/uploads/logos/kockys-logo.png',
        footerText: 'Kocky\'s Bar & Grill | 123 Main Street, City | (555) 123-4567',
        paymentLink: 'https://payment.kockys.com/pay/{{quoteNumber}}',
      },
    ];

    // Create default templates
    const created = [];
    for (const template of defaultTemplates) {
      const existing = await prisma.emailTemplate.findUnique({
        where: { name: template.name },
      });

      if (!existing) {
        const newTemplate = await prisma.emailTemplate.create({
          data: template,
        });
        created.push(newTemplate);
      }
    }

    res.json({
      success: true,
      message: `Initialized ${created.length} default templates`,
      templates: created,
    });
  } catch (error) {
    next(error);
  }
};
