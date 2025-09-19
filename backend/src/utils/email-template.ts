import Handlebars from 'handlebars';

// Register custom Handlebars helpers
Handlebars.registerHelper('if', function(this: any, conditional: any, options: any) {
  if (conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('formatDate', function(date: any) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

Handlebars.registerHelper('formatCurrency', function(amount: any) {
  if (!amount) return '$0.00';
  const num = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
});

/**
 * Render an email template with variables
 * @param template The template string with {{variables}}
 * @param data The data object containing variable values
 * @returns The rendered template string
 */
export function renderEmailTemplate(template: string, data: any): string {
  try {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(data);
  } catch (error) {
    console.error('Error rendering email template:', error);
    return template; // Return original template if rendering fails
  }
}

/**
 * Render email HTML from studio data
 * @param data Object containing brand, sections, and theme
 * @returns Rendered HTML string
 */
export function renderEmailHTML({
  brand,
  sections,
  theme,
}: {
  brand: any;
  sections: any[];
  theme: any;
}): string {
  const banner = brand.banner || "";
  const logo = brand.logo || "";
  const accent = theme.accent || "#111827"; // slate-900
  const text = theme.text || "#111827";
  const bg = theme.bg || "#ffffff";

  const safe = (s: string) => (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>${safe(brand.subject || "Kocky's Email")}</title>
    <style>
      .btn{display:inline-block;padding:12px 16px;border-radius:10px;text-decoration:none}
    </style>
  </head>
  <body style="margin:0;background:${bg};color:${text};font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg}">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%">
            ${banner ? `<tr><td><img src="${banner}" alt="Banner" style="display:block;width:100%;height:auto;border:0"/></td></tr>` : ""}
            <tr>
              <td style="padding:24px 24px 8px">
                <div style="display:flex;align-items:center;gap:12px">
                  ${logo ? `<img src="${logo}" alt="Logo" width="48" height="48" style="border-radius:12px"/>` : ""}
                  <div>
                    <div style="font-weight:700;font-size:18px">${safe(brand.senderName || "Kocky's Bar & Grill")}</div>
                    <div style="font-size:12px;color:#6b7280">${safe(brand.senderEmail || "info@kockys.com")}</div>
                  </div>
                </div>
              </td>
            </tr>
            ${sections
              .map((s: any) => {
                if (s.type === "heading") {
                  return `<tr><td style="padding:16px 24px 0"><h1 style="margin:0;font-size:24px;color:${accent}">${safe(
                    s.text
                  )}</h1></td></tr>`;
                }
                if (s.type === "text") {
                  return `<tr><td style="padding:8px 24px 0;line-height:1.6">${safe(
                    s.text
                  ).replace(/\n/g, "<br/>")}</td></tr>`;
                }
                if (s.type === "cta") {
                  const color = s.color || accent;
                  return `<tr><td style="padding:16px 24px"><a class="btn" href="${safe(
                    s.href
                  )}" style="background:${color};color:#fff" target="_blank">${safe(
                    s.label
                  )}</a></td></tr>`;
                }
                if (s.type === "divider") {
                  return `<tr><td style="padding:16px 24px"><hr style="border:none;height:1px;background:#e5e7eb"/></td></tr>`;
                }
                if (s.type === "two-col") {
                  return `<tr><td style="padding:12px 24px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="width:50%;vertical-align:top;padding-right:8px">${safe(
                    s.left
                  )}</td><td style="width:50%;vertical-align:top;padding-left:8px">${safe(
                    s.right
                  )}</td></tr></table></td></tr>`;
                }
                return "";
              })
              .join("")}
            <tr>
              <td style="padding:24px;color:#6b7280;font-size:12px">
                <div>${safe(brand.footer || "123 Main St, Fresno CA · (555) 555‑5555")}</div>
                <div><a href="#" style="color:#6b7280">Unsubscribe</a></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Get default email templates
 */
export const defaultEmailTemplates = {
  inquiry_confirmation: {
    subject: 'Thank you for contacting Kocky\'s Bar & Grill, {{customerName}}!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0;
      padding: 0;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .logo { 
      max-width: 180px; 
      height: auto;
      margin-bottom: 15px; 
    }
    .content { 
      padding: 30px; 
      background: white; 
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #d4af37;
      padding: 15px;
      margin: 20px 0;
    }
    .footer { 
      background: #2a2a2a; 
      color: #ccc; 
      padding: 20px; 
      text-align: center; 
      font-size: 13px; 
    }
    .button { 
      display: inline-block; 
      padding: 14px 35px; 
      background: #d4af37; 
      color: white; 
      text-decoration: none; 
      border-radius: 5px; 
      margin: 20px 0; 
      font-weight: 600;
    }
    .button:hover {
      background: #b8941f;
    }
    h1 { 
      margin: 0; 
      font-size: 28px; 
      font-weight: 300; 
      letter-spacing: 1px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    li:last-child {
      border-bottom: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      {{#if logoUrl}}
        <img src="{{logoUrl}}" alt="Kocky's Bar & Grill" class="logo">
      {{else}}
        <h2 style="margin: 0; font-size: 32px; font-weight: bold;">KOCKY'S</h2>
        <p style="margin: 5px 0; font-size: 14px; letter-spacing: 2px;">BAR & GRILL</p>
      {{/if}}
      <h1>Thank You for Your Inquiry!</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 16px;">Dear {{customerName}},</p>
      
      <p>We're thrilled that you're considering <strong>Kocky's Bar & Grill</strong> for your upcoming event! Your inquiry for <strong>{{serviceName}}</strong> has been received and our team is already working on creating the perfect experience for you.</p>
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #d4af37;">Your Inquiry Details:</h3>
        <ul>
          <li><strong>Service Requested:</strong> {{serviceName}}</li>
          {{#if eventDate}}<li><strong>Event Date:</strong> {{eventDate}}</li>{{/if}}
          {{#if eventLocation}}<li><strong>Location:</strong> {{eventLocation}}</li>{{/if}}
          {{#if guestCount}}<li><strong>Expected Guests:</strong> {{guestCount}}</li>{{/if}}
          {{#if confirmationCode}}<li><strong>Reference Code:</strong> <span style="color: #d4af37; font-weight: bold;">{{confirmationCode}}</span></li>{{/if}}
        </ul>
      </div>
      
      <p><strong>What happens next?</strong></p>
      <ul style="list-style: disc; padding-left: 20px;">
        <li>Our event specialist will review your requirements</li>
        <li>We'll contact you within 24 hours with a custom proposal</li>
        <li>You'll receive a detailed quote tailored to your needs</li>
      </ul>
      
      <p>Have questions? We're here to help!</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;">📞 <strong>Call us:</strong> (555) 123-4567</p>
        <p style="margin: 5px 0;">✉️ <strong>Email:</strong> info@kockys.com</p>
        <p style="margin: 5px 0;">🌐 <strong>Website:</strong> www.kockys.com</p>
      </div>
      
      <p>We're excited to be part of your special event and look forward to exceeding your expectations!</p>
      
      <p style="margin-top: 30px;">
        Warm regards,<br>
        <strong>The Kocky's Bar & Grill Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;">{{footerText}}</p>
      <p style="margin: 5px 0; font-size: 11px;">© 2024 Kocky's Bar & Grill. All rights reserved.</p>
      <p style="margin: 5px 0; font-size: 11px;">This email was sent to {{customerEmail}}</p>
    </div>
  </div>
</body>
</html>`,
    text: `Thank you for contacting Kocky's Bar & Grill!

Dear {{customerName}},

We've received your inquiry for {{serviceName}} and are excited to help make your event special!

Your Inquiry Details:
- Service: {{serviceName}}
{{#if eventDate}}- Event Date: {{eventDate}}{{/if}}
{{#if eventLocation}}- Location: {{eventLocation}}{{/if}}
{{#if guestCount}}- Expected Guests: {{guestCount}}{{/if}}
{{#if confirmationCode}}- Reference Code: {{confirmationCode}}{{/if}}

Our team will review your request and contact you within 24 hours.

Contact us:
Phone: (555) 123-4567
Email: info@kockys.com

Best regards,
The Kocky's Bar & Grill Team`,
  },
  
  quote_with_payment: {
    subject: 'Your Quote #{{quoteNumber}} - Kocky\'s Bar & Grill',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0;
      padding: 0;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .logo { 
      max-width: 180px; 
      height: auto;
      margin-bottom: 15px; 
    }
    .content { 
      padding: 30px; 
      background: white; 
    }
    .quote-box {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border: 2px solid #d4af37;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .quote-header {
      border-bottom: 2px solid #d4af37;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .quote-details {
      margin: 15px 0;
    }
    .quote-details td {
      padding: 8px 0;
    }
    .total-row {
      font-size: 20px;
      font-weight: bold;
      color: #d4af37;
      border-top: 2px solid #e0e0e0;
      padding-top: 10px;
    }
    .payment-button { 
      display: inline-block; 
      padding: 16px 40px; 
      background: linear-gradient(135deg, #28a745 0%, #218838 100%); 
      color: white; 
      text-decoration: none; 
      border-radius: 5px; 
      margin: 25px auto; 
      font-weight: 600;
      font-size: 18px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .payment-button:hover {
      background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
    }
    .footer { 
      background: #2a2a2a; 
      color: #ccc; 
      padding: 20px; 
      text-align: center; 
      font-size: 13px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      {{#if logoUrl}}
        <img src="{{logoUrl}}" alt="Kocky's Bar & Grill" class="logo">
      {{else}}
        <h2 style="margin: 0; font-size: 32px; font-weight: bold;">KOCKY'S</h2>
        <p style="margin: 5px 0; font-size: 14px; letter-spacing: 2px;">BAR & GRILL</p>
      {{/if}}
      <h1 style="margin: 10px 0; font-size: 28px; font-weight: 300;">Your Custom Quote is Ready!</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 16px;">Dear {{customerName}},</p>
      
      <p>Thank you for considering <strong>Kocky's Bar & Grill</strong> for your upcoming event. We're excited to present you with a customized quote tailored to your specific needs.</p>
      
      <div class="quote-box">
        <div class="quote-header">
          <h2 style="margin: 0; color: #1a1a1a;">Quote #{{quoteNumber}}</h2>
          <p style="margin: 5px 0; color: #666;">Valid until: {{validUntil}}</p>
        </div>
        
        <table class="quote-details" width="100%">
          <tr>
            <td><strong>Service:</strong></td>
            <td>{{serviceName}}</td>
          </tr>
          {{#if eventDate}}
          <tr>
            <td><strong>Event Date:</strong></td>
            <td>{{eventDate}}</td>
          </tr>
          {{/if}}
          {{#if eventLocation}}
          <tr>
            <td><strong>Location:</strong></td>
            <td>{{eventLocation}}</td>
          </tr>
          {{/if}}
          {{#if guestCount}}
          <tr>
            <td><strong>Guest Count:</strong></td>
            <td>{{guestCount}}</td>
          </tr>
          {{/if}}
          <tr class="total-row">
            <td><strong>Total Amount:</strong></td>
            <td>{{totalAmount}}</td>
          </tr>
        </table>
      </div>
      
      {{#if paymentLink}}
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 18px; margin-bottom: 20px;"><strong>Ready to secure your booking?</strong></p>
        <a href="{{paymentLink}}" class="payment-button">Make Secure Payment</a>
        <p style="font-size: 14px; color: #666; margin-top: 15px;">
          💳 Safe & Secure Payment Processing<br>
          🔒 256-bit SSL Encryption
        </p>
      </div>
      {{/if}}
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold;">Need to discuss this quote?</p>
        <p style="margin: 5px 0;">📞 Call us: (555) 123-4567</p>
        <p style="margin: 5px 0;">✉️ Email: info@kockys.com</p>
        <p style="margin: 5px 0;">💬 Quote Reference: {{quoteNumber}}</p>
      </div>
      
      <p><strong>Terms & Conditions:</strong></p>
      <ul style="font-size: 14px; color: #666; padding-left: 20px;">
        <li>50% deposit required to confirm booking</li>
        <li>Balance due 7 days before event</li>
        <li>Cancellation policy applies</li>
        <li>This quote is valid for 30 days</li>
      </ul>
      
      <p style="margin-top: 30px;">
        Looking forward to serving you!<br><br>
        <strong>The Kocky's Bar & Grill Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;">{{footerText}}</p>
      <p style="margin: 5px 0; font-size: 11px;">© 2024 Kocky's Bar & Grill. All rights reserved.</p>
      <p style="margin: 5px 0; font-size: 11px;">This quote was sent to {{customerEmail}}</p>
    </div>
  </div>
</body>
</html>`,
    text: `Your Quote from Kocky's Bar & Grill

Dear {{customerName}},

Thank you for considering Kocky's Bar & Grill. Here's your custom quote:

Quote #{{quoteNumber}}
Valid until: {{validUntil}}

Service: {{serviceName}}
Event Date: {{eventDate}}
Location: {{eventLocation}}
Guest Count: {{guestCount}}

TOTAL AMOUNT: {{totalAmount}}

{{#if paymentLink}}
Ready to book? Make your payment here:
{{paymentLink}}
{{/if}}

Questions? Contact us:
Phone: (555) 123-4567
Email: info@kockys.com
Quote Reference: {{quoteNumber}}

Terms: 50% deposit required. Balance due 7 days before event.

Best regards,
The Kocky's Bar & Grill Team`,
  },
};
