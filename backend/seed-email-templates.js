const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const emailTemplates = [
  {
    name: "Food Truck Inquiry",
    subject: "Thank you for your Food Truck Inquiry!",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="UTF-8">
  <title>Food Truck Inquiry Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #e63946, #d62828); color: #fff; font-size: 24px; font-weight: bold; border-radius: 8px 8px 0 0;">
        🚚 Kocky's Food Truck
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 20px; font-size: 16px; color: #333; line-height: 1.6;">
        <h2 style="color: #e63946; margin-top: 0;">Thank you for your inquiry!</h2>
        <p>Hi {{customerName}},</p>
        <p>Thank you for reaching out about our <strong>Food Truck</strong> services! We're excited to learn more about your event and how we can make it unforgettable.</p>
        <p>Our team will review your request and get back to you within 24 hours with:</p>
        <ul style="color: #666; padding-left: 20px;">
          <li>Customized menu options for your event</li>
          <li>Detailed pricing and availability</li>
          <li>Setup requirements and logistics</li>
          <li>Next steps to secure your date</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{paymentLink}}" style="background: #e63946; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">View Our Menu</a>
        </div>
        <p style="color: #666; font-size: 14px;">Questions? Reply to this email or call us at (555) 123-4567</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
        Kocky's Bar & Grill | 123 Main St | (555) 123-4567 | info@kockys.com
      </td>
    </tr>
  </table>
</body>
</html>`,
    textContent: `Thank you for your Food Truck Inquiry!

Hi {{customerName}},

Thank you for reaching out about our Food Truck services! We're excited to learn more about your event and how we can make it unforgettable.

Our team will review your request and get back to you within 24 hours with:
- Customized menu options for your event
- Detailed pricing and availability  
- Setup requirements and logistics
- Next steps to secure your date

Questions? Reply to this email or call us at (555) 123-4567

Kocky's Bar & Grill | 123 Main St | (555) 123-4567 | info@kockys.com`,
    variables: ["customerName", "paymentLink"],
    isActive: true
  },
  {
    name: "Mobile Bar Booking Confirmation",
    subject: "Your Mobile Bar Booking is Confirmed! 🍸",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="UTF-8">
  <title>Mobile Bar Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #2c5530, #1a3d1e); color: #fff; font-size: 24px; font-weight: bold; border-radius: 8px 8px 0 0;">
        🍸 Kocky's Mobile Bar
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 20px; font-size: 16px; color: #333; line-height: 1.6;">
        <h2 style="color: #2c5530; margin-top: 0;">Booking Confirmed!</h2>
        <p>Hi {{customerName}},</p>
        <p>Great news! Your <strong>Mobile Bar</strong> booking has been confirmed for your event.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">Event Details:</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Location:</strong> {{eventLocation}}</p>
          <p><strong>Guest Count:</strong> {{guestCount}} guests</p>
          <p><strong>Confirmation Code:</strong> {{confirmationCode}}</p>
        </div>
        
        <p>Our professional bartenders will arrive 1 hour before your event to set up our fully equipped mobile bar. We'll provide:</p>
        <ul style="color: #666; padding-left: 20px;">
          <li>Premium spirits and mixers</li>
          <li>Professional bartending service</li>
          <li>Glassware and bar equipment</li>
          <li>Custom cocktail menu</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{paymentLink}}" style="background: #2c5530; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Payment</a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Questions? Reply to this email or call us at (555) 123-4567</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
        Kocky's Bar & Grill | 123 Main St | (555) 123-4567 | info@kockys.com
      </td>
    </tr>
  </table>
</body>
</html>`,
    textContent: `Your Mobile Bar Booking is Confirmed! 🍸

Hi {{customerName}},

Great news! Your Mobile Bar booking has been confirmed for your event.

Event Details:
- Date: {{eventDate}}
- Time: {{eventTime}}
- Location: {{eventLocation}}
- Guest Count: {{guestCount}} guests
- Confirmation Code: {{confirmationCode}}

Our professional bartenders will arrive 1 hour before your event to set up our fully equipped mobile bar. We'll provide:
- Premium spirits and mixers
- Professional bartending service
- Glassware and bar equipment
- Custom cocktail menu

Questions? Reply to this email or call us at (555) 123-4567

