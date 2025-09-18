cmfkmqf770000bckui90kr73c|inquiry_confirmation|Thank you for contacting Kocky's Bar & Grill, {{customerName}}!|
<!DOCTYPE html>
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
      {{#if logoUrl}}<img src="{{logoUrl}}" alt="Kocky's Bar & Grill" class="logo">{{/if}}
      <h1>Thank You for Your Inquiry!</h1>
    </div>
    <div class="content">
      <p>Dear {{customerName}},</p>
      <p>We've received your inquiry for <strong>{{serviceName}}</strong> and are excited to help make your event special!</p>
      
      <h3>Your Inquiry Details:</h3>
      <ul>
        <li><strong>Service:</strong> {{serviceName}}</li>
        {{#if eventDate}}<li><strong>Event Date:</strong> {{eventDate}}</li>{{/if}}
        {{#if eventLocation}}<li><strong>Location:</strong> {{eventLocation}}</li>{{/if}}
        {{#if guestCount}}<li><strong>Expected Guests:</strong> {{guestCount}}</li>{{/if}}
        {{#if confirmationCode}}<li><strong>Confirmation Code:</strong> {{confirmationCode}}</li>{{/if}}
      </ul>
      
      <p>Our team will review your request and contact you within 24 hours with more information and pricing.</p>
      
      <p>If you have any immediate questions, feel free to reach out:</p>
      <ul>
        <li>📞 Phone: (555) 123-4567</li>
        <li>✉️ Email: info@kockys.com</li>
      </ul>
      
      <p>We look forward to serving you!</p>
      
      <p>Best regards,<br>
      The Kocky's Bar & Grill Team</p>
    </div>
    <div class="footer">
      {{footerText}}
      <br>
      © 2024 Kocky's Bar & Grill. All rights reserved.
    </div>
  </div>
</body>
</html>|Thank you for contacting Kocky's Bar & Grill!

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
The Kocky's Bar & Grill Team|["customerName","customerEmail","serviceName","eventDate","eventLocation","guestCount","confirmationCode"]|/api/uploads/logos/kockys-logo.png|Kocky's Bar & Grill | 123 Main Street, City | (555) 123-4567||1|1757910852980|1757910852980
cmfkmqf7l0001bckuxvmt5gr1|quote_sent|Your Quote #{{quoteNumber}} from Kocky's Bar & Grill|
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
    .logo { max-width: 200px; margin-bottom: 10px; }
    .content { padding: 20px; background: #f9f9f9; }
    .quote-box { background: white; padding: 15px; border: 1px solid #ddd; margin: 15px 0; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #d4af37; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .payment-button { background: #28a745; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      {{#if logoUrl}}<img src="{{logoUrl}}" alt="Kocky's Bar & Grill" class="logo">{{/if}}
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
      
      {{#if paymentLink}}
      <center>
        <a href="{{paymentLink}}" class="button payment-button">Make Payment</a>
      </center>
      {{/if}}
      
      <p>Or contact us directly:</p>
      <ul>
        <li>📞 Phone: (555) 123-4567</li>
        <li>✉️ Email: info@kockys.com</li>
      </ul>
      
      <p>We look forward to serving you!</p>
      
      <p>Best regards,<br>
      The Kocky's Bar & Grill Team</p>
    </div>
    <div class="footer">
      {{footerText}}
      <br>
      © 2024 Kocky's Bar & Grill. All rights reserved.
    </div>
  </div>
</body>
</html>||["customerName","serviceName","eventDate","quoteNumber","totalAmount","paymentLink"]|/api/uploads/logos/kockys-logo.png|Kocky's Bar & Grill | 123 Main Street, City | (555) 123-4567|https://payment.kockys.com/pay/{{quoteNumber}}|1|1757910852993|1757910852993
cmfkn7jqn0002bcku5za395gu|Test Template|Test Subject|&lt;h1&gt;Test&lt;&#x2F;h1&gt;|Test|[]||||1|1757911652015|1757911652015
