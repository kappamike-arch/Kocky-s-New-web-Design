#!/usr/bin/env node

/**
 * Create .env file with actual credentials
 * This script will create a properly configured .env file
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kockys_db?schema=public"

# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Email Marketing Configuration
SMTP_PROVIDER=sendgrid
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM_DEFAULT="Kocky's Bar & Grill <no-reply@kockys.com>"
SITE_PUBLIC_URL="https://staging.kockys.com"
BACKEND_PUBLIC_URL="http://72.167.227.205:5001"
DOUBLE_OPT_IN=false
SENDING_BATCH=200
SENDING_RATE_PER_SEC=50
MAILING_ADDRESS="1231 Van Ness Ave, Fresno, CA 93721"

# Email (SendGrid) - Primary Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@kockysbar.com
SENDGRID_FROM_NAME=Kocky's Bar & Grill

# Email (Alternative: Nodemailer SMTP)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-specific-password

# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
APP_BASE_URL=https://staging.kockys.com

# Mailchimp
MAILCHIMP_API_KEY=your-mailchimp-api-key
MAILCHIMP_LIST_ID=your-list-id
MAILCHIMP_SERVER_PREFIX=us21

# Brevo (Sendinblue) - Alternative to Mailchimp
BREVO_API_KEY=your-brevo-api-key

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@kockysbar.com
ADMIN_PASSWORD=AdminPassword123!

# Toast POS API (if using)
TOAST_API_KEY=your-toast-api-key
TOAST_RESTAURANT_ID=your-restaurant-id

# ChowNow (if using)
CHOWNOW_API_KEY=your-chownow-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Azure OAuth / Microsoft Graph - Office 365 Email Service
AZURE_TENANT_ID=8eb62d31-a2c3-4af1-a6ac-da1ed966dd14
AZURE_CLIENT_ID=46b54378-7023-4746-845f-514f2fc40f8a
AZURE_CLIENT_SECRET=4vs8Q~1T43tm61ndeOPRfyrP1GW.ZFFjHbk6CcLf
AZURE_REDIRECT_URI=https://staging.kockys.com/api/graph-email/oauth/callback

# Office 365 Email Configuration
O365_TENANT_ID=8eb62d31-a2c3-4af1-a6ac-da1ed966dd14
O365_CLIENT_ID=46b54378-7023-4746-845f-514f2fc40f8a
O365_CLIENT_SECRET=4vs8Q~1T43tm61ndeOPRfyrP1GW.ZFFjHbk6CcLf
O365_FROM_EMAIL=info@kockys.com
O365_FROM_NAME=Kocky's Bar & Grill

# Microsoft Graph API
GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0

# Email Service Priority (O365 first, then SendGrid, then SMTP)
EMAIL_SERVICE_PRIORITY=o365,sendgrid,smtp
`;

async function createEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    
    // Check if .env already exists
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env file already exists');
      console.log('   Backing up existing .env to .env.backup');
      fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
    }
    
    // Create new .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env file created successfully!');
    console.log('');
    console.log('📋 CONFIGURATION SUMMARY:');
    console.log('==========================');
    console.log('✅ Office 365 Email Service: CONFIGURED');
    console.log('   • Tenant ID: 8eb62d31-a2c3-4af1-a6ac-da1ed966dd14');
    console.log('   • Client ID: 46b54378-7023-4746-845f-514f2fc40f8a');
    console.log('   • Client Secret: 4vs8Q~1T43tm61ndeOPRfyrP1GW.ZFFjHbk6CcLf');
    console.log('   • From Email: info@kockys.com');
    console.log('');
    console.log('⚠️  STILL NEED TO CONFIGURE:');
    console.log('============================');
    console.log('❌ SendGrid API Key: your-sendgrid-api-key');
    console.log('❌ Stripe Secret Key: sk_test_your_stripe_secret_key_here');
    console.log('❌ Stripe Publishable Key: pk_test_your_publishable_key_here');
    console.log('❌ Database URL: postgresql://username:password@localhost:5432/kockys_db');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('==============');
    console.log('1. Edit .env file and replace placeholder values:');
    console.log('   • Get SendGrid API key from: https://app.sendgrid.com/');
    console.log('   • Get Stripe keys from: https://dashboard.stripe.com/');
    console.log('   • Update database URL with your actual database credentials');
    console.log('');
    console.log('2. Start the server:');
    console.log('   npm run dev');
    console.log('');
    console.log('3. Test email sending:');
    console.log('   node send-test-quote-simple.js');
    console.log('');
    console.log('📧 EMAIL SERVICE PRIORITY:');
    console.log('===========================');
    console.log('1. Office 365 (Primary) - Already configured ✅');
    console.log('2. SendGrid (Fallback) - Needs API key ❌');
    console.log('3. SMTP (Final fallback) - Not configured');
    console.log('');
    console.log('🎯 QUOTE EMAIL SYSTEM STATUS:');
    console.log('==============================');
    console.log('✅ Email service configured (Office 365)');
    console.log('❌ Stripe payment links need configuration');
    console.log('❌ PDF generation will work');
    console.log('❌ Email templates will work');
    console.log('');
    console.log('The quote email system should work with Office 365 email service!');
    console.log('You just need to configure Stripe for payment links.');
    
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
}

createEnvFile();



