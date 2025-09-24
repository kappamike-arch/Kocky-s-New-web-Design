#!/usr/bin/env node

/**
 * Create .env File Script
 * This script creates a basic .env file for email configuration
 */

const fs = require('fs');
const path = require('path');

function createEnvFile() {
  console.log("📧 CREATING .ENV FILE FOR EMAIL CONFIGURATION");
  console.log("==============================================\n");

  const envContent = `# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=5001
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Email Configuration
EMAIL_FROM_ADDRESS=quotes@kockys.com
EMAIL_FROM_NAME=Kocky's Bar & Grill

# SendGrid Configuration (PRIORITY 1 - Most reliable)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@kockysbar.com
SENDGRID_FROM_NAME=Kocky's Bar & Grill

# SMTP Configuration (FALLBACK)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_SECURE=false

# Office 365 Configuration (FALLBACK)
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_GRAPH_SCOPE=https://graph.microsoft.com/.default

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URLs
APP_BASE_URL=https://staging.kockys.com
FRONTEND_URL=https://staging.kockys.com`;

  const envPath = path.join(__dirname, '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file created successfully!");
    console.log(`📁 Location: ${envPath}`);
    
    console.log("\n🔧 NEXT STEPS:");
    console.log("==============");
    console.log("1. Edit the .env file and replace the placeholder values:");
    console.log("   - SENDGRID_API_KEY: Get from SendGrid dashboard");
    console.log("   - SENDGRID_FROM_EMAIL: Use a verified sender email");
    console.log("   - SMTP_USER/PASS: Use your email credentials");
    console.log("   - STRIPE_SECRET_KEY: Get from Stripe dashboard");
    
    console.log("\n2. Restart the server:");
    console.log("   npm run build && node -r dotenv/config dist/server.js -p 5001");
    
    console.log("\n3. Test the email system:");
    console.log("   node check-server-status.js");
    
    console.log("\n💡 EMAIL SERVICE RECOMMENDATIONS:");
    console.log("=================================");
    console.log("• SendGrid: Best for production, reliable delivery");
    console.log("• Gmail SMTP: Good for testing, requires app password");
    console.log("• Office 365: Good for business emails");
    
  } catch (error) {
    console.error("❌ Failed to create .env file:", error.message);
    console.log("\n💡 Manual creation:");
    console.log("1. Create a file named '.env' in the backend directory");
    console.log("2. Copy the content above into the file");
    console.log("3. Replace placeholder values with your actual credentials");
  }
}

createEnvFile();

