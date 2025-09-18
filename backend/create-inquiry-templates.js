const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const inquiryTemplates = [
  {
    name: 'Reservation Confirmation',
    slug: 'reservation-confirmation',
    subject: 'Your Reservation Request - Kocky\'s Bar & Grill',
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
    .reservation-box { background: white; padding: 15px; border: 2px solid #d4af37; margin: 15px 0; border-radius: 5px; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #d4af37; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reservation Request Received!</h1>
    </div>
    <div class="content">
      <p>Dear {{customerName}},</p>
      <p>Thank you for choosing Kocky's Bar & Grill for your dining experience!</p>
      
      <div class="reservation-box">
        <h3>Your Reservation Details:</h3>
        <p><strong>Date:</strong> {{eventDate}}</p>
        <p><strong>Time:</strong> {{eventTime}}</p>
        <p><strong>Party Size:</strong> {{guestCount}} guests</p>
        <p><strong>Confirmation Code:</strong> <span style="color: #d4af37; font-weight: bold;">{{confirmationCode}}</span></p>
      </div>
      
      <p>We will confirm your reservation within 2 hours and send you a final confirmation email.</p>
      
      <p>If you need to make any changes or have questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
      
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
    text: `Reservation Request Received!

Dear {{customerName}},

Thank you for choosing Kocky's Bar & Grill for your dining experience!

Your Reservation Details:
- Date: {{eventDate}}
- Time: {{eventTime}}
- Party Size: {{guestCount}} guests
- Confirmation Code: {{confirmationCode}}

We will confirm your reservation within 2 hours and send you a final confirmation email.

If you need to make any changes or have questions, please call us at (555) 123-4567.

We look forward to serving you!

Best regards,
The Kocky's Bar & Grill Team`,
    variables: { customerName: 'string', eventDate: 'string', eventTime: 'string', guestCount: 'number', confirmationCode: 'string' },
    logoUrl: '/api/uploads/logos/kockys-logo.png',
    bannerUrl: '/api/uploads/banners/reservation-banner.jpg',
  },
  {
    name: 'Mobile Bar Confirmation',
    slug: 'mobile-bar-confirmation',
    subject: 'Your Mobile Bar Service Request - Kocky\'s Bar & Grill',
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
    .service-box { background: white; padding: 15px; border: 2px solid #d4af37; margin: 15px 0; border-radius: 5px; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #d4af37; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mobile Bar Service Request Received!</h1>
    </div>
    <div class="content">
      <p>Dear {{customerName}},</p>
      <p>Thank you for your interest in our Mobile Bar Service! We're excited to help make your event unforgettable.</p>
      
      <div class="service-box">
        <h3>Your Event Details:</h3>
        <p><strong>Event Date:</strong> {{eventDate}}</p>
        <p><strong>Event Time:</strong> {{eventTime}}</p>
        <p><strong>Location:</strong> {{eventLocation}}</p>
        <p><strong>Expected Guests:</strong> {{guestCount}}</p>
        <p><strong>Package Type:</strong> {{packageType}}</p>
        <p><strong>Confirmation Code:</strong> <span style="color: #d4af37; font-weight: bold;">{{confirmationCode}}</span></p>
      </div>
      
      <p>Our team will review your request and contact you within 24 hours with a customized quote and service details.</p>
      
      <p>Our Mobile Bar Service includes:</p>
      <ul>
        <li>Professional bartenders</li>
        <li>Premium bar setup</li>
        <li>Custom cocktail menu</li>
        <li>All necessary equipment</li>
      </ul>
      
      <p>If you have any immediate questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
      
      <p>We look forward to making your event special!</p>
      
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
    text: `Mobile Bar Service Request Received!

Dear {{customerName}},

Thank you for your interest in our Mobile Bar Service! We're excited to help make your event unforgettable.

Your Event Details:
- Event Date: {{eventDate}}
- Event Time: {{eventTime}}
- Location: {{eventLocation}}
- Expected Guests: {{guestCount}}
- Package Type: {{packageType}}
- Confirmation Code: {{confirmationCode}}

Our team will review your request and contact you within 24 hours with a customized quote and service details.

Our Mobile Bar Service includes:
- Professional bartenders
- Premium bar setup
- Custom cocktail menu
- All necessary equipment

If you have any immediate questions, please call us at (555) 123-4567.

We look forward to making your event special!

Best regards,
The Kocky's Bar & Grill Team`,
    variables: { customerName: 'string', eventDate: 'string', eventTime: 'string', eventLocation: 'string', guestCount: 'number', packageType: 'string', confirmationCode: 'string' },
    logoUrl: '/api/uploads/logos/kockys-logo.png',
    bannerUrl: '/api/uploads/banners/mobile-bar-banner.jpg',
  },
  {
    name: 'Food Truck Confirmation',
    slug: 'food-truck-confirmation',
    subject: 'Your Food Truck Catering Request - Kocky\'s Bar & Grill',
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
    .service-box { background: white; padding: 15px; border: 2px solid #d4af37; margin: 15px 0; border-radius: 5px; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #d4af37; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Food Truck Catering Request Received!</h1>
    </div>
    <div class="content">
      <p>Dear {{customerName}},</p>
      <p>Thank you for your interest in our Food Truck Catering Service! We're excited to bring our delicious food to your event.</p>
      
      <div class="service-box">
        <h3>Your Event Details:</h3>
        <p><strong>Event Date:</strong> {{eventDate}}</p>
        <p><strong>Event Time:</strong> {{eventTime}}</p>
        <p><strong>Location:</strong> {{eventLocation}}</p>
        <p><strong>Expected Guests:</strong> {{guestCount}}</p>
        <p><strong>Budget:</strong> {{budget}}</p>
        <p><strong>Confirmation Code:</strong> <span style="color: #d4af37; font-weight: bold;">{{confirmationCode}}</span></p>
      </div>
      
      <p>Our team will review your request and contact you within 24 hours with a customized menu and pricing.</p>
      
      <p>Our Food Truck Catering includes:</p>
      <ul>
        <li>Fresh, made-to-order food</li>
        <li>Professional service staff</li>
        <li>Custom menu options</li>
        <li>Flexible serving times</li>
      </ul>
      
      <p>If you have any immediate questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
      
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
    text: `Food Truck Catering Request Received!

Dear {{customerName}},

Thank you for your interest in our Food Truck Catering Service! We're excited to bring our delicious food to your event.

Your Event Details:
- Event Date: {{eventDate}}
- Event Time: {{eventTime}}
- Location: {{eventLocation}}
- Expected Guests: {{guestCount}}
- Budget: {{budget}}
- Confirmation Code: {{confirmationCode}}

Our team will review your request and contact you within 24 hours with a customized menu and pricing.

Our Food Truck Catering includes:
- Fresh, made-to-order food
- Professional service staff
- Custom menu options
- Flexible serving times

If you have any immediate questions, please call us at (555) 123-4567.

We look forward to serving you!

Best regards,
The Kocky's Bar & Grill Team`,
    variables: { customerName: 'string', eventDate: 'string', eventTime: 'string', eventLocation: 'string', guestCount: 'number', budget: 'string', confirmationCode: 'string' },
    logoUrl: '/api/uploads/logos/kockys-logo.png',
    bannerUrl: '/api/uploads/banners/food-truck-banner.jpg',
  },
  {
    name: 'Catering Confirmation',
    slug: 'catering-confirmation',
    subject: 'Your Catering Service Request - Kocky\'s Bar & Grill',
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
    .service-box { background: white; padding: 15px; border: 2px solid #d4af37; margin: 15px 0; border-radius: 5px; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #d4af37; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Catering Service Request Received!</h1>
    </div>
    <div class="content">
      <p>Dear {{customerName}},</p>
      <p>Thank you for your interest in our Catering Service! We're excited to help make your event memorable with our delicious food.</p>
      
      <div class="service-box">
        <h3>Your Event Details:</h3>
        <p><strong>Event Date:</strong> {{eventDate}}</p>
        <p><strong>Event Time:</strong> {{eventTime}}</p>
        <p><strong>Location:</strong> {{eventLocation}}</p>
        <p><strong>Expected Guests:</strong> {{guestCount}}</p>
        <p><strong>Confirmation Code:</strong> <span style="color: #d4af37; font-weight: bold;">{{confirmationCode}}</span></p>
      </div>
      
      <p>Our team will review your request and contact you within 24 hours with a customized menu and pricing.</p>
      
      <p>Our Catering Service includes:</p>
      <ul>
        <li>Custom menu planning</li>
        <li>Fresh, high-quality ingredients</li>
        <li>Professional service staff</li>
        <li>Setup and cleanup</li>
        <li>Flexible serving options</li>
      </ul>
      
      <p>If you have any immediate questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
      
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
    text: `Catering Service Request Received!

Dear {{customerName}},

Thank you for your interest in our Catering Service! We're excited to help make your event memorable with our delicious food.

Your Event Details:
- Event Date: {{eventDate}}
- Event Time: {{eventTime}}
- Location: {{eventLocation}}
- Expected Guests: {{guestCount}}
- Confirmation Code: {{confirmationCode}}

Our team will review your request and contact you within 24 hours with a customized menu and pricing.

Our Catering Service includes:
- Custom menu planning
- Fresh, high-quality ingredients
- Professional service staff
- Setup and cleanup
- Flexible serving options

If you have any immediate questions, please call us at (555) 123-4567.

We look forward to serving you!

Best regards,
The Kocky's Bar & Grill Team`,
    variables: { customerName: 'string', eventDate: 'string', eventTime: 'string', eventLocation: 'string', guestCount: 'number', confirmationCode: 'string' },
    logoUrl: '/api/uploads/logos/kockys-logo.png',
    bannerUrl: '/api/uploads/banners/catering-banner.jpg',
  }
];

async function createInquiryTemplates() {
  try {
    console.log('Creating inquiry email templates...');
    
    const created = [];
    for (const template of inquiryTemplates) {
      const existing = await prisma.emailTemplate.findUnique({
        where: { slug: template.slug },
      });

      if (!existing) {
        const newTemplate = await prisma.emailTemplate.create({
          data: template,
        });
        created.push(newTemplate);
        console.log(`✅ Created template: ${template.name}`);
      } else {
        console.log(`⚠️  Template already exists: ${template.name}`);
      }
    }

    console.log(`\n🎉 Successfully created ${created.length} new inquiry email templates!`);
    console.log('\nTemplates created:');
    created.forEach(template => {
      console.log(`  - ${template.name} (${template.slug})`);
    });
    
  } catch (error) {
    console.error('Error creating templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createInquiryTemplates();

