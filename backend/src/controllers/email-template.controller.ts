import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { renderEmailTemplate } from '../utils/email-template';

// Get all email templates
export const getAllTemplates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    
    const whereClause = category ? { category: category as string } : {};
    
    const templates = await prisma.emailTemplate.findMany({
      where: whereClause,
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
      where: { id: parseInt(id) },
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

    const template = await prisma.emailTemplate.findFirst({
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
      category,
      subject, 
      body,
      sender
    } = req.body;

    // Check if template exists by name
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: { name },
    });

    let template;
    if (existingTemplate) {
      // Update existing template
      template = await prisma.emailTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          category: category || "general",
          subject,
          body,
          sender,
        },
      });
    } else {
      // Create new template
      template = await prisma.emailTemplate.create({
        data: {
          name,
          category: category || "general",
          subject,
          body,
          sender,
        },
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
    const updateData = req.body;

    const template = await prisma.emailTemplate.update({
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Render template with sample data
    const rendered = renderEmailTemplate(template.body, sampleData || {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      serviceName: 'Mobile Bar Service',
      eventDate: new Date().toLocaleDateString(),
      eventLocation: '123 Main Street, City',
      guestCount: '100',
      confirmationCode: 'ABC123',
      quoteNumber: 'Q-2024-0001',
      totalAmount: '$2,500',
    });

    res.json({
      success: true,
      preview: {
        subject: renderEmailTemplate(template.subject, sampleData || { customerName: 'John Doe' }),
        html: rendered,
        text: rendered, // Use body for both html and text in simplified schema
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
        category: 'inquiry',
        subject: 'Thank you for contacting Kocky\'s Bar & Grill, {{customerName}}!',
        body: `Dear {{customerName}},

Thank you for your inquiry about {{serviceName}}. We have received your request and will contact you within 24 hours.

Your confirmation code is: {{confirmationCode}}

Best regards,
Kocky's Bar & Grill Team`,
        sender: 'Kocky\'s Bar & Grill',
      },
      {
        name: 'quote_sent',
        category: 'quote',
        subject: 'Your Quote #{{quoteNumber}} from Kocky\'s Bar & Grill',
        body: `Dear {{customerName}},

Thank you for your interest in our services. Please find your quote #{{quoteNumber}} attached.

Total Amount: {{totalAmount}}

Please review and let us know if you have any questions.

Best regards,
Kocky's Bar & Grill Team`,
        sender: 'Kocky\'s Bar & Grill',
      },
      {
        name: 'mobile_bar_booking',
        category: 'mobileBar',
        subject: 'Mobile Bar Booking Confirmation - {{customerName}}',
        body: `Dear {{customerName}},

Your mobile bar booking has been confirmed for {{eventDate}} at {{eventTime}}.

Event Details:
- Date: {{eventDate}}
- Time: {{eventTime}}
- Location: {{eventLocation}}
- Guest Count: {{guestCount}}

We look forward to serving you!

Best regards,
Kocky's Bar & Grill Team`,
        sender: 'Kocky\'s Bar & Grill',
      }
    ];

    const createdTemplates = [];
    
    for (const templateData of defaultTemplates) {
      // Check if template exists by name
      const existingTemplate = await prisma.emailTemplate.findFirst({
        where: { name: templateData.name },
      });

      let template;
      if (existingTemplate) {
        // Update existing template
        template = await prisma.emailTemplate.update({
          where: { id: existingTemplate.id },
          data: templateData,
        });
      } else {
        // Create new template
        template = await prisma.emailTemplate.create({
          data: templateData,
        });
      }
      createdTemplates.push(template);
    }

    res.json({
      success: true,
      message: 'Default templates initialized successfully',
      templates: createdTemplates,
    });
  } catch (error) {
    next(error);
  }
};

// Get template for studio (simplified version)
export const getTemplateStudio = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { templateId } = req.params;

    // Try to find template by name first, then by ID
    let template = await prisma.emailTemplate.findFirst({
      where: { name: templateId },
    });

    if (!template) {
      // If not found by name, try by ID
      const id = parseInt(templateId);
      if (!isNaN(id)) {
        template = await prisma.emailTemplate.findUnique({
          where: { id },
        });
      }
    }

    if (!template) {
      // Return default template structure
      return res.json({
        brand: {
          subject: 'Email Template',
          senderName: 'Kocky\'s Bar & Grill',
          senderEmail: 'info@kockys.com',
          footer: 'Kocky\'s Bar & Grill · 123 Main St, Fresno CA',
          logo: '',
          banner: ''
        },
        theme: {
          accent: '#4f46e5',
          text: '#111827',
          bg: '#ffffff'
        },
        sections: [
          { type: 'heading', text: 'Hello {{customerName}}!' },
          { type: 'text', text: 'Thank you for your interest in our services.' },
          { type: 'cta', label: 'Learn More', href: 'https://kockys.com', color: '#4f46e5' }
        ]
      });
    }

    // Convert simple template to studio format
    res.json({
      brand: {
        subject: template.subject,
        senderName: template.sender || 'Kocky\'s Bar & Grill',
        senderEmail: 'info@kockys.com',
        footer: 'Kocky\'s Bar & Grill · 123 Main St, Fresno CA',
        logo: '',
        banner: ''
      },
      theme: {
        accent: '#4f46e5',
        text: '#111827',
        bg: '#ffffff'
      },
      sections: [
        { type: 'text', text: template.body }
      ]
    });
  } catch (error) {
    next(error);
  }
};

// Save template from studio (simplified version)
export const saveTemplateStudioData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { templateId } = req.params;
    const templateData = req.body;
    const { brand, sections, theme, category } = templateData;

    // Generate simple body from sections
    let body = '';
    sections.forEach((section: any) => {
      if (section.type === 'text') {
        body += section.text + '\n\n';
      } else if (section.type === 'heading') {
        body += section.text + '\n\n';
      }
    });

    const templateName = templateId;

    // Check if template exists by name
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: { name: templateName },
    });

    let template;
    if (existingTemplate) {
      // Update existing template
      template = await prisma.emailTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          category: category || templateId,
          subject: brand.subject || 'Email Template',
          body,
          sender: brand.senderName || 'Kocky\'s Bar & Grill',
        },
      });
    } else {
      // Create new template
      template = await prisma.emailTemplate.create({
        data: {
          name: templateName,
          category: category || templateId,
          subject: brand.subject || 'Email Template',
          body,
          sender: brand.senderName || 'Kocky\'s Bar & Grill',
        },
      });
    }
    
    console.log(`Template ${templateName} saved successfully with ID: ${template.id}`);
    
    res.json({ 
      success: true, 
      message: 'Template saved successfully',
      templateId,
      templateName,
      template 
    });
  } catch (error) {
    console.error('Error saving template studio data:', error);
    res.status(500).json({ error: 'Failed to save template' });
  }
};