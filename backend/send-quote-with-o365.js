#!/usr/bin/env node

/**
 * Send Quote Email with Office 365
 * 
 * This script sends a test quote email using Office 365 SMTP
 * with the configured credentials.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Office 365 email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'info@kockysbar.com',
    pass: process.env.SMTP_PASS
  }
};

// Test quote data
const quoteData = {
  customerName: 'Michael Smith',
  quoteNumber: 'Q-O365-TEST-001',
  serviceType: 'Catering',
  eventDate: 'November 15, 2025',
  validUntil: 'October 30, 2025',
  total: '$1,560.00',
  subtotal: '$1,300.00',
  tax: '$0.00',
  gratuity: '$260.00',
  terms: 'Payment due upon acceptance. All services subject to availability.',
  message: 'This is a test quote email sent via Office 365 SMTP to verify the system is working.',
  stripePaymentLink: 'https://checkout.stripe.com/test-payment-link',
  items: [
    { description: 'Professional Bartender Service', quantity: 2, unitPrice: '150.00', total: '300.00' },
    { description: 'Premium Food Catering (75 guests)', quantity: 1, unitPrice: '800.00', total: '800.00' },
    { description: 'Setup & Cleanup Service', quantity: 1, unitPrice: '200.00', total: '200.00' },
    { description: 'Gratuity (20%)', quantity: 1, unitPrice: '260.00', total: '260.00' }
  ]
};

// Simple HTML template
function createQuoteHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quote from Kocky's Bar & Grill</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #e63946; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Kocky's Bar & Grill</h1>
        <p style="margin: 5px 0 0 0; font-size: 16px;">Your Quote is Ready!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${data.customerName}!</h2>
        
        <p>Thank you for considering Kocky's Bar & Grill for your upcoming event. Please review your quote details below:</p>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #e63946;">Quote #${data.quoteNumber}</h3>
          <p><strong>Service Type:</strong> ${data.serviceType}</p>
          <p><strong>Event Date:</strong> ${data.eventDate}</p>
          <p><strong>Valid Until:</strong> ${data.validUntil}</p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin: 0 0 15px 0; color: #333;">Service Items</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border: 1px solid #dee2e6;">Description</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #dee2e6;">Qty</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #dee2e6;">Unit Price</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #dee2e6;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #dee2e6;">${item.description}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #dee2e6;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #dee2e6;">$${item.unitPrice}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #dee2e6;">$${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="border-top: 2px solid #e9ecef; padding-top: 15px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Subtotal:</span>
              <span>${data.subtotal}</span>
            </div>
            ${data.tax !== '$0.00' ? `
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Tax:</span>
              <span>${data.tax}</span>
            </div>
            ` : ''}
            ${data.gratuity !== '$0.00' ? `
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Gratuity:</span>
              <span>${data.gratuity}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: 18px; border-top: 1px solid #dee2e6; padding-top: 10px;">
              <span>Total:</span>
              <span style="color: #e63946;">${data.total}</span>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.stripePaymentLink}" style="background: #e63946; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            💳 Pay Now
          </a>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #333;">Terms & Conditions</h4>
          <p style="margin: 0; font-size: 14px; color: #666;">${data.terms}</p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #333;">Message</h4>
          <p style="margin: 0; font-size: 14px; color: #666;">${data.message}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 6px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            Questions? Call us at <strong>(559) 266-5500</strong><br>
            or reply to this email.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
            Kocky's Bar & Grill • 1231 Van Ness Ave, Fresno, CA 93721
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Simple text template
function createQuoteText(data) {
  return `
Your Quote from Kocky's Bar & Grill

Hello ${data.customerName},

Thank you for considering Kocky's Bar & Grill for your upcoming event. Please review your quote details below:

Quote #${data.quoteNumber}
Service Type: ${data.serviceType}
Event Date: ${data.eventDate}
Valid Until: ${data.validUntil}

Service Items:
${data.items.map(item => `- ${item.description} (Qty: ${item.quantity}) - $${item.unitPrice} each = $${item.total}`).join('\n')}

Quote Breakdown:
Subtotal: ${data.subtotal}
${data.tax !== '$0.00' ? `Tax: ${data.tax}\n` : ''}${data.gratuity !== '$0.00' ? `Gratuity: ${data.gratuity}\n` : ''}Total Amount: ${data.total}

Pay Now: ${data.stripePaymentLink}

Terms & Conditions:
${data.terms}

Message:
${data.message}

If you have any questions, feel free to reply to this email or call us at (559) 266-5500.

We look forward to serving you! 🍻

- The Kocky's Team

Kocky's Bar & Grill • 1231 Van Ness Ave, Fresno, CA 93721
  `;
}

async function sendQuoteWithO365() {
  console.log('\n' + '='.repeat(60));
  console.log('📧 SENDING QUOTE EMAIL VIA OFFICE 365');
  console.log('='.repeat(60));
  
  try {
    // Display configuration
    console.log('🔧 Email Configuration:');
    console.log(`   Host: ${emailConfig.host}`);
    console.log(`   Port: ${emailConfig.port}`);
    console.log(`   User: ${emailConfig.auth.user}`);
    console.log(`   Pass: ${emailConfig.auth.pass ? 'Set (' + emailConfig.auth.pass.length + ' chars)' : 'Not set'}`);
    
    // Create transporter
    console.log('\n🔧 Setting up email transporter...');
    const transporter = nodemailer.createTransport(emailConfig);
    
    // Verify connection
    console.log('🔍 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified');
    
    // Prepare email
    console.log('📝 Preparing email content...');
    const htmlContent = createQuoteHTML(quoteData);
    const textContent = createQuoteText(quoteData);
    
    const mailOptions = {
      from: `"Kocky's Bar & Grill" <${emailConfig.auth.user}>`,
      to: 'kappamike@gmail.com',
      subject: `Your Quote ${quoteData.quoteNumber} — Kocky's Bar & Grill`,
      html: htmlContent,
      text: textContent
    };
    
    // Send email
    console.log('📤 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 EMAIL SENT SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📧 To: ${mailOptions.to}`);
    console.log(`📧 From: ${mailOptions.from}`);
    console.log(`📧 Subject: ${mailOptions.subject}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📧 Response: ${result.response}`);
    console.log('\n✅ Check your email inbox for the quote!');
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ EMAIL SEND FAILED');
    console.log('='.repeat(60));
    console.error('Error:', error.message);
    
    if (error.message.includes('Authentication unsuccessful')) {
      console.log('\n💡 This is likely due to Office 365 authentication issues.');
      console.log('   The password might be expired or the account needs re-authentication.');
    }
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  sendQuoteWithO365().catch((error) => {
    console.error('Script execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { sendQuoteWithO365 };
