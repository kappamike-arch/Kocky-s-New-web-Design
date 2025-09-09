export const emailTemplates = {
  // Inquiry confirmation email
  inquiryConfirmation: (data: {
    name: string;
    confirmationCode: string;
    serviceType: string;
    eventDate?: string;
  }) => ({
    subject: `Thank you for your inquiry - Kocky's Bar & Grill`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .logo { max-width: 200px; margin-bottom: 10px; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://your-domain.com/logo.png" alt="Kocky's Bar & Grill" class="logo">
            <h1>Thank You for Your Inquiry!</h1>
          </div>
          <div class="content">
            <p>Dear ${data.name},</p>
            <p>We've received your inquiry for our <strong>${data.serviceType}</strong> service.</p>
            ${data.eventDate ? `<p><strong>Event Date:</strong> ${data.eventDate}</p>` : ''}
            <p><strong>Confirmation Code:</strong> ${data.confirmationCode}</p>
            <p>Our team will review your request and get back to you within 24 hours with a detailed quote.</p>
            <p>If you have any immediate questions, please don't hesitate to contact us at (555) 123-4567.</p>
            <p>Best regards,<br>The Kocky's Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Kocky's Bar & Grill | 123 Main Street, City, State 12345</p>
            <p>This email was sent because you submitted an inquiry on our website.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Quote email with payment link
  quoteWithPayment: (data: {
    name: string;
    quoteNumber: string;
    eventDate?: string;
    serviceType: string;
    totalAmount: number;
    depositAmount: number;
    paymentLink: string;
    quoteDetails: string;
    validUntil: string;
  }) => ({
    subject: `Your Quote #${data.quoteNumber} - Kocky's Bar & Grill`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px; text-align: center; }
          .logo { max-width: 200px; margin-bottom: 10px; }
          .content { padding: 30px; background: #f9f9f9; }
          .quote-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .amount-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; font-size: 18px; color: #ff6b35; }
          .payment-button { display: inline-block; padding: 15px 40px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; font-weight: bold; }
          .deposit-button { background: #ff6b35; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://your-domain.com/logo.png" alt="Kocky's Bar & Grill" class="logo">
            <h1>Your Custom Quote</h1>
            <p>Quote #${data.quoteNumber}</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.name},</p>
            <p>Thank you for choosing Kocky's Bar & Grill for your ${data.serviceType} needs!</p>
            
            <div class="quote-box">
              <h2>Quote Details</h2>
              ${data.eventDate ? `<p><strong>Event Date:</strong> ${data.eventDate}</p>` : ''}
              <p><strong>Service:</strong> ${data.serviceType}</p>
              
              <div style="margin: 20px 0;">
                ${data.quoteDetails}
              </div>
              
              <div class="amount-row total-row">
                <span>Total Amount:</span>
                <span>$${data.totalAmount.toFixed(2)}</span>
              </div>
              
              ${data.depositAmount > 0 ? `
              <div class="amount-row">
                <span>Deposit Required:</span>
                <span>$${data.depositAmount.toFixed(2)}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="info-box">
              <strong>📅 Quote Valid Until:</strong> ${data.validUntil}<br>
              <strong>💳 Secure Payment Available:</strong> Pay online with card
            </div>
            
            <center>
              ${data.depositAmount > 0 ? `
                <a href="${data.paymentLink}?amount=${data.depositAmount * 100}" class="payment-button deposit-button">
                  Pay Deposit ($${data.depositAmount.toFixed(2)})
                </a>
                <br>
                <a href="${data.paymentLink}?amount=${data.totalAmount * 100}" class="payment-button">
                  Pay Full Amount ($${data.totalAmount.toFixed(2)})
                </a>
              ` : `
                <a href="${data.paymentLink}?amount=${data.totalAmount * 100}" class="payment-button">
                  Pay Now ($${data.totalAmount.toFixed(2)})
                </a>
              `}
            </center>
            
            <p><strong>Payment Options:</strong></p>
            <ul>
              <li>Pay securely online using the button above</li>
              <li>Call us at (555) 123-4567 to pay by phone</li>
              <li>Visit us in person at 123 Main Street</li>
            </ul>
            
            <p>If you have any questions about this quote, please don't hesitate to contact us.</p>
            
            <p>We look forward to serving you!</p>
            <p>Best regards,<br>The Kocky's Team</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Kocky's Bar & Grill | 123 Main Street, City, State 12345</p>
            <p>Phone: (555) 123-4567 | Email: info@kockysbar.com</p>
            <p>This quote is subject to our terms and conditions.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Payment confirmation email
  paymentConfirmation: (data: {
    name: string;
    amount: number;
    paymentId: string;
    quoteNumber?: string;
  }) => ({
    subject: `Payment Confirmation - Kocky's Bar & Grill`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: #fff; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Successful!</h1>
          </div>
          
          <div class="content">
            <p>Dear ${data.name},</p>
            
            <div class="success-box">
              <h2>Payment Received</h2>
              <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
              <p><strong>Transaction ID:</strong> ${data.paymentId}</p>
              ${data.quoteNumber ? `<p><strong>Quote Number:</strong> ${data.quoteNumber}</p>` : ''}
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Thank you for your payment! Your booking is confirmed.</p>
            <p>You will receive a receipt from our payment processor shortly.</p>
            
            <p>If you have any questions, please contact us at (555) 123-4567.</p>
            
            <p>Best regards,<br>The Kocky's Team</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Kocky's Bar & Grill | 123 Main Street, City, State 12345</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};
