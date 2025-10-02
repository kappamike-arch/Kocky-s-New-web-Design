import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { renderEmailTemplate } from '../utils/email-template';
import { logger } from '../utils/logger';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';

// Get all email templates
export const getAllTemplates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' },
    });

    logger.info("email.templates.list", { userId: req.user?.id, count: templates?.length ?? 0 });

    res.json({
      success: true,
      templates: templates ?? [],
    });
  } catch (error) {
    next(error);
  }
};

// Get single template
export const getTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const templateId = Number(id);

    if (Number.isNaN(templateId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template id',
      });
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
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
    const { slug } = req.params;

    let template = await prisma.emailTemplate.findUnique({
      where: { slug },
    });

    if (!template) {
      const numericId = Number(slug);
      if (!Number.isNaN(numericId)) {
        template = await prisma.emailTemplate.findUnique({ where: { id: numericId } });
      }

      if (!template) {
        template = await prisma.emailTemplate.findFirst({ where: { name: slug } });
      }
    }

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
      id: rawId,
      name,
      slug,
      subject,
      html,
      text,
      variables,
      logoUrl,
      bannerUrl,
      body,
      sender,
      category,
    } = req.body;

    if (!name || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Name and subject are required',
      });
    }

    const contentHtml = html ?? body;

    if (!contentHtml) {
      return res.status(400).json({
        success: false,
        message: 'HTML content is required',
      });
    }

    const templateSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const data: any = {
      name,
      slug: templateSlug,
      subject,
      html: contentHtml,
      text: text ?? null,
      variables: variables ?? null,
      logoUrl: logoUrl ?? null,
      bannerUrl: bannerUrl ?? null,
      body: contentHtml,
      sender: sender ?? null,
      category: category ?? undefined,
    };

    let template;

    if (rawId !== undefined && rawId !== null && rawId !== '') {
      const templateId = Number(rawId);
      if (Number.isNaN(templateId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid template id',
        });
      }

      template = await prisma.emailTemplate.update({
        where: { id: templateId },
        data,
      });
    } else {
      template = await prisma.emailTemplate.upsert({
        where: { slug: templateSlug },
        update: data,
        create: data,
      });
    }

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
    const templateId = Number(id);

    if (Number.isNaN(templateId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template id',
      });
    }

    const {
      name,
      slug,
      subject,
      html,
      text,
      variables,
      logoUrl,
      bannerUrl,
      body,
      sender,
      category,
    } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) {
      data.slug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (subject !== undefined) data.subject = subject;

    const contentHtml = html ?? body;
    if (contentHtml !== undefined) {
      data.html = contentHtml;
      data.body = contentHtml;
    }

    if (text !== undefined) data.text = text;
    if (variables !== undefined) data.variables = variables;
    if (logoUrl !== undefined) data.logoUrl = logoUrl;
    if (bannerUrl !== undefined) data.bannerUrl = bannerUrl;
    if (sender !== undefined) data.sender = sender;
    if (category !== undefined) data.category = category;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update fields provided',
      });
    }

    const template = await prisma.emailTemplate.update({
      where: { id: templateId },
      data,
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
    const templateId = Number(id);

    if (Number.isNaN(templateId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template id',
      });
    }

    await prisma.emailTemplate.delete({
      where: { id: templateId },
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
    const templateId = Number(id);

    if (Number.isNaN(templateId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template id',
      });
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    const htmlTemplate = template.html ?? template.body ?? '';
    const renderedHtml = renderEmailTemplate(htmlTemplate, sampleData || {
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
        html: renderedHtml,
        text: template.text
          ? renderEmailTemplate(template.text, sampleData || {})
          : renderedHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
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
        name: 'Inquiry Confirmation',
        slug: 'inquiry-confirmation',
        subject: 'Thank you for contacting Kocky\'s Bar & Grill, {{customerName}}!',
        html: `
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
      Kocky's Bar & Grill | 123 Main Street, City | (555) 123-4567
      <br>
      © 2024 Kocky's Bar & Grill. All rights reserved.
    </div>
  </div>
</body>
</html>`,
        text: `Thank you for contacting Kocky's Bar & Grill!

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
        variables: { customerName: 'string', customerEmail: 'string', serviceName: 'string', eventDate: 'string', eventLocation: 'string', guestCount: 'number', confirmationCode: 'string' },
        logoUrl: '/api/uploads/logos/kockys-logo.png',
        bannerUrl: '/api/uploads/banners/inquiry-banner.jpg',
      },
      {
        name: 'Quote Sent',
        slug: 'quote-sent',
        subject: 'Your Quote #{{quoteNumber}} from Kocky\'s Bar & Grill',
        html: `
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
      <center>
        <a href="https://payment.kockys.com/pay/{{quoteNumber}}" class="button payment-button">Make Payment</a>
      </center>
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
      Kocky's Bar & Grill | 123 Main Street, City | (555) 123-4567
      <br>
      © 2024 Kocky's Bar & Grill. All rights reserved.
    </div>
  </div>
</body>
</html>`,
        text: `Your Quote from Kocky's Bar & Grill

Dear {{customerName}},

Thank you for considering Kocky's Bar & Grill. Here's your custom quote:

Quote #{{quoteNumber}}
Event Date: {{eventDate}}
Location: {{eventLocation}}
Guest Count: {{guestCount}}
TOTAL AMOUNT: {{totalAmount}}

Ready to book? Make your payment here:
https://payment.kockys.com/pay/{{quoteNumber}}

Best regards,
The Kocky's Bar & Grill Team`,
        variables: { customerName: 'string', serviceName: 'string', eventDate: 'string', eventLocation: 'string', guestCount: 'string', quoteNumber: 'string', totalAmount: 'string' },
        logoUrl: '/api/uploads/logos/kockys-logo.png',
        bannerUrl: '/api/uploads/banners/quote-banner.jpg',
      },
    ];

    const created = [];
    for (const template of defaultTemplates) {
      const existing = await prisma.emailTemplate.findUnique({
        where: { slug: template.slug },
      });

      if (!existing) {
        const newTemplate = await prisma.emailTemplate.create({
          data: {
            name: template.name,
            slug: template.slug,
            subject: template.subject,
            html: template.html,
            text: template.text,
            body: template.html,
            variables: template.variables,
            logoUrl: template.logoUrl,
            bannerUrl: template.bannerUrl,
          },
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

// Handlebars helpers
Handlebars.registerHelper("uppercase", (v: string) => (v || "").toUpperCase());
Handlebars.registerHelper("formatCurrency", (v: any) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v || 0))
);

// Template render util
function renderTemplate(html: string, variables: Record<string, any>) {
  const tpl = Handlebars.compile(html, { noEscape: false });
  return tpl(variables);
}

// Nodemailer transport
function mailer() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Preview template directly (returns rendered HTML)
export const previewTemplateDirect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { html, variables = {} } = req.body;
    const out = renderTemplate(html, variables);
    res.json({ success: true, html: out });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Send test email
export const sendTestEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { to, subject, html, variables = {} } = req.body;
    const output = renderTemplate(html, variables);
    const t = mailer();
    await t.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: output,
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};
