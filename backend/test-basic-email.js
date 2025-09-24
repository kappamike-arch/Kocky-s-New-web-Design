#!/usr/bin/env node

/**
 * Test Basic Email Functionality
 * 
 * This script tests the basic email sending functionality
 * to isolate email service issues from quote system issues.
 */

require('dotenv').config({ path: './.env' });

async function testBasicEmail() {
  console.log("🧪 TESTING BASIC EMAIL FUNCTIONALITY");
  console.log("=====================================\n");

  try {
    // Test 1: Check environment variables
    console.log("1. Checking email environment variables...");
    const emailConfig = {
      hasO365: !!(process.env.O365_CLIENT_ID && process.env.O365_CLIENT_SECRET),
      hasSendGrid: !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'SG.your-sendgrid-api-key-here'),
      hasSMTP: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      fromEmail: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER,
      fromName: process.env.EMAIL_FROM_NAME || "Kocky's Test"
    };

    console.log("   📧 Email Configuration:");
    console.log(`   • Office 365: ${emailConfig.hasO365 ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   • SendGrid: ${emailConfig.hasSendGrid ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   • SMTP: ${emailConfig.hasSMTP ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   • From Email: ${emailConfig.fromEmail || '❌ Not set'}`);
    console.log(`   • From Name: ${emailConfig.fromName}`);

    if (!emailConfig.hasO365 && !emailConfig.hasSendGrid && !emailConfig.hasSMTP) {
      console.log("\n❌ NO EMAIL SERVICES CONFIGURED!");
      console.log("   Please configure at least one email service in .env file");
      return;
    }

    // Test 2: Import email service
    console.log("\n2. Testing email service import...");
    const { sendEmail } = require('./dist/utils/email');
    console.log("   ✅ Email service imported successfully");

    // Test 3: Send basic test email
    console.log("\n3. Sending basic test email...");
    const testEmailOptions = {
      to: 'kappamike@gmail.com',
      subject: '🧪 Basic Email Test - Kocky\'s System',
      template: 'welcome',
      data: {
        name: 'Test User'
      }
    };

    console.log("   📤 Sending email with options:");
    console.log(`   • To: ${testEmailOptions.to}`);
    console.log(`   • Subject: ${testEmailOptions.subject}`);
    console.log(`   • Template: ${testEmailOptions.template}`);

    const emailSent = await sendEmail(testEmailOptions);

    if (emailSent) {
      console.log("\n✅ BASIC EMAIL TEST SUCCESSFUL!");
      console.log("================================");
      console.log("📧 Email sent successfully to kappamike@gmail.com");
      console.log("📋 Check your inbox (including spam folder)");
      console.log("⏰ Email should arrive within 1-2 minutes");
      
      console.log("\n🎯 NEXT STEPS:");
      console.log("==============");
      console.log("1. Check your email inbox");
      console.log("2. If email received, the basic email system is working");
      console.log("3. If no email, check server logs for detailed error messages");
      console.log("4. Run: npm run check:server to test the full quote system");
      
    } else {
      console.log("\n❌ BASIC EMAIL TEST FAILED!");
      console.log("============================");
      console.log("📧 Email was not sent successfully");
      console.log("🔍 Check server logs for detailed error messages");
      console.log("💡 Verify email service credentials in .env file");
    }

  } catch (error) {
    console.error("\n❌ BASIC EMAIL TEST ERROR:");
    console.error("===========================");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    console.log("\n🔧 TROUBLESHOOTING STEPS:");
    console.log("==========================");
    console.log("1. Check .env file has email configuration");
    console.log("2. Verify email service credentials");
    console.log("3. Check server logs: tail -f server.log");
    console.log("4. Test with different email address");
    console.log("5. Restart server: npm run restart:fixes");
  }
}

// Run the test
testBasicEmail().catch(console.error);