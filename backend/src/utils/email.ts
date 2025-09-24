import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { logger } from './logger';
import { emailService, EmailAccount } from '../services/emailService';
import o365EmailService from '../services/o365EmailService';

// Initialize SendGrid if API key is provided and valid
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'SG.your-sendgrid-api-key-here') {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data?: any;
  accountKey?: EmailAccount;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

// Email templates
export const getEmailTemplate = (template: string, data: any) => {
  const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.info(`📧 EMAIL TEMPLATE RENDERING [${templateId}]`, {
    template,
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : [],
    isQuoteTemplate: template === 'quote'
  });

  const templates: { [key: string]: { html: string; text: string } } = {
    welcome: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to Kocky's Bar & Grill!</h1>
          <p>Hi ${data.name},</p>
          <p>Thank you for joining us! We're excited to have you as part of our community.</p>
          <p>Visit us for great food, drinks, and atmosphere!</p>
          <p>Best regards,<br>The Kocky's Team</p>
        </div>
      `,
      text: `Welcome to Kocky's Bar & Grill!\n\nHi ${data.name},\n\nThank you for joining us! We're excited to have you as part of our community.\n\nVisit us for great food, drinks, and atmosphere!\n\nBest regards,\nThe Kocky's Team`,
    },
    'reset-password': {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Password Reset Request</h1>
          <p>Hi ${data.name},</p>
          <p>You requested to reset your password. Click the link below to proceed:</p>
          <p><a href="${data.resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The Kocky's Team</p>
        </div>
      `,
      text: `Password Reset Request\n\nHi ${data.name},\n\nYou requested to reset your password. Visit this link to proceed:\n\n${data.resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Kocky's Team`,
    },
    'reservation-confirmation': {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Reservation Confirmed!</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.name},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">Your reservation has been confirmed at Kocky's Bar & Grill:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📅 Date:</strong> ${data.date}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🕐 Time:</strong> ${data.time}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>👥 Party Size:</strong> ${data.partySize} guests</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${data.confirmationCode}</span></li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">We look forward to welcoming you to Kocky's Bar & Grill!</p>
            <p style="font-size: 16px; margin-bottom: 20px;">If you need to make any changes or have questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
            <p style="font-size: 16px;">Best regards,<br><strong>The Kocky's Team</strong></p>
          </div>
          <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p style="margin: 5px 0;">Kocky's Bar & Grill | 123 Main Street | Your City, State 12345</p>
            <p style="margin: 5px 0;">www.kockysbar.com | info@kockysbar.com | (555) 123-4567</p>
          </div>
        </div>
      `,
      text: `Reservation Confirmed!\n\nHi ${data.name},\n\nYour reservation has been confirmed at Kocky's Bar & Grill:\n\nDate: ${data.date}\nTime: ${data.time}\nParty Size: ${data.partySize} guests\nConfirmation Code: ${data.confirmationCode}\n\nWe look forward to welcoming you to Kocky's Bar & Grill!\n\nIf you need to make any changes or have questions, please call us at (555) 123-4567 or reply to this email.\n\nBest regards,\nThe Kocky's Team\n\nKocky's Bar & Grill | 123 Main Street | Your City, State 12345\nwww.kockysbar.com | info@kockysbar.com | (555) 123-4567`,
    },
    'reservation-internal': {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔔 New Reservation Inquiry</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">A new reservation has been submitted through the website:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <h3 style="margin-top: 0; color: #b22222;">Customer Information</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>👤 Name:</strong> ${data.name}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📧 Email:</strong> ${data.email}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📞 Phone:</strong> ${data.phone}</li>
              </ul>
              <h3 style="color: #b22222; margin-top: 20px;">Reservation Details</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📅 Date:</strong> ${data.date}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🕐 Time:</strong> ${data.time}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>👥 Party Size:</strong> ${data.partySize} guests</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${data.confirmationCode}</span></li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📝 Special Requests:</strong> ${data.specialRequests}</li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;"><strong>Action Required:</strong> Please confirm this reservation and contact the customer if needed.</p>
            <p style="font-size: 16px;">This reservation was automatically created through the website reservation system.</p>
          </div>
          <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p style="margin: 5px 0;">Kocky's Bar & Grill Reservation System</p>
            <p style="margin: 5px 0;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `New Reservation Inquiry\n\nA new reservation has been submitted through the website:\n\nCustomer Information:\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n\nReservation Details:\nDate: ${data.date}\nTime: ${data.time}\nParty Size: ${data.partySize} guests\nConfirmation Code: ${data.confirmationCode}\nSpecial Requests: ${data.specialRequests}\n\nAction Required: Please confirm this reservation and contact the customer if needed.\n\nThis reservation was automatically created through the website reservation system.\n\nGenerated on ${new Date().toLocaleString()}`,
    },
    'order-confirmation': {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Order Confirmed!</h1>
          <p>Hi ${data.name},</p>
          <p>Your order has been received and is being prepared.</p>
          <p><strong>Order #:</strong> ${data.confirmationCode}</p>
          <p><strong>Total:</strong> $${data.total}</p>
          <p><strong>Type:</strong> ${data.orderType}</p>
          ${data.pickupTime ? `<p><strong>Pickup Time:</strong> ${data.pickupTime}</p>` : ''}
          <p>We'll notify you when your order is ready!</p>
          <p>Best regards,<br>The Kocky's Team</p>
        </div>
      `,
      text: `Order Confirmed!\n\nHi ${data.name},\n\nYour order has been received and is being prepared.\n\nOrder #: ${data.confirmationCode}\nTotal: $${data.total}\nType: ${data.orderType}\n${data.pickupTime ? `Pickup Time: ${data.pickupTime}\n` : ''}\nWe'll notify you when your order is ready!\n\nBest regards,\nThe Kocky's Team`,
    },
    'booking-received': {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Booking Request Received!</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5;">
            <p>Hi ${data.name},</p>
            <p>Thank you for your interest in <strong>${data.bookingType}</strong> from Kocky's Bar & Grill!</p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Event Date:</strong> ${data.date}</p>
              ${data.eventTime ? `<p style="margin: 5px 0;"><strong>Event Time:</strong> ${data.eventTime}</p>` : ''}
              ${data.guestCount ? `<p style="margin: 5px 0;"><strong>Expected Guests:</strong> ${data.guestCount}</p>` : ''}
              ${data.location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${data.location}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Confirmation Code:</strong> <span style="color: #b22222; font-size: 18px; font-weight: bold;">${data.confirmationCode}</span></p>
            </div>
            <p>Our team will review your request and contact you within 24 hours with a customized quote.</p>
            <p>If you have any immediate questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
            <p>Thank you for choosing Kocky's Bar & Grill!</p>
            <p>Cheers,<br><strong>The Kocky's Team</strong></p>
          </div>
          <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p style="margin: 5px 0;">Kocky's Bar & Grill | 123 Main Street | Your City, State 12345</p>
            <p style="margin: 5px 0;">www.kockysbar.com | info@kockys.com</p>
          </div>
        </div>
      `,
      text: `Booking Request Received!\n\nHi ${data.name},\n\nThank you for your interest in ${data.bookingType} from Kocky's Bar & Grill!\n\nEvent Details:\nEvent Date: ${data.date}\n${data.eventTime ? `Event Time: ${data.eventTime}\n` : ''}${data.guestCount ? `Expected Guests: ${data.guestCount}\n` : ''}${data.location ? `Location: ${data.location}\n` : ''}Confirmation Code: ${data.confirmationCode}\n\nOur team will review your request and contact you within 24 hours with a customized quote.\n\nIf you have any immediate questions, please call us at (555) 123-4567 or reply to this email.\n\nThank you for choosing Kocky's Bar & Grill!\n\nCheers,\nThe Kocky's Team\n\nKocky's Bar & Grill | 123 Main Street | Your City, State 12345\nwww.kockysbar.com | info@kockys.com`,
    },
    'quote': {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Your Quote from Kocky's Bar & Grill</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f8f8f8; margin: 0; padding: 0; color: #333; }
            .container { max-width: 640px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(90deg, #e63946, #fca311); color: #fff; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; line-height: 1.6; }
            .quote-summary { background: #f4f4f4; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .btn { display: inline-block; background: #e63946; color: #fff; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .footer { background: #333; color: #fff; text-align: center; padding: 15px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>Kocky's Bar & Grill</h1></div>
            <div class="content">
              <p>Hello ${data.customerName},</p>
              <p>Thank you for considering Kocky's Bar & Grill for your upcoming event. Please review the details of your quote below:</p>
              <div class="quote-summary">
                <p><strong>Quote Number:</strong> ${data.quoteNumber}</p>
                <p><strong>Service Type:</strong> ${data.serviceType || 'Catering Services'}</p>
                ${data.eventDate ? `<p><strong>Event Date:</strong> ${data.eventDate}</p>` : ''}
                <p><strong>Valid Until:</strong> ${data.validUntil}</p>
                
                <div style="margin: 20px 0; padding: 15px; background: #fff; border-radius: 6px; border: 1px solid #ddd;">
                  <h3 style="margin: 0 0 15px 0; color: #e63946;">Quote Breakdown</h3>
                  
                  ${data.items && data.items.length > 0 ? `
                  <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Service Items</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                      <thead>
                        <tr style="background-color: #f8f9fa;">
                          <th style="padding: 10px; text-align: left; border: 1px solid #dee2e6; font-weight: bold;">Description</th>
                          <th style="padding: 10px; text-align: center; border: 1px solid #dee2e6; font-weight: bold;">Qty</th>
                          <th style="padding: 10px; text-align: right; border: 1px solid #dee2e6; font-weight: bold;">Unit Price</th>
                          <th style="padding: 10px; text-align: right; border: 1px solid #dee2e6; font-weight: bold;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${data.items.map((item: any) => `
                        <tr>
                          <td style="padding: 10px; border: 1px solid #dee2e6;">${item.description}</td>
                          <td style="padding: 10px; text-align: center; border: 1px solid #dee2e6;">${item.quantity}</td>
                          <td style="padding: 10px; text-align: right; border: 1px solid #dee2e6;">$${item.unitPrice}</td>
                          <td style="padding: 10px; text-align: right; border: 1px solid #dee2e6;">$${item.total}</td>
                        </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                  ` : ''}
                  
                  <div style="border-top: 1px solid #dee2e6; padding-top: 15px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                      <span>Subtotal:</span>
                      <span>${data.subtotal || data.total}</span>
                    </div>
                    ${data.tax && data.tax !== '$0.00' ? `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                      <span>Tax:</span>
                      <span>${data.tax}</span>
                    </div>
                    ` : ''}
                    ${data.gratuity && data.gratuity !== '$0.00' ? `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                      <span>Gratuity:</span>
                      <span>${data.gratuity}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: bold; color: #e63946; border-top: 2px solid #e63946; margin-top: 10px;">
                      <span>Total Amount:</span>
                      <span>${data.total}</span>
                    </div>
                    ${data.deposit ? `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #fca311; font-weight: bold; margin-top: 10px;">
                      <span>Deposit Required:</span>
                      <span>${data.deposit}</span>
                    </div>
                    ` : ''}
                  </div>
                </div>
              </div>
              <p>You can download a PDF version of this quote from the attachment, or pay securely online using the button below:</p>
              <p style="text-align:center;"><a href="${data.stripePaymentLink}" class="btn">Pay Now</a></p>
              <p>If you have any questions, feel free to reply to this email or call us at (559) 266-5500.</p>
              <p>We look forward to serving you! 🍻</p>
              <p>- The Kocky's Team</p>
            </div>
            <div class="footer">
              Kocky's Bar & Grill • 1231 Van Ness Ave, Fresno, CA 93721  
              <br>
              <a href="${data.unsubscribeLink}" style="color:#fca311;">Unsubscribe</a>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Your Quote from Kocky's Bar & Grill\n\nHello ${data.customerName},\n\nThank you for considering Kocky's Bar & Grill for your upcoming event. Please review the details of your quote below:\n\nQuote Details:\nQuote Number: ${data.quoteNumber}\nService Type: ${data.serviceType || 'Catering Services'}\n${data.eventDate ? `Event Date: ${data.eventDate}\n` : ''}Valid Until: ${data.validUntil}\n\n${data.items && data.items.length > 0 ? `Service Items:\n${data.items.map((item: any) => `- ${item.description} (Qty: ${item.quantity}) - $${item.unitPrice} each = $${item.total}`).join('\n')}\n\n` : ''}Quote Breakdown:\nSubtotal: ${data.subtotal || data.total}\n${data.tax && data.tax !== '$0.00' ? `Tax: ${data.tax}\n` : ''}${data.gratuity && data.gratuity !== '$0.00' ? `Gratuity: ${data.gratuity}\n` : ''}Total Amount: ${data.total}\n${data.deposit ? `Deposit Required: ${data.deposit}\n` : ''}\nYou can download a PDF version of this quote from the attachment, or pay securely online using the link below:\n\nPay Now: ${data.stripePaymentLink}\n\nIf you have any questions, feel free to reply to this email or call us at (559) 266-5500.\n\nWe look forward to serving you! 🍻\n\n- The Kocky's Team\n\nKocky's Bar & Grill • 1231 Van Ness Ave, Fresno, CA 93721\nUnsubscribe: ${data.unsubscribeLink}`,
    },
  };

  // CRITICAL FIX: Do not fallback to welcome template for quote emails
  if (template === 'quote' && !templates[template]) {
    throw new Error(`Quote template not found. Available templates: ${Object.keys(templates).join(', ')}`);
  }
  
  const template_data = templates[template];
  
  if (!template_data) {
    throw new Error(`Template "${template}" not found. Available templates: ${Object.keys(templates).join(', ')}`);
  }
  
  // Debug logging for template selection
  console.log(`🔍 TEMPLATE SELECTION DEBUG:`);
  console.log(`   Requested template: "${template}"`);
  console.log(`   Available templates: ${Object.keys(templates).join(', ')}`);
  console.log(`   Template found: ${templates[template] ? 'YES' : 'NO'}`);
  console.log(`   Using template: "${template}"`);
  
  // Log template rendering result
  logger.info(`✅ EMAIL TEMPLATE RENDERED [${templateId}]`, {
    template,
    htmlLength: template_data.html.length,
    textLength: template_data.text.length,
    hasStripeLink: template_data.html.includes('stripePaymentLink'),
    hasQuoteDetails: template_data.html.includes('Quote Breakdown'),
    hasPayNowButton: template_data.html.includes('Pay Now')
  });
  
  return template_data;
};

export const sendEmail = async (options: EmailOptions) => {
  const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.info(`📧 EMAIL SEND ATTEMPT [${emailId}]`, {
    to: options.to,
    subject: options.subject,
    template: options.template,
    hasAttachments: !!(options.attachments && options.attachments.length > 0),
    attachmentCount: options.attachments?.length || 0,
    hasData: !!options.data,
    dataKeys: options.data ? Object.keys(options.data) : []
  });

  try {
    const { html, text } = getEmailTemplate(options.template, options.data);

    // Check if Office 365 is properly configured (Priority 1)
    const hasValidO365 = process.env.O365_CLIENT_ID && 
      process.env.O365_CLIENT_SECRET && 
      process.env.O365_TENANT_ID &&
      process.env.O365_CLIENT_ID !== 'your-client-id' &&
      process.env.O365_CLIENT_SECRET !== 'your-client-secret';

    // Check if SendGrid is properly configured (not placeholder)
    const hasValidSendGrid = process.env.SENDGRID_API_KEY && 
      process.env.SENDGRID_API_KEY !== 'SG.your-sendgrid-api-key-here' &&
      process.env.SENDGRID_API_KEY.startsWith('SG.');

    logger.info(`🔧 EMAIL SERVICE CONFIGURATION [${emailId}]`, {
      hasValidO365,
      hasValidSendGrid,
      hasAttachments: !!(options.attachments && options.attachments.length > 0),
      willSkipO365: !!(options.attachments && options.attachments.length > 0) // O365 doesn't support attachments
    });

    // Check if SMTP is properly configured (not placeholder)
    const hasValidSMTP = process.env.SMTP_HOST && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS &&
      process.env.SMTP_USER !== 'your-email@gmail.com' &&
      process.env.SMTP_PASS !== 'your-app-specific-password';

    // Use Office 365 Graph API (Priority 1) - ENABLED FOR QUOTE SYSTEM
    // Office 365 Graph API supports attachments
    if (hasValidO365) {
      logger.info(`📤 ATTEMPTING EMAIL VIA OFFICE 365 [${emailId}]`, {
        to: options.to,
        subject: options.subject,
        hasAttachments: !!(options.attachments && options.attachments.length > 0),
        attachmentCount: options.attachments?.length || 0,
        provider: 'Office 365 Graph API'
      });

      try {
        const success = await o365EmailService.sendEmail({
          to: options.to,
          subject: options.subject,
          html: html,
          text: text,
          cc: options.cc,
          bcc: options.bcc,
          attachments: options.attachments,
        });

        if (success) {
          logger.info(`✅ EMAIL SENT VIA OFFICE 365 [${emailId}]`, {
            to: options.to,
            subject: options.subject,
            provider: 'Office 365 Graph API',
            success: true
          });
          return true;
        } else {
          logger.error(`❌ OFFICE 365 EMAIL FAILED [${emailId}]`, {
            to: options.to,
            subject: options.subject,
            provider: 'Office 365 Graph API',
            success: false,
            reason: 'O365 service returned false'
          });
          // Fall through to try other services
        }
      } catch (error) {
        logger.error(`❌ OFFICE 365 EMAIL ERROR [${emailId}]`, {
          to: options.to,
          subject: options.subject,
          provider: 'Office 365 Graph API',
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        // Fall through to try other services
      }
    } else if (hasValidO365 && options.attachments && options.attachments.length > 0) {
      // Office 365 Graph API supports attachments, so we can proceed
      logger.info(`📎 OFFICE 365 WITH ATTACHMENTS [${emailId}]`, {
        to: options.to,
        subject: options.subject,
        attachmentCount: options.attachments.length,
        reason: 'O365 Graph API supports attachments'
      });
    } else if (!hasValidO365) {
      logger.warn(`⚠️ OFFICE 365 NOT CONFIGURED [${emailId}]`, {
        to: options.to,
        subject: options.subject,
        reason: 'Missing O365 credentials'
      });
    }

    if (hasValidSendGrid) {
      logger.info(`📤 SENDING EMAIL VIA SENDGRID [${emailId}]`, {
        to: options.to,
        subject: options.subject,
        hasAttachments: !!(options.attachments && options.attachments.length > 0),
        attachmentCount: options.attachments?.length || 0,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@kockysbar.com'
      });

      // Use SendGrid
      const msg: any = {
        to: options.to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@kockysbar.com',
          name: process.env.SENDGRID_FROM_NAME || "Kocky's Bar & Grill",
        },
        subject: options.subject,
        text,
        html,
      };

      // Add CC and BCC if provided
      if (options.cc && options.cc.length > 0) {
        msg.cc = options.cc;
      }
      if (options.bcc && options.bcc.length > 0) {
        msg.bcc = options.bcc;
      }

      // Add attachments if provided
      if (options.attachments && options.attachments.length > 0) {
        msg.attachments = options.attachments.map(attachment => ({
          content: attachment.content.toString('base64'),
          filename: attachment.filename,
          type: attachment.contentType || 'application/pdf',
          disposition: 'attachment'
        }));
      }

      try {
        await sgMail.send(msg);
        logger.info(`✅ EMAIL SENT VIA SENDGRID [${emailId}]`, {
          to: options.to,
          subject: options.subject,
          hasAttachments: !!(options.attachments && options.attachments.length > 0),
          attachmentCount: options.attachments?.length || 0,
          provider: 'SendGrid',
          attachmentFilenames: options.attachments?.map(a => a.filename) || [],
          success: true
        });
        return true;
      } catch (error) {
        logger.error(`❌ SENDGRID EMAIL FAILED [${emailId}]`, {
          to: options.to,
          subject: options.subject,
          provider: 'SendGrid',
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          hasAttachments: !!(options.attachments && options.attachments.length > 0),
          attachmentCount: options.attachments?.length || 0
        });
        // Fall through to try SMTP
      }
    } else if (hasValidSMTP) {
      // Use SMTP (Nodemailer)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // Use TLS
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        },
        requireTLS: true,
        debug: process.env.NODE_ENV === 'development',
      });

      // Verify connection configuration in development
      if (process.env.NODE_ENV === 'development') {
        await transporter.verify();
      }

      const mailOptions: any = {
        from: `"${process.env.SENDGRID_FROM_NAME || "Kocky's Bar & Grill"}" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: `✅ ${options.subject}`,
        text,
        html,
      };

      // Add CC and BCC if provided
      if (options.cc && options.cc.length > 0) {
        mailOptions.cc = options.cc;
      }
      if (options.bcc && options.bcc.length > 0) {
        mailOptions.bcc = options.bcc;
      }

      // Add attachments if provided
      if (options.attachments && options.attachments.length > 0) {
        mailOptions.attachments = options.attachments.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType || 'application/pdf'
        }));
      }

      try {
        await transporter.sendMail(mailOptions);
        logger.info(`✅ EMAIL SENT VIA SMTP [${emailId}]`, {
          to: options.to,
          subject: options.subject,
          provider: 'SMTP',
          hasAttachments: !!(options.attachments && options.attachments.length > 0),
          attachmentCount: options.attachments?.length || 0,
          success: true
        });
        return true;
      } catch (error) {
        logger.error(`❌ SMTP EMAIL FAILED [${emailId}]`, {
          to: options.to,
          subject: options.subject,
          provider: 'SMTP',
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          hasAttachments: !!(options.attachments && options.attachments.length > 0),
          attachmentCount: options.attachments?.length || 0
        });
        // All services failed
        throw error;
      }
    } else {
      // Log email details when no valid email service is configured
      logger.error(`❌ NO EMAIL SERVICE CONFIGURED [${emailId}]`, {
        to: options.to,
        subject: options.subject,
        template: options.template,
        hasO365: hasValidO365,
        hasSendGrid: hasValidSendGrid,
        hasSMTP: hasValidSMTP,
        reason: 'No email service credentials found'
      });
      
      // In development, also log to console for visibility
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n❌ EMAIL NOT SENT - NO SERVICE CONFIGURED [${emailId}]:`);
        console.log(`   To: ${options.to}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   Template: ${options.template}`);
        console.log(`   Office 365: ${hasValidO365 ? '✅' : '❌'}`);
        console.log(`   SendGrid: ${hasValidSendGrid ? '✅' : '❌'}`);
        console.log(`   SMTP: ${hasValidSMTP ? '✅' : '❌'}`);
        console.log(`   Data:`, JSON.stringify(options.data, null, 2));
        console.log(`\n   To fix: Configure Office 365, SendGrid, or SMTP credentials in .env\n`);
      }
      
      throw new Error(`No email service configured. Office 365: ${hasValidO365}, SendGrid: ${hasValidSendGrid}, SMTP: ${hasValidSMTP}`);
    }
  } catch (error) {
    logger.error(`❌ EMAIL SEND FAILED [${emailId}]`, {
      to: options.to,
      subject: options.subject,
      template: options.template,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Log email details even when sending fails
    logger.warn(`📧 FAILED EMAIL ATTEMPT [${emailId}]`, {
      to: options.to,
      subject: options.subject,
      template: options.template,
      data: options.data,
      timestamp: new Date().toISOString()
    });
    
    // In development, also log to console for visibility
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n❌ EMAIL SEND FAILED [${emailId}]:`);
      console.log(`   To: ${options.to}`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Template: ${options.template}`);
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`   Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
      console.log(`\n`);
    }
    
    // Propagate the error instead of returning false
    throw error;
  }
};

