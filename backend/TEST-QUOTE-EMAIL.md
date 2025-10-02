# Quote Email Test Script

## Overview
The `test-send-quote-email.js` script tests the complete quote email functionality to ensure all components work correctly together.

## What It Tests

### ✅ PDF Generation
- Generates a PDF using `pdf.service.ts`
- Attaches the PDF to the email
- Reports PDF size in KB

### ✅ Stripe Checkout Session
- Creates a Stripe checkout session using `utils/payment.ts`
- Generates a "Pay Now" button URL
- Displays the checkout URL for verification

### ✅ Email Template Rendering
- Tests quote items rendering in email template
- Verifies all quote details are included
- Checks that Stripe link is properly embedded

### ✅ Email Sending
- Sends email using configured service (Office 365/SendGrid)
- Includes PDF attachment
- Sends to test email address

## Test Data

The script uses the following test quote:
- **Quote Number**: Q-TEST-1234
- **Customer**: Michael Smith (kappamike@gmail.com)
- **Service Type**: Catering
- **Items**:
  - Bartender (2x $30 = $60)
  - Food Service (1x $500 = $500)
  - Setup & Cleanup (1x $200 = $200)
  - Gratuity 20% (1x $200 = $200)
- **Total**: $960
- **Valid Until**: 2025-10-06

## How to Run

```bash
cd backend
node test-send-quote-email.js
```

## Expected Output

```
============================================================
🧪 QUOTE EMAIL FLOW TEST
============================================================

ℹ️  Creating mock quote data...
✅ Mock quote created: Q-TEST-1234

📄 TEST 1: PDF GENERATION
ℹ️  Testing PDF generation...
✅ PDF generated successfully: quote-Q-TEST-1234.pdf (45 KB)

💳 TEST 2: STRIPE CHECKOUT
ℹ️  Testing Stripe checkout session creation...
✅ Stripe checkout session created: cs_test_1234567890
ℹ️  Checkout URL: https://checkout.stripe.com/pay/cs_test_1234567890

📧 TEST 3: EMAIL TEMPLATE
ℹ️  Testing email template rendering...
✅ Email template rendering successful
ℹ️  Template includes: 4 items, Stripe link, quote details

📤 TEST 4: EMAIL SENDING
ℹ️  Testing email sending...
✅ Email sent successfully
ℹ️  Recipient: kappamike@gmail.com
ℹ️  Subject: Test Quote Q-TEST-1234 — Kocky's
ℹ️  PDF attached: quote-Q-TEST-1234.pdf (45 KB)

============================================================
🎉 TEST RESULTS SUMMARY
============================================================
✅ PDF Generation: quote-Q-TEST-1234.pdf (45 KB)
✅ Stripe Checkout: cs_test_1234567890
✅ Email Template: Rendered with 4 items
✅ Email Sending: Sent to Michael Smith
ℹ️  Total Duration: 3 seconds

✅ ALL TESTS PASSED! Quote email flow is working correctly.
```

## Error Handling

If any step fails, the script will:
- ❌ Display a clear error message
- Show which tests passed/failed
- Exit with code 1
- Provide stack trace for debugging

## Prerequisites

Make sure these environment variables are configured:
- `STRIPE_SECRET_KEY` - For Stripe checkout sessions
- `SENDGRID_API_KEY` or `SMTP_*` - For email sending
- `APP_BASE_URL` - For success/cancel URLs

## Troubleshooting

### PDF Generation Fails
- Check if `pdfkit` is installed
- Verify file system permissions

### Stripe Checkout Fails
- Verify `STRIPE_SECRET_KEY` is set
- Check Stripe API connectivity

### Email Sending Fails
- Verify email service credentials
- Check SMTP/SendGrid configuration
- Ensure test email address is valid

### Template Rendering Fails
- Check if quote items are properly formatted
- Verify template includes all required data



