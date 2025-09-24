/**
 * Quote Email Template Service
 * 
 * Provides modern, responsive HTML email templates for quote emails
 */

interface QuoteEmailData {
  customerName: string;
  quoteNumber: string;
  serviceType?: string;
  eventDate?: string;
  validUntil: string;
  subtotal: string;
  tax: string;
  gratuity: string;
  total: string;
  deposit?: string;
  terms?: string;
  message?: string;
  stripePaymentLink: string;
  unsubscribeLink: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
}

/**
 * Generate modern HTML email template for quotes
 */
export const generateQuoteEmailHTML = (data: QuoteEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Quote from Kocky's Bar & Grill</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 640px;
      margin: 30px auto;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #e63946 0%, #fca311 100%);
      color: #fff;
      padding: 30px 20px;
      text-align: center;
      position: relative;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
      z-index: 1;
    }
    .header .subtitle {
      margin: 8px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #2c3e50;
    }
    .quote-summary {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 10px;
      margin: 25px 0;
      border-left: 4px solid #e63946;
    }
    .quote-details {
      display: grid;
      gap: 12px;
      margin-bottom: 20px;
    }
    .quote-detail {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .quote-detail:last-child {
      border-bottom: none;
    }
    .quote-detail strong {
      color: #2c3e50;
      font-weight: 600;
    }
    .quote-breakdown {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      margin: 20px 0;
    }
    .breakdown-title {
      color: #e63946;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 15px 0;
      text-align: center;
    }
    .breakdown-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f1f3f4;
    }
    .breakdown-row:last-child {
      border-bottom: none;
    }
    .breakdown-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      font-size: 20px;
      font-weight: 700;
      color: #e63946;
      border-top: 2px solid #e63946;
      margin-top: 15px;
    }
    .deposit-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      color: #fca311;
      font-weight: 600;
      background: #fff8e1;
      padding: 12px 15px;
      border-radius: 6px;
      margin-top: 10px;
    }
    .payment-section {
      text-align: center;
      margin: 30px 0;
      padding: 25px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 10px;
    }
    .payment-title {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 15px;
    }
    .payment-description {
      color: #6c757d;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .pay-button {
      display: inline-block;
      background: linear-gradient(135deg, #e63946 0%, #d62828 100%);
      color: #fff;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pay-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(230, 57, 70, 0.4);
    }
    .fallback-payment {
      margin-top: 15px;
      font-size: 14px;
      color: #6c757d;
    }
    .fallback-payment a {
      color: #e63946;
      text-decoration: none;
    }
    .contact-info {
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
      border-left: 4px solid #2196f3;
    }
    .contact-info h3 {
      margin: 0 0 10px 0;
      color: #1976d2;
      font-size: 16px;
    }
    .contact-info p {
      margin: 5px 0;
      color: #424242;
    }
    .footer {
      background: #2c3e50;
      color: #ecf0f1;
      text-align: center;
      padding: 25px 20px;
      font-size: 14px;
    }
    .footer a {
      color: #fca311;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .company-info {
      margin-bottom: 15px;
    }
    .unsubscribe {
      font-size: 12px;
      opacity: 0.8;
    }
    @media (max-width: 600px) {
      .container {
        margin: 10px;
        border-radius: 8px;
      }
      .header {
        padding: 20px 15px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 25px 20px;
      }
      .quote-breakdown {
        padding: 15px;
      }
      .pay-button {
        padding: 14px 24px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Kocky's Bar & Grill</h1>
      <div class="subtitle">Your Professional Quote</div>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hello ${data.customerName},
      </div>
      
      <p>Thank you for considering <strong>Kocky's Bar & Grill</strong> for your upcoming event. We're excited to provide you with a detailed quote for our services.</p>
      
      <div class="quote-summary">
        <div class="quote-details">
          <div class="quote-detail">
            <strong>Quote Number:</strong>
            <span>${data.quoteNumber}</span>
          </div>
          ${data.serviceType ? `
          <div class="quote-detail">
            <strong>Service Type:</strong>
            <span>${data.serviceType}</span>
          </div>
          ` : ''}
          ${data.eventDate ? `
          <div class="quote-detail">
            <strong>Event Date:</strong>
            <span>${data.eventDate}</span>
          </div>
          ` : ''}
          <div class="quote-detail">
            <strong>Valid Until:</strong>
            <span>${data.validUntil}</span>
          </div>
        </div>
      </div>
      
      <div class="quote-breakdown">
        <div class="breakdown-title">Quote Breakdown</div>
        
        ${data.items && data.items.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Service Items</h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Description</th>
                <th style="padding: 15px; text-align: center; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Qty</th>
                <th style="padding: 15px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Unit Price</th>
                <th style="padding: 15px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item, index) => `
              <tr style="${index % 2 === 0 ? 'background-color: #f8f9fa;' : 'background-color: #fff;'}">
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #333; font-weight: 500;">${item.description}</td>
                <td style="padding: 15px; text-align: center; border-bottom: 1px solid #e9ecef; color: #666;">${item.quantity}</td>
                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e9ecef; color: #666;">$${item.unitPrice}</td>
                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e9ecef; color: #333; font-weight: 600;">$${item.total}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <div style="border-top: 2px solid #e9ecef; padding-top: 20px;">
          <div class="breakdown-row">
            <span>Subtotal:</span>
            <span>${data.subtotal}</span>
          </div>
          
          ${data.tax && data.tax !== '$0.00' ? `
          <div class="breakdown-row">
            <span>Tax:</span>
            <span>${data.tax}</span>
          </div>
          ` : ''}
          
          ${data.gratuity && data.gratuity !== '$0.00' ? `
          <div class="breakdown-row">
            <span>Gratuity:</span>
            <span>${data.gratuity}</span>
          </div>
          ` : ''}
          
          <div class="breakdown-total">
            <span>Total Amount:</span>
            <span>${data.total}</span>
          </div>
          
          ${data.deposit ? `
          <div class="deposit-row">
            <span>Deposit Required:</span>
            <span>${data.deposit}</span>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="payment-section">
        <div class="payment-title">💳 Secure Online Payment</div>
        <div class="payment-description">
          You can download a PDF version of this quote from the attachment, or pay securely online using the button below:
        </div>
        <a href="${data.stripePaymentLink}" class="pay-button">Pay Now</a>
        <div class="fallback-payment">
          Having trouble with the button? <a href="${data.stripePaymentLink}">Click here to pay</a>
        </div>
      </div>
      
      <div class="contact-info">
        <h3>📞 Questions or Need Help?</h3>
        <p>If you have any questions about this quote or need to make changes, please don't hesitate to contact us:</p>
        <p><strong>Phone:</strong> (559) 266-5500</p>
        <p><strong>Email:</strong> info@kockys.com</p>
        <p><strong>Address:</strong> 1231 Van Ness Ave, Fresno, CA 93721</p>
      </div>
      
      ${data.terms ? `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #6c757d;">
        <strong>Terms & Conditions:</strong><br>
        ${data.terms}
      </div>
      ` : ''}
      
      ${data.message ? `
      <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745;">
        <strong>Additional Notes:</strong><br>
        ${data.message}
      </div>
      ` : ''}
      
      <p style="text-align: center; margin: 30px 0; font-size: 16px; color: #2c3e50;">
        We look forward to making your event memorable! 🍻
      </p>
      
      <p style="text-align: center; margin: 20px 0;">
        Best regards,<br>
        <strong>The Kocky's Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <div class="company-info">
        <strong>Kocky's Bar & Grill</strong><br>
        1231 Van Ness Ave, Fresno, CA 93721<br>
        Phone: (559) 266-5500 | Email: info@kockys.com
      </div>
      <div class="unsubscribe">
        <a href="${data.unsubscribeLink}">Unsubscribe</a> | 
        <a href="${process.env.APP_BASE_URL || 'https://staging.kockys.com'}">Visit Our Website</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate plain text version of quote email
 */
export const generateQuoteEmailText = (data: QuoteEmailData): string => {
  return `
Your Quote from Kocky's Bar & Grill

Hello ${data.customerName},

Thank you for considering Kocky's Bar & Grill for your upcoming event. We're excited to provide you with a detailed quote for our services.

QUOTE DETAILS:
==============
Quote Number: ${data.quoteNumber}
${data.serviceType ? `Service Type: ${data.serviceType}` : ''}
${data.eventDate ? `Event Date: ${data.eventDate}` : ''}
Valid Until: ${data.validUntil}

${data.items && data.items.length > 0 ? `SERVICE ITEMS:
================
${data.items.map(item => `- ${item.description} (Qty: ${item.quantity}) - $${item.unitPrice} each = $${item.total}`).join('\n')}

` : ''}QUOTE BREAKDOWN:
================
Subtotal: ${data.subtotal}
${data.tax && data.tax !== '$0.00' ? `Tax: ${data.tax}` : ''}
${data.gratuity && data.gratuity !== '$0.00' ? `Gratuity: ${data.gratuity}` : ''}
Total Amount: ${data.total}
${data.deposit ? `Deposit Required: ${data.deposit}` : ''}

PAYMENT:
========
You can download a PDF version of this quote from the attachment, or pay securely online using the link below:

Pay Now: ${data.stripePaymentLink}

CONTACT INFORMATION:
===================
Phone: (559) 266-5500
Email: info@kockys.com
Address: 1231 Van Ness Ave, Fresno, CA 93721

${data.terms ? `TERMS & CONDITIONS:\n${data.terms}\n` : ''}
${data.message ? `ADDITIONAL NOTES:\n${data.message}\n` : ''}

We look forward to making your event memorable! 🍻

Best regards,
The Kocky's Team

---
Kocky's Bar & Grill
1231 Van Ness Ave, Fresno, CA 93721
Phone: (559) 266-5500 | Email: info@kockys.com

Unsubscribe: ${data.unsubscribeLink}
  `;
};