export const sendBulkEmails = async (recipients: string[], subject: string, template: string, data: any) => {
  const promises = recipients.map(to => sendEmail({ to, subject, template, data }));
  return Promise.allSettled(promises);
};

// Enhanced email functions using the new multi-account service
export const sendEmailWithAccount = async (accountKey: EmailAccount, options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
}) => {
  try {
    const success = await emailService.sendEmail(accountKey, options);
    if (success) {
      logger.info(`Email sent to ${options.to} using account '${accountKey}'`);
    } else {
      logger.error(`Failed to send email to ${options.to} using account '${accountKey}'`);
    }
    return success;
  } catch (error) {
    logger.error('Error sending email with account:', error);
    return false;
  }
};

// Send automatic inquiry confirmation
export const sendInquiryAutoReply = async (data: {
  name: string;
  email: string;
  serviceType: string;
  eventDate?: string;
  confirmationCode: string;
  message: string;
}, accountKey?: EmailAccount) => {
  try {
    const success = await emailService.sendInquiryConfirmation(data, accountKey);
    logger.info(`Inquiry auto-reply sent to ${data.email}`);
    return success;
  } catch (error) {
    logger.error('Error sending inquiry auto-reply:', error);
    return false;
  }
};

// Send quote with account selection
export const sendQuoteWithAccount = async (data: {
  customerName: string;
  customerEmail: string;
  quoteNumber: string;
  serviceType: string;
  eventDate?: string;
  totalAmount: number;
  depositAmount?: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  validUntil: string;
  paymentLink?: string;
  terms?: string;
  notes?: string;
}, accountKey?: EmailAccount) => {
  try {
    const success = await emailService.sendQuote(data, accountKey);
    logger.info(`Quote sent to ${data.customerEmail} using account '${accountKey || 'quotes'}'`);
    return success;
  } catch (error) {
    logger.error('Error sending quote:', error);
    return false;
  }
};

// Get available email accounts
export const getEmailAccounts = () => {
  return emailService.getAvailableAccounts();
};

// Test email account
export const testEmailAccount = async (accountKey: EmailAccount) => {
  return emailService.testEmailAccount(accountKey);
};

// Send test email
export const sendTestEmail = async (accountKey: EmailAccount, toEmail: string) => {
  return emailService.sendTestEmail(accountKey, toEmail);
};

// Test Office 365 email service
export const testOffice365Service = async () => {
  return o365EmailService.testEmailService();
};

// Get Office 365 service status
export const getOffice365Status = () => {
  return o365EmailService.getServiceStatus();
};
