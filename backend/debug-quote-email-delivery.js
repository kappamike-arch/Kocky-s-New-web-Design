#!/usr/bin/env node

/**
 * Debug Quote Email Delivery
 * 
 * This script will help debug why quote emails say "sent" but don't arrive.
 * It provides comprehensive logging and error tracking.
 */

require('dotenv').config({ path: './.env' });

const axios = require('axios');

async function debugQuoteEmailDelivery() {
  console.log('🔍 QUOTE EMAIL DELIVERY DEBUG');
  console.log('=============================');
  console.log('');

  const quoteId = "cmfvzmv040024bcmhp9yvuyor";
  const testEmail = "kappamike@gmail.com";
  
  console.log(`📋 Quote ID: ${quoteId}`);
  console.log(`📧 Test Email: ${testEmail}`);
  console.log('');

  try {
    // Step 1: Check server status
    console.log('📡 Step 1: Checking server status...');
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

    // Step 2: Check quote exists
    console.log('📋 Step 2: Checking quote exists...');
    try {
      const quoteResponse = await axios.get(`http://localhost:5001/api/quotes/${quoteId}`, { timeout: 10000 });
      const quote = quoteResponse.data;
      
      console.log('✅ Quote found');
      console.log(`   Quote Number: ${quote.quoteNumber}`);
      console.log(`   Customer: ${quote.inquiry?.name || 'N/A'}`);
      console.log(`   Email: ${quote.inquiry?.email || 'N/A'}`);
      console.log(`   Total: $${Number(quote.amount || 0).toFixed(2)}`);
      console.log(`   Status: ${quote.status}`);
      console.log(`   Items: ${quote.quoteItems?.length || 0}`);
      
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

    // Step 3: Test quote email sending with detailed logging
    console.log('📧 Step 3: Testing quote email sending...');
    console.log('   This will show detailed logs in the server console');
    console.log('   Watch the server console for detailed email service logs');
    console.log('');
    
    try {
      const quoteEmailResponse = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send-email`, {
        mode: 'deposit',
        email: testEmail
      }, { timeout: 30000 });
      
      console.log('✅ Quote email API call completed');
      console.log(`   Status: ${quoteEmailResponse.status}`);
      console.log(`   Success: ${quoteEmailResponse.data.success}`);
      console.log(`   Email Sent: ${quoteEmailResponse.data.emailSent}`);
      console.log(`   PDF Generated: ${quoteEmailResponse.data.pdfGenerated}`);
      console.log(`   Stripe Session Created: ${quoteEmailResponse.data.stripeSessionCreated}`);
      
      if (quoteEmailResponse.data.checkoutUrl) {
        console.log(`   Checkout URL: ${quoteEmailResponse.data.checkoutUrl}`);
      }
      
      console.log('');
      console.log('📊 EMAIL DELIVERY ANALYSIS:');
      console.log('============================');
      
      if (quoteEmailResponse.data.success && quoteEmailResponse.data.emailSent) {
        console.log('✅ API reports email was sent successfully');
        console.log('');
        console.log('🔍 TROUBLESHOOTING STEPS:');
        console.log('1. Check server console logs for detailed email service information');
        console.log('2. Look for logs showing which email provider was used (Office 365, SendGrid, SMTP)');
        console.log('3. Check for any error messages from the email provider');
        console.log('4. Verify the email address is correct');
        console.log('5. Check spam/junk folder in kappamike@gmail.com');
        console.log('6. Try with a different email address');
        console.log('');
        console.log('📧 WHAT TO LOOK FOR IN SERVER LOGS:');
        console.log('• Email service configuration status');
        console.log('• Which provider was used (Office 365, SendGrid, SMTP)');
        console.log('• PDF generation success/failure');
        console.log('• Stripe session creation success/failure');
        console.log('• Any error messages from email providers');
        console.log('• Attachment details (filename, size)');
        console.log('');
        console.log('🎯 EXPECTED SERVER LOG PATTERN:');
        console.log('📧 EMAIL SEND ATTEMPT [email_1234567890_abc123]');
        console.log('🔧 EMAIL SERVICE CONFIGURATION [email_1234567890_abc123]');
        console.log('📤 ATTEMPTING EMAIL VIA OFFICE 365 [email_1234567890_abc123]');
        console.log('✅ EMAIL SENT VIA OFFICE 365 [email_1234567890_abc123]');
        console.log('   OR');
        console.log('❌ OFFICE 365 EMAIL FAILED [email_1234567890_abc123]');
        console.log('📤 SENDING EMAIL VIA SENDGRID [email_1234567890_abc123]');
        console.log('✅ EMAIL SENT VIA SENDGRID [email_1234567890_abc123]');
        
      } else {
        console.log('❌ API reports email was not sent');
        console.log(`   Success: ${quoteEmailResponse.data.success}`);
        console.log(`   Email Sent: ${quoteEmailResponse.data.emailSent}`);
        console.log('');
        console.log('🔧 TROUBLESHOOTING STEPS:');
        console.log('1. Check server console logs for detailed error messages');
        console.log('2. Verify email service configuration in .env file');
        console.log('3. Check if email service credentials are valid');
        console.log('4. Ensure server has internet access');
        console.log('5. Check if email service has sending limits or restrictions');
      }
      
    } catch (error) {
      console.log('❌ Quote email test failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      console.log(`   Status: ${error.response?.status}`);
      
      if (error.response?.data) {
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      console.log('');
      console.log('🔧 TROUBLESHOOTING STEPS:');
      console.log('1. Check server console logs for detailed error messages');
      console.log('2. Verify server is running and accessible');
      console.log('3. Check database connection');
      console.log('4. Verify quote exists and has valid data');
      console.log('5. Check email service configuration');
    }
    console.log('');

    // Step 4: Environment check
    console.log('🔧 Step 4: Environment Configuration Check');
    console.log('==========================================');
    console.log('The following environment variables should be configured:');
    console.log('');
    console.log('Office 365 Email Service:');
    console.log(`   O365_CLIENT_ID: ${process.env.O365_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   O365_CLIENT_SECRET: ${process.env.O365_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   O365_TENANT_ID: ${process.env.O365_TENANT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   O365_FROM_EMAIL: ${process.env.O365_FROM_EMAIL || 'Not set'}`);
    console.log('');
    console.log('SendGrid Email Service (Fallback):');
    console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   SENDGRID_FROM_EMAIL: ${process.env.SENDGRID_FROM_EMAIL || 'Not set'}`);
    console.log('');
    console.log('Stripe Payment Service:');
    console.log(`   STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   STRIPE_PUBLISHABLE_KEY: ${process.env.STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log('');

  } catch (error) {
    console.log('❌ Debug script failed:', error.message);
  }
}

debugQuoteEmailDelivery().catch(console.error);

