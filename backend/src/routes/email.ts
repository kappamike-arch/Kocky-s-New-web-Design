import express from 'express';
import { UPLOADS_URL } from '@/lib/config';
import multer from 'multer';
import { UPLOADS_URL } from '@/lib/config';
import { PrismaClient } from '@prisma/client';
import { UPLOADS_URL } from '@/lib/config';
import { mailer } from '../lib/mailer';
import { UPLOADS_URL } from '@/lib/config';
import { compileMJML, replaceTemplateVariables, generateUnsubscribeFooter } from '../lib/mjml';
import { UPLOADS_URL } from '@/lib/config';
import { authenticate } from '../middleware/auth';
import { UPLOADS_URL } from '@/lib/config';
// import pLimit from 'p-limit'; // Temporarily disabled due to ES module issues
import { UPLOADS_URL } from '@/lib/config';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for CSV uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Rate limiting for sending - temporarily disabled
// const sendingLimit = pLimit(parseInt(process.env.SENDING_RATE_PER_SEC || '50'));

// ===== CONTACTS ROUTES =====

// Import contacts from CSV
router.post('/contacts/import', authenticate, upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const contact: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'email':
            contact.email = value;
            break;
          case 'firstname':
          case 'first_name':
            contact.firstName = value;
            break;
          case 'lastname':
          case 'last_name':
            contact.lastName = value;
            break;
          case 'phone':
            contact.phone = value;
            break;
          case 'tags':
            contact.tags = value ? JSON.parse(value) : [];
            break;
          case 'consent_email':
            contact.consentEmail = value.toLowerCase() === 'true';
            break;
          case 'consent_sms':
            contact.consentSms = value.toLowerCase() === 'true';
            break;
        }
      });
      
      if (contact.email) {
        contacts.push(contact);
      }
    }

    // Upsert contacts
    const results = [];
    for (const contact of contacts) {
      try {
        const result = await prisma.emailContact.upsert({
          where: { email: contact.email },
          update: contact,
          create: contact
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to import contact ${contact.email}:`, error);
      }
    }

    res.json({ 
      success: true, 
      imported: results.length,
      total: contacts.length 
    });
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({ error: 'Failed to import contacts' });
  }
});

// Get contacts with pagination and filtering
router.get('/contacts', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const tag = req.query.tag as string;
    const consentEmail = req.query.consentEmail as string;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (tag) {
      where.tags = { array_contains: tag };
    }
    
    if (consentEmail !== undefined) {
      where.consentEmail = consentEmail === 'true';
    }

    const [contacts, total] = await Promise.all([
      prisma.emailContact.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.emailContact.count({ where })
    ]);

    res.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Create single contact (admin)
router.post('/contacts', authenticate, async (req, res) => {
  try {
    const contact = await prisma.emailContact.create({
      data: req.body
    });
    res.json(contact);
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Public contact creation (for frontend signup)
router.post('/contacts/public', async (req, res) => {
  try {
    const { email, firstName, lastName, phone, tags, consentEmail, consentSms } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const contact = await prisma.emailContact.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        phone,
        tags: tags || ['newsletter'],
        consentEmail: consentEmail !== false,
        consentSms: consentSms || false
      },
      create: {
        email,
        firstName,
        lastName,
        phone,
        tags: tags || ['newsletter'],
        consentEmail: consentEmail !== false,
        consentSms: consentSms || false
      }
    });

    res.json(contact);
  } catch (error) {
    console.error('Create public contact error:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.put('/contacts/:id', authenticate, async (req, res) => {
  try {
    const contact = await prisma.emailContact.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/contacts/:id', authenticate, async (req, res) => {
  try {
    await prisma.emailContact.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Export contacts to CSV
router.get('/contacts/export.csv', authenticate, async (req, res) => {
  try {
    const contacts = await prisma.emailContact.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const csvHeaders = 'Email,First Name,Last Name,Phone,Tags,Consent Email,Consent SMS,Created At\n';
    const csvRows = contacts.map(contact => 
      `${contact.email},${contact.firstName || ''},${contact.lastName || ''},${contact.phone || ''},"${JSON.stringify(contact.tags)}",${contact.consentEmail},${contact.consentSms},${contact.createdAt.toISOString()}\n`
    ).join('');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csvHeaders + csvRows);
  } catch (error) {
    console.error('Export contacts error:', error);
    res.status(500).json({ error: 'Failed to export contacts' });
  }
});

// ===== TEMPLATES ROUTES =====

// Get templates
router.get('/templates', authenticate, async (req, res) => {
  try {
    const templates = await prisma.emailMarketingTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create template
router.post('/templates', authenticate, async (req, res) => {
  try {
    const { name, slug, mjml } = req.body;
    
    // Compile MJML to HTML
    const compiled = compileMJML(mjml);
    if (compiled.errors.length > 0) {
      return res.status(400).json({ 
        error: 'MJML compilation failed', 
        errors: compiled.errors 
      });
    }

    const template = await prisma.emailMarketingTemplate.create({
      data: {
        name,
        slug,
        mjml,
        html: compiled.html
      }
    });

    res.json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.put('/templates/:id', authenticate, async (req, res) => {
  try {
    const { name, slug, mjml } = req.body;
    
    // Compile MJML to HTML
    const compiled = compileMJML(mjml);
    if (compiled.errors.length > 0) {
      return res.status(400).json({ 
        error: 'MJML compilation failed', 
        errors: compiled.errors 
      });
    }

    const template = await prisma.emailMarketingTemplate.update({
      where: { id: req.params.id },
      data: {
        name,
        slug,
        mjml,
        html: compiled.html
      }
    });

    res.json(template);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/templates/:id', authenticate, async (req, res) => {
  try {
    await prisma.emailMarketingTemplate.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Seed templates
router.post('/templates/seed', authenticate, async (req, res) => {
  try {
    const templates = [
      {
        name: 'Promo Flyer',
        slug: 'promo-flyer',
        mjml: `
          <mjml>
            <mj-head>
              <mj-title>Promo Flyer</mj-title>
            </mj-head>
            <mj-body background-color="#f4f4f4">
              <mj-section background-color="#000000" padding="40px 0">
                <mj-column>
                  <mj-text color="#ffffff" font-size="32px" font-weight="bold" align="center">
                    {{title}}
                  </mj-text>
                  <mj-text color="#ffffff" font-size="18px" align="center">
                    {{subtitle}}
                  </mj-text>
                </mj-column>
              </mj-section>
              <mj-section background-color="#ffffff" padding="40px 0">
                <mj-column>
                  <mj-image src="{{heroImage}}" alt="{{title}}" />
                  <mj-text font-size="16px" line-height="1.6">
                    {{description}}
                  </mj-text>
                  <mj-button background-color="#000000" color="#ffffff" href="{{ctaUrl}}">
                    {{ctaText}}
                  </mj-button>
                </mj-column>
              </mj-section>
              ${generateUnsubscribeFooter('{{contactId}}')}
            </mj-body>
          </mjml>
        `
      },
      {
        name: 'Video Spotlight',
        slug: 'video-spotlight',
        mjml: `
          <mjml>
            <mj-head>
              <mj-title>Video Spotlight</mj-title>
            </mj-head>
            <mj-body background-color="#f4f4f4">
              <mj-section background-color="#000000" padding="40px 0">
                <mj-column>
                  <mj-text color="#ffffff" font-size="28px" font-weight="bold" align="center">
                    Check Out Our Latest Video!
                  </mj-text>
                </mj-column>
              </mj-section>
              <mj-section background-color="#ffffff" padding="40px 0">
                <mj-column>
                  <mj-image src="{{videoThumbnail}}" alt="Video Thumbnail" />
                  <mj-text font-size="18px" font-weight="bold" align="center">
                    {{videoTitle}}
                  </mj-text>
                  <mj-text font-size="16px" line-height="1.6">
                    {{videoDescription}}
                  </mj-text>
                  <mj-button background-color="#000000" color="#ffffff" href="{{videoUrl}}">
                    Watch Now
                  </mj-button>
                </mj-column>
              </mj-section>
              ${generateUnsubscribeFooter('{{contactId}}')}
            </mj-body>
          </mjml>
        `
      },
      {
        name: 'Event RSVP',
        slug: 'event-rsvp',
        mjml: `
          <mjml>
            <mj-head>
              <mj-title>Event RSVP</mj-title>
            </mj-head>
            <mj-body background-color="#f4f4f4">
              <mj-section background-color="#000000" padding="40px 0">
                <mj-column>
                  <mj-text color="#ffffff" font-size="28px" font-weight="bold" align="center">
                    You're Invited!
                  </mj-text>
                </mj-column>
              </mj-section>
              <mj-section background-color="#ffffff" padding="40px 0">
                <mj-column>
                  <mj-image src="{{eventImage}}" alt="{{eventTitle}}" />
                  <mj-text font-size="24px" font-weight="bold" align="center">
                    {{eventTitle}}
                  </mj-text>
                  <mj-text font-size="18px" align="center" color="#666666">
                    📅 {{eventDate}} at {{eventTime}}
                  </mj-text>
                  <mj-text font-size="16px" align="center" color="#666666">
                    📍 {{eventLocation}}
                  </mj-text>
                  <mj-text font-size="16px" line-height="1.6">
                    {{eventDescription}}
                  </mj-text>
                  <mj-button background-color="#000000" color="#ffffff" href="{{rsvpUrl}}">
                    RSVP Now
                  </mj-button>
                </mj-column>
              </mj-section>
              ${generateUnsubscribeFooter('{{contactId}}')}
            </mj-body>
          </mjml>
        `
      },
      {
        name: 'Weekly Specials',
        slug: 'weekly-specials',
        mjml: `
          <mjml>
            <mj-head>
              <mj-title>Weekly Specials</mj-title>
            </mj-head>
            <mj-body background-color="#f4f4f4">
              <mj-section background-color="#000000" padding="40px 0">
                <mj-column>
                  <mj-text color="#ffffff" font-size="28px" font-weight="bold" align="center">
                    This Week's Specials
                  </mj-text>
                </mj-column>
              </mj-section>
              <mj-section background-color="#ffffff" padding="40px 0">
                <mj-column>
                  <mj-text font-size="20px" font-weight="bold" align="center">
                    {{specialTitle}}
                  </mj-text>
                  <mj-text font-size="16px" line-height="1.6">
                    {{specialDescription}}
                  </mj-text>
                </mj-column>
              </mj-section>
              <mj-section background-color="#ffffff" padding="20px 0">
                <mj-column width="50%">
                  <mj-image src="{{item1Image}}" alt="{{item1Name}}" />
                  <mj-text font-size="16px" font-weight="bold">{{item1Name}}</mj-text>
                  <mj-text font-size="14px" color="#666666">` + '{{item1Price}}' + `</mj-text>
                </mj-column>
                <mj-column width="50%">
                  <mj-image src="{{item2Image}}" alt="{{item2Name}}" />
                  <mj-text font-size="16px" font-weight="bold">{{item2Name}}</mj-text>
                  <mj-text font-size="14px" color="#666666">` + '{{item2Price}}' + `</mj-text>
                </mj-column>
              </mj-section>
              <mj-section background-color="#ffffff" padding="20px 0">
                <mj-column width="50%">
                  <mj-image src="{{item3Image}}" alt="{{item3Name}}" />
                  <mj-text font-size="16px" font-weight="bold">{{item3Name}}</mj-text>
                  <mj-text font-size="14px" color="#666666">` + '{{item3Price}}' + `</mj-text>
                </mj-column>
                <mj-column width="50%">
                  <mj-image src="{{item4Image}}" alt="{{item4Name}}" />
                  <mj-text font-size="16px" font-weight="bold">{{item4Name}}</mj-text>
                  <mj-text font-size="14px" color="#666666">` + '{{item4Price}}' + `</mj-text>
                </mj-column>
              </mj-section>
              <mj-section background-color="#ffffff" padding="40px 0">
                <mj-column>
                  <mj-button background-color="#000000" color="#ffffff" href="{{menuUrl}}">
                    View Full Menu
                  </mj-button>
                </mj-column>
              </mj-section>
              ${generateUnsubscribeFooter('{{contactId}}')}
            </mj-body>
          </mjml>
        `
      }
    ];

    const results = [];
    for (const template of templates) {
      const compiled = compileMJML(template.mjml);
      if (compiled.errors.length === 0) {
        const result = await prisma.emailMarketingTemplate.upsert({
          where: { slug: template.slug },
          update: {
            name: template.name,
            mjml: template.mjml,
            html: compiled.html
          },
          create: {
            name: template.name,
            slug: template.slug,
            mjml: template.mjml,
            html: compiled.html
          }
        });
        results.push(result);
      }
    }

    res.json({ 
      success: true, 
      seeded: results.length,
      templates: results 
    });
  } catch (error) {
    console.error('Seed templates error:', error);
    res.status(500).json({ error: 'Failed to seed templates' });
  }
});

// ===== CAMPAIGNS ROUTES =====

// Get campaigns
router.get('/campaigns', authenticate, async (req, res) => {
  try {
    const campaigns = await prisma.emailCampaign.findMany({
      include: {
        template: true,
        _count: {
          select: { events: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Create campaign
router.post('/campaigns', authenticate, async (req, res) => {
  try {
    const campaign = await prisma.emailCampaign.create({
      data: req.body
    });
    res.json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign
router.put('/campaigns/:id', authenticate, async (req, res) => {
  try {
    const campaign = await prisma.emailCampaign.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(campaign);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Schedule campaign
router.post('/campaigns/:id/schedule', authenticate, async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    const campaign = await prisma.emailCampaign.update({
      where: { id: req.params.id },
      data: {
        status: 'SCHEDULED',
        scheduledAt: new Date(scheduledAt)
      }
    });
    res.json(campaign);
  } catch (error) {
    console.error('Schedule campaign error:', error);
    res.status(500).json({ error: 'Failed to schedule campaign' });
  }
});

// Send campaign now
router.post('/campaigns/:id/send-now', authenticate, async (req, res) => {
  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: req.params.id },
      include: { template: true }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: req.params.id },
      data: { status: 'SENDING' }
    });

    // Get recipients
    const where: any = {
      consentEmail: true,
      unsubscribedAt: null
    };

    if (campaign.segmentTags && Array.isArray(campaign.segmentTags) && campaign.segmentTags.length > 0) {
      where.tags = { hasSome: campaign.segmentTags };
    }

    const contacts = await prisma.emailContact.findMany({ where });

    // Compile template if needed
    let html = campaign.html;
    if (!html && campaign.template) {
      const compiled = compileMJML(campaign.template.mjml);
      html = compiled.html;
    }

    // Send emails in batches
    const batchSize = parseInt(process.env.SENDING_BATCH || '200');
    let sentCount = 0;

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      
      const promises = batch.map(contact => 
        (async () => {
          try {
            // Replace template variables
            const personalizedHtml = replaceTemplateVariables(html || '', {
              firstName: contact.firstName || 'there',
              lastName: contact.lastName || '',
              email: contact.email,
              contactId: contact.id
            });

            const success = await mailer.sendEmail({
              to: contact.email,
              from: campaign.fromEmail,
              subject: campaign.subject,
              html: personalizedHtml
            }, {
              contactId: contact.id,
              campaignId: campaign.id,
              baseUrl: process.env.BACKEND_PUBLIC_URL || '${UPLOADS_URL}'
            });

            if (success) sentCount++;
          } catch (error) {
            console.error(`Failed to send to ${contact.email}:`, error);
          }
        })()
      );

      await Promise.all(promises);
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: req.params.id },
      data: { 
        status: 'SENT',
        sentAt: new Date()
      }
    });

    res.json({ 
      success: true, 
      sent: sentCount,
      total: contacts.length 
    });
  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

// Cancel campaign
router.post('/campaigns/:id/cancel', authenticate, async (req, res) => {
  try {
    const campaign = await prisma.emailCampaign.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });
    res.json(campaign);
  } catch (error) {
    console.error('Cancel campaign error:', error);
    res.status(500).json({ error: 'Failed to cancel campaign' });
  }
});

// ===== TRACKING ROUTES =====

// Track email opens
router.get('/track/open', async (req, res) => {
  try {
    const { cid, cmp } = req.query;
    
    if (cid) {
      await mailer.recordOpen(cid as string, cmp as string);
    }

    // Return transparent 1x1 pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.send(pixel);
  } catch (error) {
    console.error('Track open error:', error);
    res.status(500).send('Error');
  }
});

// Track email clicks
router.get('/track/click', async (req, res) => {
  try {
    const { cid, cmp, u } = req.query;
    
    if (cid && u) {
      const url = Buffer.from(u as string, 'base64url').toString('utf-8');
      await mailer.recordClick(cid as string, cmp as string, url);
      res.redirect(url);
    } else {
      res.redirect(process.env.SITE_PUBLIC_URL || 'http://72.167.227.205:3003');
    }
  } catch (error) {
    console.error('Track click error:', error);
    res.redirect(process.env.SITE_PUBLIC_URL || 'http://72.167.227.205:3003');
  }
});

// ===== UNSUBSCRIBE ROUTES =====

// Unsubscribe
router.get('/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.query;
    
    if (!email) {
      return res.status(400).send('Email parameter is required');
    }

    // Find contact and mark as unsubscribed
    const contact = await prisma.emailContact.findUnique({
      where: { email: email as string }
    });

    if (contact) {
      await prisma.emailContact.update({
        where: { id: contact.id },
        data: { unsubscribedAt: new Date() }
      });

      // Record unsubscribe event
      await prisma.emailEvent.create({
        data: {
          contactId: contact.id,
          type: 'UNSUBSCRIBE',
          meta: { timestamp: new Date().toISOString() }
        }
      });
    }

    res.send(`
      <html>
        <head><title>Unsubscribed</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>You've been unsubscribed</h1>
          <p>You will no longer receive emails from Kocky's Bar & Grill.</p>
          <p>If you change your mind, you can <a href="/api/email/preferences?email=${email}">update your preferences</a>.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).send('Error processing unsubscribe request');
  }
});