Kocky's Bar & Grill | 123 Main St | (555) 123-4567 | info@kockys.com`,
    variables: ["customerName", "eventDate", "eventTime", "eventLocation", "guestCount", "confirmationCode", "paymentLink"],
    isActive: true
  },
  {
    name: "Quote Request Confirmation",
    subject: "Your Quote Request is Being Processed 📋",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="UTF-8">
  <title>Quote Request Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #1e3a8a, #1e40af); color: #fff; font-size: 24px; font-weight: bold; border-radius: 8px 8px 0 0;">
        📋 Quote Request Received
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 20px; font-size: 16px; color: #333; line-height: 1.6;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Thank you for your quote request!</h2>
        <p>Hi {{customerName}},</p>
        <p>We've received your quote request and our team is already working on preparing a detailed proposal for your event.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #1e3a8a; margin-top: 0;">Request Details:</h3>
          <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
          <p><strong>Service Type:</strong> {{serviceName}}</p>
          <p><strong>Event Date:</strong> {{eventDate}}</p>
          <p><strong>Location:</strong> {{eventLocation}}</p>
          <p><strong>Guest Count:</strong> {{guestCount}}</p>
        </div>
        
        <p>What happens next?</p>
        <ol style="color: #666; padding-left: 20px;">
          <li>Our team reviews your requirements (within 2 hours)</li>
          <li>We prepare a customized quote with pricing</li>
          <li>You'll receive your detailed proposal via email</li>
          <li>Quote is valid for 30 days from receipt</li>
        </ol>
        
        <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #1e3a8a; font-weight: bold;">⏰ Expected Response Time: 2-4 hours</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">Questions? Reply to this email or call us at (555) 123-4567</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
        Kocky's Bar & Grill | 123 Main St | (555) 123-4567 | info@kockys.com
      </td>
    </tr>
  </table>
</body>
</html>`,
    textContent: `Your Quote Request is Being Processed 📋

Hi {{customerName}},

We've received your quote request and our team is already working on preparing a detailed proposal for your event.

Request Details:
- Quote Number: {{quoteNumber}}
- Service Type: {{serviceName}}
- Event Date: {{eventDate}}
- Location: {{eventLocation}}
- Guest Count: {{guestCount}}

What happens next?
1. Our team reviews your requirements (within 2 hours)
2. We prepare a customized quote with pricing
3. You'll receive your detailed proposal via email
4. Quote is valid for 30 days from receipt

Expected Response Time: 2-4 hours

Questions? Reply to this email or call us at (555) 123-4567

Kocky's Bar & Grill | 123 Main St | (555) 123-4567 | info@kockys.com`,
    variables: ["customerName", "quoteNumber", "serviceName", "eventDate", "eventLocation", "guestCount"],
    isActive: true
  },
  {
    name: "Payment Reminder",
    subject: "Payment Reminder - Complete Your Booking 💳",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="UTF-8">
  <title>Payment Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #fff; font-size: 24px; font-weight: bold; border-radius: 8px 8px 0 0;">
        💳 Payment Reminder
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 20px; font-size: 16px; color: #333; line-height: 1.6;">
        <h2 style="color: #dc2626; margin-top: 0;">Complete Your Booking</h2>
        <p>Hi {{customerName}},</p>
        <p>This is a friendly reminder that your booking requires payment to secure your event date.</p>
        
        <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">⚠️ Action Required</h3>
          <p><strong>Total Amount:</strong> {{totalAmount}}</p>
          <p><strong>Valid Until:</strong> {{validUntil}}</p>
          <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
        </div>
        
        <p>To complete your booking and secure your event date, please make your payment using the link below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{paymentLink}}" style="background: #dc2626; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 18px;">💳 Complete Payment Now</a>
        </div>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #1e3a8a;"><strong>🔒 Secure Payment:</strong> All payments are processed securely through our encrypted payment system.</p>
        </div>
        
        <p>If you have any questions about your quote or need to make changes, please don't hesitate to contact us.</p>
        
        <p style="color: #666; font-size: 14px;">Questions? Reply to this email or call us at (555) 123-4567</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
        Kocky's Bar & Grill | 123 Main St | (555) 123-4567 | info@kockys.com
      </td>
    </tr>
  </table>
</body>
</html>`,
    textContent: `Payment Reminder - Complete Your Booking 💳

Hi {{customerName}},

This is a friendly reminder that your booking requires payment to secure your event date.

Action Required:
- Total Amount: {{totalAmount}}
- Valid Until: {{validUntil}}
- Quote Number: {{quoteNumber}}

To complete your booking and secure your event date, please make your payment using the link below:

{{paymentLink}}

Secure Payment: All payments are processed securely through our encrypted payment system.

If you have any questions about your quote or need to make changes, please don't hesitate to contact us.

Questions? Reply to this email or call us at (555) 123-4567

Kocky's Bar & Grill | 123 Main St | (555) 123-4567 | info@kockys.com`,
    variables: ["customerName", "totalAmount", "validUntil", "quoteNumber", "paymentLink"],
    isActive: true
  }
];

async function seedEmailTemplates() {
  try {
    console.log('🌱 Starting email template seeding...');
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const template of emailTemplates) {
      try {
        // Check if template already exists
        const existing = await prisma.emailTemplate.findUnique({
          where: { name: template.name }
        });
        
        if (existing) {
          console.log(`⏭️  Skipping "${template.name}" - already exists`);
          skippedCount++;
          continue;
        }
        
        // Create new template
        const newTemplate = await prisma.emailTemplate.create({
          data: template
        });
        
        console.log(`✅ Created template: "${template.name}" (ID: ${newTemplate.id})`);
        createdCount++;
        
      } catch (error) {
        console.error(`❌ Error creating template "${template.name}":`, error.message);
      }
    }
    
    console.log(`\n🎯 Seeding complete!`);
    console.log(`   ✅ Created: ${createdCount} templates`);
    console.log(`   ⏭️  Skipped: ${skippedCount} templates`);
    
    // Show total count
    const totalTemplates = await prisma.emailTemplate.count();
    console.log(`   📊 Total templates in database: ${totalTemplates}`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedEmailTemplates();

