const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeEmailTemplates() {
  try {
    console.log('Initializing email templates...');

    const defaultTemplates = [
      {
        name: 'inquiry_confirmation',
        subject: 'Thank you for contacting Kocky\'s Bar & Grill, {{customerName}}!',
        htmlContent: `<!DOCTYPE html>
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
      <h1>Thank You for Your Inquiry!</h1>
    </div>
    <div class="content">
      <p>Dear {{customerName}},</p>
      <p>We've received your inquiry for <strong>{{serviceName}}</strong> and are excited to help make your event special!</p>
      
      <h3>Your Inquiry Details:</h3>
      <ul>
        <li><strong>Service:</strong> {{serviceName}}</li>
        <li><strong>Event Date:</strong> {{eventDate}}</li>
        <li><strong>Location:</strong> {{eventLocation}}</li>
        <li><strong>Expected Guests:</strong> {{guestCount}}</li>
        <li><strong>Confirmation Code:</strong> {{confirmationCode}}</li>
      </ul>
      
      <p>Our team will review your request and contact you within 24 hours with more information and pricing.</p>
      
      <p>Best regards,<br>
      The Kocky's Bar & Grill Team</p>
    </div>
    <div class="footer">
      Kocky's Bar & Grill | 123 Main Street, City | (555) 123-4567
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
        isActive: true
      },
      {
        name: 'quote_sent',
        subject: 'Your Quote #{{quoteNumber}} from Kocky\'s Bar & Grill',
        htmlContent: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .quote-box { background: white; padding: 15px; border: 1px solid #ddd; margin: 15px 0; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
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
        <a href="{{paymentLink}}" class="button">Make Payment</a>
      </center>
      
      <p>Best regards,<br>
      The Kocky's Bar & Grill Team</p>
    </div>
    <div class="footer">
      Kocky's Bar & Grill | 123 Main Street, City | (555) 123-4567
    </div>
  </div>
</body>
</html>`,
        textContent: null,
        variables: ['customerName', 'serviceName', 'eventDate', 'quoteNumber', 'totalAmount', 'paymentLink'],
        logoUrl: '/api/uploads/logos/kockys-logo.png',
        footerText: 'Kocky\'s Bar & Grill | 123 Main Street, City | (555) 123-4567',
        paymentLink: 'https://payment.kockys.com/pay/{{quoteNumber}}',
        isActive: true
      }
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
        console.log(`Created template: ${template.name}`);
      } else {
        console.log(`Template already exists: ${template.name}`);
      }
    }

    console.log(`Initialized ${created.length} new email templates`);
    
    // List all templates
    const allTemplates = await prisma.emailTemplate.findMany();
    console.log(`Total email templates in database: ${allTemplates.length}`);
    
  } catch (error) {
    console.error('Error initializing email templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeEmailTemplates();