// Preferences page
router.get('/preferences', async (req, res) => {
  try {
    const { email, token } = req.query;
    
    if (!email) {
      return res.status(400).send('Email parameter is required');
    }

    const contact = await prisma.emailContact.findUnique({
      where: { email: email as string }
    });

    if (!contact) {
      return res.status(404).send('Contact not found');
    }

    res.send(`
      <html>
        <head>
          <title>Email Preferences</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .form-group { margin: 20px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="checkbox"] { margin-right: 10px; }
            button { background: #000; color: white; padding: 10px 20px; border: none; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>Email Preferences</h1>
          <p>Update your email preferences for ${email}</p>
          <form method="POST" action="/api/email/preferences">
            <input type="hidden" name="email" value="${email}" />
            <div class="form-group">
              <label>
                <input type="checkbox" name="consentEmail" ${contact.consentEmail ? 'checked' : ''} />
                Receive promotional emails
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" name="consentSms" ${contact.consentSms ? 'checked' : ''} />
                Receive SMS notifications
              </label>
            </div>
            <button type="submit">Update Preferences</button>
          </form>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Preferences error:', error);
    res.status(500).send('Error loading preferences');
  }
});

// Update preferences
router.post('/preferences', async (req, res) => {
  try {
    const { email, consentEmail, consentSms } = req.body;
    
    if (!email) {
      return res.status(400).send('Email parameter is required');
    }

    await prisma.emailContact.update({
      where: { email },
      data: {
        consentEmail: consentEmail === 'on',
        consentSms: consentSms === 'on',
        unsubscribedAt: consentEmail === 'on' ? null : new Date()
      }
    });

    res.send(`
      <html>
        <head><title>Preferences Updated</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Preferences Updated</h1>
          <p>Your email preferences have been updated successfully.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).send('Error updating preferences');
  }
});

// ===== TEST EMAIL SEND (for Email Template Studio) =====

// Send test email (no auth required for template studio)
router.post('/send', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, html' 
      });
    }

    console.log('📧 Test Email Request:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML Length:', html.length);

    // For now, simulate email sending (since Azure SMTP is not configured)
    // TODO: Configure Azure/Office 365 SMTP credentials
    console.log('📧 Simulating email send (Azure SMTP not configured)');
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    res.json({ 
      success: true, 
      message: 'Test email simulated successfully (Azure SMTP needs configuration)',
      to,
      subject,
      note: 'Email sending is simulated. Configure Azure SMTP credentials to enable actual sending.'
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      error: 'Failed to send test email: ' + (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

export default router;
