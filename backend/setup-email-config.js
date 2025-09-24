#!/usr/bin/env node

/**
 * Email Configuration Setup Script
 * 
 * This script helps set up email configuration for the quote system
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEmailConfig() {
  console.log("📧 EMAIL CONFIGURATION SETUP");
  console.log("============================\n");
  
  console.log("This script will help you set up email configuration for the quote system.");
  console.log("You need at least ONE of the following email services configured:\n");
  
  console.log("1. SendGrid (Recommended for production)");
  console.log("2. SMTP (Gmail, Outlook, etc.)");
  console.log("3. Office 365 / Microsoft Graph\n");
  
  const envContent = [];
  
  // Basic configuration
  envContent.push("# Database");
  envContent.push('DATABASE_URL="file:./dev.db"');
  envContent.push("");
  envContent.push("# Server");
  envContent.push("PORT=5001");
  envContent.push("NODE_ENV=production");
  envContent.push("");
  envContent.push("# JWT");
  envContent.push("JWT_SECRET=your-super-secret-jwt-key-change-this");
  envContent.push("JWT_EXPIRE=7d");
  envContent.push("");
  
  // Email configuration
  envContent.push("# Email Configuration");
  envContent.push("EMAIL_FROM_ADDRESS=quotes@kockys.com");
  envContent.push("EMAIL_FROM_NAME=Kocky's Bar & Grill");
  envContent.push("");
  
  // Ask for email service preference
  const emailService = await question("Which email service would you like to configure? (1=SendGrid, 2=SMTP, 3=Office365): ");
  
  if (emailService === "1" || emailService.toLowerCase().includes("sendgrid")) {
    console.log("\n📧 Setting up SendGrid...");
    const sendgridKey = await question("Enter your SendGrid API Key (starts with 'SG.'): ");
    const sendgridEmail = await question("Enter your SendGrid verified sender email: ");
    const sendgridName = await question("Enter sender name (default: Kocky's Bar & Grill): ");
    
    envContent.push("# SendGrid Configuration");
    envContent.push(`SENDGRID_API_KEY=${sendgridKey}`);
    envContent.push(`SENDGRID_FROM_EMAIL=${sendgridEmail}`);
    envContent.push(`SENDGRID_FROM_NAME=${sendgridName || "Kocky's Bar & Grill"}`);
    envContent.push("");
    
  } else if (emailService === "2" || emailService.toLowerCase().includes("smtp")) {
    console.log("\n📧 Setting up SMTP...");
    const smtpHost = await question("Enter SMTP host (e.g., smtp.gmail.com): ");
    const smtpPort = await question("Enter SMTP port (default: 587): ");
    const smtpUser = await question("Enter SMTP username/email: ");
    const smtpPass = await question("Enter SMTP password/app password: ");
    
    envContent.push("# SMTP Configuration");
    envContent.push(`SMTP_HOST=${smtpHost}`);
    envContent.push(`SMTP_PORT=${smtpPort || "587"}`);
    envContent.push(`SMTP_USER=${smtpUser}`);
    envContent.push(`SMTP_PASS=${smtpPass}`);
    envContent.push("SMTP_SECURE=false");
    envContent.push("");
    
  } else if (emailService === "3" || emailService.toLowerCase().includes("office")) {
    console.log("\n📧 Setting up Office 365...");
    const clientId = await question("Enter Microsoft Client ID: ");
    const clientSecret = await question("Enter Microsoft Client Secret: ");
    const tenantId = await question("Enter Microsoft Tenant ID: ");
    
    envContent.push("# Office 365 / Microsoft Graph Configuration");
    envContent.push(`MICROSOFT_CLIENT_ID=${clientId}`);
    envContent.push(`MICROSOFT_CLIENT_SECRET=${clientSecret}`);
    envContent.push(`MICROSOFT_TENANT_ID=${tenantId}`);
    envContent.push("MICROSOFT_GRAPH_SCOPE=https://graph.microsoft.com/.default");
    envContent.push("");
  }
  
  // Stripe configuration
  console.log("\n💳 Setting up Stripe...");
  const stripeKey = await question("Enter your Stripe Secret Key (starts with 'sk_'): ");
  
  envContent.push("# Stripe Configuration");
  envContent.push(`STRIPE_SECRET_KEY=${stripeKey}`);
  envContent.push("STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here");
  envContent.push("");
  
  // App URLs
  envContent.push("# App URLs");
  envContent.push("APP_BASE_URL=https://staging.kockys.com");
  envContent.push("FRONTEND_URL=https://staging.kockys.com");
  envContent.push("");
  
  // Write .env file
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent.join('\n'));
  
  console.log("\n✅ Email configuration saved to .env file");
  console.log("\n🚀 Next steps:");
  console.log("1. Restart the server: npm run build && node -r dotenv/config dist/server.js -p 5001");
  console.log("2. Test the email system: node quick-email-check.js");
  console.log("3. Send a test quote email");
  
  rl.close();
}

setupEmailConfig().catch(console.error);