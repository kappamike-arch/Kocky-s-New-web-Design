#!/usr/bin/env node

/**
 * Simple Quote Test Script
 * Sends a test quote email with all components
 */

require('dotenv').config({ path: './.env' });

const axios = require('axios');

async function sendTestQuote() {
  console.log('📧 SENDING TEST QUOTE EMAIL');
  console.log('============================');
  
  try {
    const quoteId = "cmfvzmv040024bcmhp9yvuyor"; // Existing quote ID
    const testEmail = "kappamike@gmail.com";
    
    console.log(`📋 Quote ID: ${quoteId}`);
    console.log(`📧 Sending to: ${testEmail}`);
    console.log('');
    
    // Send quote email
    console.log('🚀 Sending quote email...');
    
    const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send-email`, {
      mode: 'deposit',
      email: testEmail
    }, {
      timeout: 30000,
      headers: { 
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Quote email sent successfully!');
    console.log('');
    console.log('📊 RESULTS:');
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Email Sent: ${response.data.emailSent}`);
    console.log(`   PDF Generated: ${response.data.pdfGenerated}`);
    console.log(`   Stripe Session Created: ${response.data.stripeSessionCreated}`);
    console.log(`   Checkout URL: ${response.data.checkoutUrl}`);
    console.log(`   Session ID: ${response.data.sessionId}`);
    console.log('');
    console.log('📧 CHECK YOUR EMAIL:');
    console.log(`   • Recipient: ${testEmail}`);
    console.log('   • Subject: "Your Quote [QUOTE_NUMBER] — Kocky\'s"');
    console.log('   • Should include PDF attachment');
    console.log('   • Should have working Pay Now button');
    console.log('   • Should show complete quote details');
    console.log('');
    console.log('🔗 PAYMENT TESTING:');
    console.log(`   • Click Pay Now button: ${response.data.checkoutUrl}`);
    console.log('   • Should open Stripe checkout for deposit payment');
    
  } catch (error) {
    console.log('❌ Test quote failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    console.log('');
    console.log('🔧 TROUBLESHOOTING:');
    console.log('1. Make sure server is running: npm run dev');
    console.log('2. Check .env file has email configuration');
    console.log('3. Verify quote exists in database');
    console.log('4. Check server logs for detailed errors');
  }
}

sendTestQuote().catch(console.error);



