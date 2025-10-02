#!/usr/bin/env node

/**
 * Email Delivery Diagnostic Script
 * Checks why emails are not being delivered
 */

require('dotenv').config({ path: './.env' });

const axios = require('axios');

async function diagnoseEmailDelivery() {
  console.log('🔍 EMAIL DELIVERY DIAGNOSTIC');
  console.log('============================');
  console.log('');

  // Step 1: Check environment variables
  console.log('📋 Step 1: Checking email configuration...');
  
  const emailConfig = {
    hasO365: !!(process.env.O365_CLIENT_ID && process.env.O365_CLIENT_SECRET && process.env.O365_TENANT_ID),
    hasSendGrid: !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')),
    hasSMTP: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    fromEmail: process.env.EMAIL_FROM_ADDRESS || process.env.SENDGRID_FROM_EMAIL || 'Not set',
    fromName: process.env.EMAIL_FROM_NAME || process.env.SENDGRID_FROM_NAME || 'Not set'
  };

  console.log('Email Service Configuration:');
  console.log(`   Office 365: ${emailConfig.hasO365 ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   SendGrid: ${emailConfig.hasSendGrid ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   SMTP: ${emailConfig.hasSMTP ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   From Email: ${emailConfig.fromEmail}`);
  console.log(`   From Name: ${emailConfig.fromName}`);
  
  if (!emailConfig.hasO365 && !emailConfig.hasSendGrid && !emailConfig.hasSMTP) {
    console.log('');
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
  console.log('📡 Step 2: Checking server status...');
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

  // Step 3: Check quote exists
  console.log('📋 Step 3: Checking quote exists...');
  const quoteId = "cmfvzmv040024bcmhp9yvuyor";
  try {
    const quoteResponse = await axios.get(`http://localhost:5001/api/quotes/${quoteId}`, { timeout: 10000 });
    const quote = quoteResponse.data;
    
    console.log('✅ Quote found');
    console.log(`   Quote Number: ${quote.quoteNumber}`);
    console.log(`   Customer: ${quote.inquiry?.name || 'N/A'}`);
    console.log(`   Email: ${quote.inquiry?.email || 'N/A'}`);
    console.log(`   Status: ${quote.status}`);
    
    if (!quote.inquiry?.email) {
      console.log('❌ CRITICAL ISSUE: Quote has no customer email!');
      return;
    }
  } catch (error) {
    console.log('❌ Quote not found or server error');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return;
  }
  console.log('');

  // Step 4: Test basic email sending
  console.log('📧 Step 4: Testing basic email sending...');
  try {
    const testResponse = await axios.post('http://localhost:5001/api/email/test', {
      to: 'kappamike@gmail.com',
      subject: 'Test Email - Email System Check',
      message: 'This is a test email to verify the email system is working.'
    }, { timeout: 15000 });
    
    console.log('✅ Basic email test sent');
    console.log(`   Status: ${testResponse.status}`);
    console.log(`   Response: ${JSON.stringify(testResponse.data, null, 2)}`);
  } catch (error) {
    console.log('❌ Basic email test failed');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log(`   Status: ${error.response?.status}`);
    
    if (error.response?.data) {
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  console.log('');

  // Step 5: Test quote email sending
  console.log('📧 Step 5: Testing quote email sending...');
  try {
    const quoteEmailResponse = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send-email`, {
      mode: 'deposit',
      email: 'kappamike@gmail.com'
    }, { timeout: 20000 });
    
    console.log('✅ Quote email test sent');
    console.log(`   Status: ${quoteEmailResponse.status}`);
    console.log(`   Success: ${quoteEmailResponse.data.success}`);
    console.log(`   Email Sent: ${quoteEmailResponse.data.emailSent}`);
    console.log(`   PDF Generated: ${quoteEmailResponse.data.pdfGenerated}`);
    console.log(`   Stripe Session Created: ${quoteEmailResponse.data.stripeSessionCreated}`);
    
    if (quoteEmailResponse.data.checkoutUrl) {
      console.log(`   Checkout URL: ${quoteEmailResponse.data.checkoutUrl}`);
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

  // Step 6: Check server logs
  console.log('📊 Step 6: Email delivery troubleshooting...');
  console.log('');
  console.log('🔍 COMMON REASONS FOR EMAIL DELIVERY ISSUES:');
  console.log('');
  console.log('1. 📧 EMAIL SERVICE CONFIGURATION:');
  console.log('   • Check .env file has correct email service credentials');
  console.log('   • Verify API keys are valid and not expired');
  console.log('   • Ensure from email address is verified');
  console.log('');
  console.log('2. 📮 EMAIL DELIVERY:');
  console.log('   • Check spam/junk folder in kappamike@gmail.com');
  console.log('   • Verify email address is correct');
  console.log('   • Check if email provider is blocking emails');
  console.log('');
  console.log('3. 🔧 SERVER ISSUES:');
  console.log('   • Check server logs for detailed error messages');
  console.log('   • Verify server is running and accessible');
  console.log('   • Check database connection');
  console.log('');
  console.log('4. 📋 QUOTE DATA:');
  console.log('   • Verify quote exists in database');
  console.log('   • Check quote has customer email address');
  console.log('   • Ensure quote items and totals are correct');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Check server logs: tail -f logs/app.log (or check console output)');
  console.log('2. Verify .env file configuration');
  console.log('3. Test with a different email address');
  console.log('4. Check email service provider status');
  console.log('5. Verify Stripe configuration if payment links are broken');
}

diagnoseEmailDelivery().catch(console.error);



