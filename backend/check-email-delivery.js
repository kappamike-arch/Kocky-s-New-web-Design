#!/usr/bin/env node

/**
 * Email Delivery Check Script
 * Diagnoses why emails are not being delivered
 */

require('dotenv').config({ path: './.env' });

const axios = require('axios');

async function checkEmailDelivery() {
  console.log('🔍 EMAIL DELIVERY DIAGNOSTIC');
  console.log('============================');
  console.log('');

  // Step 1: Check environment variables
  console.log('📋 Step 1: Email Service Configuration');
  console.log('--------------------------------------');
  
  const config = {
    o365: {
      clientId: !!process.env.O365_CLIENT_ID,
      clientSecret: !!process.env.O365_CLIENT_SECRET,
      tenantId: !!process.env.O365_TENANT_ID,
      fromEmail: process.env.O365_FROM_EMAIL
    },
    sendgrid: {
      apiKey: !!process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL,
      fromName: process.env.SENDGRID_FROM_NAME
    },
    smtp: {
      host: !!process.env.SMTP_HOST,
      user: !!process.env.SMTP_USER,
      pass: !!process.env.SMTP_PASS
    }
  };

  console.log('Office 365 Configuration:');
  console.log(`   Client ID: ${config.o365.clientId ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Client Secret: ${config.o365.clientSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Tenant ID: ${config.o365.tenantId ? '✅ Set' : '❌ Missing'}`);
  console.log(`   From Email: ${config.o365.fromEmail || 'Not set'}`);
  console.log('');

  console.log('SendGrid Configuration:');
  console.log(`   API Key: ${config.sendgrid.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   From Email: ${config.sendgrid.fromEmail || 'Not set'}`);
  console.log(`   From Name: ${config.sendgrid.fromName || 'Not set'}`);
  console.log('');

  console.log('SMTP Configuration:');
  console.log(`   Host: ${config.smtp.host ? '✅ Set' : '❌ Missing'}`);
  console.log(`   User: ${config.smtp.user ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Password: ${config.smtp.pass ? '✅ Set' : '❌ Missing'}`);
  console.log('');

  const hasAnyService = config.o365.clientId || config.sendgrid.apiKey || config.smtp.host;
  if (!hasAnyService) {
    console.log('❌ CRITICAL ISSUE: No email services configured!');
    console.log('   You need to configure at least one email service in your .env file');
    console.log('');
    console.log('Required environment variables:');
    console.log('   For Office 365: O365_CLIENT_ID, O365_CLIENT_SECRET, O365_TENANT_ID');
    console.log('   For SendGrid: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL');
    console.log('   For SMTP: SMTP_HOST, SMTP_USER, SMTP_PASS');
    return;
  }
  console.log('');

  // Step 2: Check server status
  console.log('📡 Step 2: Server Status Check');
  console.log('------------------------------');
  try {
    const healthResponse = await axios.get('http://localhost:5001/health', { timeout: 5000 });
    console.log('✅ Server is running');
    console.log(`   Status: ${healthResponse.status}`);
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log(`   Error: ${error.message}`);
    console.log('');
    console.log('🔧 SOLUTION: Start the server with:');
    console.log('   npm run dev');
    return;
  }
  console.log('');

  // Step 3: Test basic email endpoint
  console.log('📧 Step 3: Basic Email Test');
  console.log('---------------------------');
  try {
    const testResponse = await axios.post('http://localhost:5001/api/email/send', {
      to: 'kappamike@gmail.com',
      subject: 'Test Email - System Check',
      html: '<h1>Test Email</h1><p>This is a test email to verify the system is working.</p>'
    }, { timeout: 15000 });
    
    console.log('✅ Basic email test completed');
    console.log(`   Status: ${testResponse.status}`);
    console.log(`   Success: ${testResponse.data.success}`);
    console.log(`   Message: ${testResponse.data.message}`);
    console.log(`   Note: ${testResponse.data.note || 'N/A'}`);
  } catch (error) {
    console.log('❌ Basic email test failed');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log(`   Status: ${error.response?.status}`);
  }
  console.log('');

  // Step 4: Test quote email
  console.log('📧 Step 4: Quote Email Test');
  console.log('---------------------------');
  const quoteId = "cmfvzmv040024bcmhp9yvuyor";
  try {
    const quoteResponse = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send-email`, {
      mode: 'deposit',
      email: 'kappamike@gmail.com'
    }, { timeout: 20000 });
    
    console.log('✅ Quote email test completed');
    console.log(`   Status: ${quoteResponse.status}`);
    console.log(`   Success: ${quoteResponse.data.success}`);
    console.log(`   Email Sent: ${quoteResponse.data.emailSent}`);
    console.log(`   PDF Generated: ${quoteResponse.data.pdfGenerated}`);
    console.log(`   Stripe Session Created: ${quoteResponse.data.stripeSessionCreated}`);
    
    if (quoteResponse.data.checkoutUrl) {
      console.log(`   Checkout URL: ${quoteResponse.data.checkoutUrl}`);
    }
    
  } catch (error) {
    console.log('❌ Quote email test failed');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log(`   Status: ${error.response?.status}`);
    
    if (error.response?.data) {
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  console.log('');

  // Step 5: Troubleshooting guide
  console.log('🔧 EMAIL DELIVERY TROUBLESHOOTING');
  console.log('==================================');
  console.log('');
  console.log('Common reasons why emails are not delivered:');
  console.log('');
  console.log('1. 📧 EMAIL SERVICE CONFIGURATION:');
  console.log('   • Check .env file has correct email service credentials');
  console.log('   • Verify API keys are valid and not expired');
  console.log('   • Ensure from email address is verified with the service');
  console.log('   • Check if email service has sending limits or restrictions');
  console.log('');
  console.log('2. 📮 EMAIL DELIVERY ISSUES:');
  console.log('   • Check spam/junk folder in kappamike@gmail.com');
  console.log('   • Verify email address is correct and active');
  console.log('   • Check if email provider is blocking emails from your domain');
  console.log('   • Test with a different email address (Gmail, Yahoo, etc.)');
  console.log('');
  console.log('3. 🔧 SERVER ISSUES:');
  console.log('   • Check server logs for detailed error messages');
  console.log('   • Verify server is running and accessible');
  console.log('   • Check database connection and quote data');
  console.log('   • Ensure all required environment variables are loaded');
  console.log('');
  console.log('4. 📋 QUOTE DATA ISSUES:');
  console.log('   • Verify quote exists in database');
  console.log('   • Check quote has customer email address');
  console.log('   • Ensure quote items and totals are correct');
  console.log('   • Verify quote status allows sending');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Check server logs: Look at console output where server is running');
  console.log('2. Verify .env file configuration');
  console.log('3. Test with a different email address');
  console.log('4. Check email service provider status');
  console.log('5. Verify Stripe configuration if payment links are broken');
  console.log('6. Check if emails are being sent but going to spam');
  console.log('');
  console.log('📊 MONITORING:');
  console.log('• Watch server console for detailed email sending logs');
  console.log('• Check email service provider dashboard for delivery status');
  console.log('• Verify quote status updates in database');
  console.log('• Test payment links manually');
}

checkEmailDelivery().catch(console.error);

