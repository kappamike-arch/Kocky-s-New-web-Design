# Production-Grade "Send Quote" Flow Implementation

This document describes the complete implementation of a production-grade quote sending system that emails modern HTML quotes with Stripe Checkout links and PDF attachments.

## 🎯 Overview

The implementation provides a comprehensive quote sending flow that includes:

1. **Stripe Checkout Integration** - Idempotent payment session creation
2. **Modern HTML Email Templates** - Professional quote email design
3. **PDF Attachments** - Automated quote PDF generation
4. **Centralized Email System** - Multi-provider email delivery
5. **Database Persistence** - Stripe session tracking
6. **Comprehensive Testing** - Test scripts and validation

## 📁 File Structure

```
backend/src/
├── services/
│   ├── stripe/
│   │   └── quoteCheckout.service.ts     # Stripe checkout session management
│   ├── quoteEmail.composer.ts           # Email composition and sending
│   ├── quote.service.ts                 # Updated with sendQuoteEmail method
│   └── pdf.service.ts                   # Existing PDF generation (reused)
├── utils/
│   └── email.ts                         # Updated with quote template & attachments
├── controllers/
│   └── quote.controller.ts              # Updated with new sendQuote endpoint
└── scripts/
    ├── test-send-quote.ts               # TypeScript test script
    └── test-send-quote.sh               # Bash test script
```

## 🔧 Environment Variables

Ensure these environment variables are configured in your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application URLs
APP_BASE_URL=https://staging.kockys.com

# Email Configuration
EMAIL_FROM_NAME="Kocky's Bar & Grill"
EMAIL_FROM_ADDRESS=info@kockys.com
BRAND_LOGO_URL=https://staging.kockys.com/uploads/logos/logo.png
BRAND_PRIMARY_COLOR=#f97316

# Email Service (choose one)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@kockysbar.com
SENDGRID_FROM_NAME="Kocky's Bar & Grill"

# OR SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

## 🚀 API Endpoint

### POST /api/quotes/:id/send

Send a quote email with Stripe checkout and PDF attachment.

**Request Body:**
```json
{
  "mode": "deposit" | "full"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quote sent successfully",
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_...",
  "sessionId": "cs_..."
}
```

**Example Usage:**
```bash
curl -X POST "https://staging.kockys.com/api/quotes/quote-id-123/send" \
  -H "Content-Type: application/json" \
  -d '{"mode":"deposit"}'
```

## 🧪 Testing

### Using the Test Scripts

1. **TypeScript Test Script:**
```bash
cd backend
npm run test:send-quote "quote-id-123" deposit
```

2. **Bash Test Script:**
```bash
cd backend/scripts
./test-send-quote.sh "quote-id-123" deposit
```

### Manual Testing

1. **Create a test quote** in your database
2. **Call the API endpoint** with the quote ID
3. **Check your email** for the quote with PDF attachment
4. **Test the Stripe checkout link** to ensure it works
5. **Verify database updates** for session tracking

## 📧 Email Template Features

The quote email template includes:

- **Professional Design** - Modern HTML layout with Kocky's branding
- **Quote Details** - Service type, event date, valid until date
- **Financial Summary** - Subtotal, tax, gratuity, total, deposit
- **Payment Button** - Direct link to Stripe Checkout
- **PDF Attachment** - Professional quote PDF
- **Contact Information** - Business details and next steps

## 💳 Stripe Integration

### Features

- **Idempotent Sessions** - Prevents duplicate payment sessions
- **Deposit/Full Payment** - Supports both payment modes
- **Metadata Tracking** - Quote ID, customer email, payment mode
- **Success/Cancel URLs** - Proper redirect handling
- **Webhook Integration** - Existing webhook system handles payment events

### Payment Flow

1. **Create Checkout Session** - Generate Stripe checkout URL
2. **Email with Link** - Send quote with payment button
3. **Customer Payment** - Customer completes payment on Stripe
4. **Webhook Processing** - Update quote status via webhook
5. **Database Updates** - Persist payment information

## 📄 PDF Generation

The PDF service generates professional quote documents with:

- **Company Branding** - Kocky's logo and colors
- **Customer Information** - Name, email, phone, company
- **Event Details** - Service type, date, time, location
- **Quote Items** - Detailed line items with quantities and prices
- **Financial Summary** - Subtotal, tax, gratuity, total, deposit
- **Terms & Conditions** - Custom terms and notes

## 🔒 Security Features

- **Input Validation** - Validates payment mode and quote existence
- **Email Validation** - Ensures customer email is present
- **Idempotency Keys** - Prevents duplicate Stripe sessions
- **Error Handling** - Comprehensive error logging and user feedback
- **Template Security** - No fallback to generic templates for quotes

## 📊 Logging & Monitoring

The system includes comprehensive logging for:

- **Template Selection** - Debug logging for email template routing
- **Email Delivery** - Success/failure logging with provider details
- **Stripe Operations** - Session creation and payment tracking
- **PDF Generation** - Attachment creation and file handling
- **Error Tracking** - Detailed error messages for troubleshooting

## 🐛 Troubleshooting

### Common Issues

1. **"Welcome" Email Instead of Quote**
   - **Cause:** Template routing fallback
   - **Fix:** Ensure template="quote" is explicitly passed

2. **Missing PDF Attachment**
   - **Cause:** PDF generation or email service issue
   - **Fix:** Check PDF service and email provider configuration

3. **Stripe Checkout Not Working**
   - **Cause:** Invalid Stripe configuration or session creation
   - **Fix:** Verify Stripe keys and webhook configuration

4. **Email Not Sending**
   - **Cause:** Email service configuration issue
   - **Fix:** Check SendGrid/SMTP credentials and configuration

### Debug Steps

1. **Check Server Logs** - Look for detailed error messages
2. **Verify Environment Variables** - Ensure all required vars are set
3. **Test Email Service** - Use existing email test endpoints
4. **Validate Quote Data** - Ensure quote has required customer information
5. **Check Stripe Dashboard** - Verify session creation and payment status

## 🔄 Database Schema Updates

The implementation uses existing database fields:

- `stripeSessionId` - Stores Stripe checkout session ID
- `stripeCheckoutUrl` - Stores the checkout URL
- `paymentLink` - Legacy field, also stores checkout URL
- `status` - Updated to 'SENT' when quote is emailed

## 🎉 Success Criteria

A successful implementation should deliver:

✅ **Modern HTML Email** - Professional quote template (not "welcome")  
✅ **Stripe Checkout Link** - Working payment button  
✅ **PDF Attachment** - Quote-{number}.pdf file attached  
✅ **Database Updates** - Session ID and checkout URL persisted  
✅ **Webhook Integration** - Payment status updates via existing webhooks  
✅ **Error Handling** - Proper error messages and logging  
✅ **Testing Tools** - Working test scripts for validation  

## 📞 Support

For issues or questions about this implementation:

1. **Check the logs** for detailed error messages
2. **Run the test scripts** to validate functionality
3. **Verify environment configuration** matches requirements
4. **Test individual components** (email, Stripe, PDF) separately

The implementation is designed to be robust, maintainable, and production-ready with comprehensive error handling and logging throughout the entire flow.




