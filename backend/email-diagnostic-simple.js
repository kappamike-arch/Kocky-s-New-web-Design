#!/usr/bin/env node

/**
 * Simple Email Diagnostic Script
 * Run this to identify why emails aren't being delivered
 */

require('dotenv').config({ path: './.env' });

console.log('🔍 EMAIL DELIVERY DIAGNOSTIC');
console.log('============================');
console.log('');

// Step 1: Check environment variables
console.log('📋 Step 1: Email Service Configuration');
console.log('--------------------------------------');

const hasO365 = !!(process.env.O365_CLIENT_ID && process.env.O365_CLIENT_SECRET && process.env.O365_TENANT_ID);
const hasSendGrid = !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.'));
const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

console.log('Office 365 Configuration:');
console.log(`   Client ID: ${process.env.O365_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   Client Secret: ${process.env.O365_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`   Tenant ID: ${process.env.O365_TENANT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   From Email: ${process.env.O365_FROM_EMAIL || 'Not set'}`);
console.log('');

console.log('SendGrid Configuration:');
console.log(`   API Key: ${process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   From Email: ${process.env.SENDGRID_FROM_EMAIL || 'Not set'}`);
console.log(`   From Name: ${process.env.SENDGRID_FROM_NAME || 'Not set'}`);
console.log('');

console.log('SMTP Configuration:');
console.log(`   Host: ${process.env.SMTP_HOST ? '✅ Set' : '❌ Missing'}`);
console.log(`   User: ${process.env.SMTP_USER ? '✅ Set' : '❌ Missing'}`);
console.log(`   Password: ${process.env.SMTP_PASS ? '✅ Set' : '❌ Missing'}`);
console.log('');

if (!hasO365 && !hasSendGrid && !hasSMTP) {
  console.log('❌ CRITICAL ISSUE: No email services configured!');
  console.log('');
  console.log('🔧 SOLUTION: Add email service configuration to your .env file:');
  console.log('');
  console.log('# For SendGrid (Recommended):');
  console.log('SENDGRID_API_KEY=your-sendgrid-api-key-here');
  console.log('SENDGRID_FROM_EMAIL=noreply@kockys.com');
  console.log('SENDGRID_FROM_NAME="Kocky\'s Bar & Grill"');
  console.log('');
  console.log('# For Office 365:');
  console.log('O365_CLIENT_ID=your-client-id');
  console.log('O365_CLIENT_SECRET=your-client-secret');
  console.log('O365_TENANT_ID=your-tenant-id');
  console.log('O365_FROM_EMAIL=info@kockys.com');
  console.log('');
  console.log('# For SMTP:');
  console.log('SMTP_HOST=smtp.gmail.com');
  console.log('SMTP_USER=your-email@gmail.com');
  console.log('SMTP_PASS=your-app-password');
  console.log('SMTP_PORT=587');
  console.log('SMTP_SECURE=false');
  console.log('');
} else {
  console.log('✅ At least one email service is configured');
}
console.log('');

// Step 2: Check if .env file exists
console.log('📁 Step 2: Environment File Check');
console.log('---------------------------------');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  console.log(`   Contains ${lines.length} configuration lines`);
} else {
  console.log('❌ .env file not found');
  console.log('   Create a .env file in the backend directory');
}
console.log('');

// Step 3: Check server status
console.log('📡 Step 3: Server Status Check');
console.log('------------------------------');
console.log('To check if the server is running, run this command:');
console.log('   curl http://localhost:5001/health');
console.log('');
console.log('Expected response: {"status":"ok"} or similar');
console.log('If you get "connection refused", the server is not running');
console.log('');

// Step 4: Manual testing instructions
console.log('🧪 Step 4: Manual Testing Instructions');
console.log('--------------------------------------');
console.log('1. Start the server (if not running):');
console.log('   npm run dev');
console.log('');
console.log('2. Test basic email endpoint:');
console.log('   curl -X POST "http://localhost:5001/api/email/send" \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"to": "kappamike@gmail.com", "subject": "Test", "html": "<h1>Test</h1>"}\'');
console.log('');
console.log('3. Test quote email:');
console.log('   curl -X POST "http://localhost:5001/api/quotes/cmfvzmv040024bcmhp9yvuyor/send-email" \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"mode": "deposit", "email": "kappamike@gmail.com"}\'');
console.log('');

// Step 5: Common issues and solutions
console.log('🔧 Step 5: Common Issues & Solutions');
console.log('------------------------------------');
console.log('');
console.log('❌ ISSUE: "No email services configured"');
console.log('✅ SOLUTION: Add email service credentials to .env file');
console.log('');
console.log('❌ ISSUE: "Server not running"');
console.log('✅ SOLUTION: Run "npm run dev" to start the server');
console.log('');
console.log('❌ ISSUE: "Emails sent but not received"');
console.log('✅ SOLUTION: Check spam folder, try different email address');
console.log('');
console.log('❌ ISSUE: "API errors"');
console.log('✅ SOLUTION: Check server logs for detailed error messages');
console.log('');
console.log('❌ ISSUE: "Quote not found"');
console.log('✅ SOLUTION: Verify quote exists in database');
console.log('');

// Step 6: Next steps
console.log('📊 Step 6: Next Steps');
console.log('---------------------');
console.log('1. Fix any configuration issues found above');
console.log('2. Start the server: npm run dev');
console.log('3. Run the manual tests above');
console.log('4. Check server console for detailed logs');
console.log('5. Check your email (including spam folder)');
console.log('6. If still not working, check email service provider status');
console.log('');

console.log('🎯 QUICK FIX SUMMARY:');
console.log('=====================');
if (!hasO365 && !hasSendGrid && !hasSMTP) {
  console.log('1. Add email service configuration to .env file');
  console.log('2. Start server: npm run dev');
  console.log('3. Test with: node send-test-quote-simple.js');
} else {
  console.log('1. Start server: npm run dev');
  console.log('2. Test with: node send-test-quote-simple.js');
  console.log('3. Check spam folder in kappamike@gmail.com');
}
console.log('');
console.log('📧 Email should be delivered to: kappamike@gmail.com');
console.log('📋 Quote ID: cmfvzmv040024bcmhp9yvuyor');
console.log('🔗 Server: http://localhost:5001');



