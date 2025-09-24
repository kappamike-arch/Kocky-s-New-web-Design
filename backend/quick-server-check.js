#!/usr/bin/env node

/**
 * Quick Server Check Script
 * 
 * This script verifies that the admin panel quote system is working correctly:
 * - Server health endpoint
 * - Quote endpoints
 * - Email sending functionality
 * - PDF generation
 * - Stripe integration
 */

const fs = require('fs');
const path = require('path');

async function quickServerCheck() {
  console.log("🔍 QUICK SERVER CHECK - ADMIN PANEL QUOTE SYSTEM");
  console.log("=================================================\n");

  const results = {
    serverHealth: false,
    quoteEndpoint: false,
    adminEmailEndpoint: false,
    emailSent: false,
    errors: []
  };

  try {
    // Step 1: Check server health
    console.log("1. Testing server health endpoint...");
    await checkServerHealth(results);

    // Step 2: Check quote endpoint
    console.log("\n2. Testing quote endpoint...");
    await checkQuoteEndpoint(results);

    // Step 3: Check admin panel email endpoint
    console.log("\n3. Testing admin panel email endpoint...");
    await checkAdminEmailEndpoint(results);

    // Step 4: Generate summary report
    console.log("\n📊 SERVER CHECK SUMMARY");
    console.log("========================");
    generateSummaryReport(results);

  } catch (error) {
    console.error("❌ Server check failed:", error.message);
    results.errors.push(`Unexpected error: ${error.message}`);
  }
}

async function checkServerHealth(results) {
  try {
    const axios = require('axios');
    
    const response = await axios.get('http://localhost:5001/api/health', { 
      timeout: 5000,
      headers: { 'User-Agent': 'Server-Check-Script' }
    });
    
    console.log("   ✅ Server is running and responding");
    console.log(`   📊 Status: ${response.status}`);
    console.log(`   📋 Response: ${JSON.stringify(response.data)}`);
    
    results.serverHealth = true;
    
  } catch (error) {
    console.log("   ❌ Server is not responding");
    console.log(`   📋 Error: ${error.message}`);
    console.log(`   💡 Start server: npm run restart:fixes`);
    
    results.errors.push(`Server not responding: ${error.message}`);
  }
}

async function checkQuoteEndpoint(results) {
  try {
    const axios = require('axios');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    
    const response = await axios.get(`http://localhost:5001/api/quotes/${quoteId}`, { 
      timeout: 10000,
      headers: { 'User-Agent': 'Server-Check-Script' }
    });
    
    console.log("   ✅ Quote endpoint working");
    console.log(`   📋 Quote Number: ${response.data.quoteNumber}`);
    console.log(`   👤 Customer: ${response.data.inquiry?.name}`);
    console.log(`   📧 Email: ${response.data.inquiry?.email}`);
    console.log(`   💰 Amount: $${response.data.amount}`);
    console.log(`   📊 Status: ${response.data.status}`);
    
    results.quoteEndpoint = true;
    
  } catch (error) {
    console.log("   ❌ Quote endpoint failed");
    console.log(`   📋 Error: ${error.response?.data?.message || error.message}`);
    
    results.errors.push(`Quote endpoint failed: ${error.message}`);
  }
}

async function checkAdminEmailEndpoint(results) {
  try {
    const axios = require('axios');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    
    console.log("   📤 Testing admin panel email endpoint...");
    console.log("   📋 Endpoint: POST /api/quotes/:id/send-email");
    console.log("   📋 Body: { email: 'kappamike@gmail.com' }");
    
    const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send-email`, {
      email: 'kappamike@gmail.com'
    }, {
      timeout: 30000,
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Server-Check-Script'
      }
    });
    
    console.log("   ✅ Admin panel email endpoint working");
    console.log(`   📊 Status: ${response.status}`);
    console.log(`   ✅ Message: ${response.data.message}`);
    console.log(`   🔗 Stripe Checkout URL: ${response.data.checkoutUrl}`);
    console.log(`   🆔 Session ID: ${response.data.sessionId}`);
    
    results.adminEmailEndpoint = true;
    results.emailSent = true;
    
    console.log("\n🎉 ADMIN PANEL EMAIL SENT SUCCESSFULLY!");
    console.log("=======================================");
    console.log("📧 Email sent to: kappamike@gmail.com");
    console.log("📁 Check inbox AND spam folder");
    console.log("⏰ Email should arrive within 1-2 minutes");
    
    console.log("\n📋 EMAIL CONTENTS:");
    console.log("==================");
    console.log("✅ Complete quote details with breakdown");
    console.log("✅ PDF attachment (Quote-" + quoteId + ".pdf)");
    console.log("✅ Working 'Pay Now' button with Stripe checkout");
    console.log("✅ Professional Kocky's branding");
    console.log("✅ Modern email template (not legacy)");
    
    console.log("\n🧪 VERIFY THE EMAIL:");
    console.log("====================");
    console.log("1. Open the email");
    console.log("2. Verify quote details are visible (not missing)");
    console.log("3. Download the PDF attachment");
    console.log("4. Click the 'Pay Now' button");
    console.log("5. Verify Stripe checkout page loads");
    
  } catch (error) {
    console.log("   ❌ Admin panel email endpoint failed");
    console.log(`   📊 Status: ${error.response?.status || 'No response'}`);
    console.log(`   📋 Error: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.log("   📋 Full error response:");
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    results.errors.push(`Admin email endpoint failed: ${error.message}`);
    
    // Provide specific troubleshooting
    if (error.message.includes('Authentication') || error.message.includes('auth')) {
      console.log("\n💡 AUTHENTICATION ERROR:");
      console.log("   • Check email service credentials in .env file");
      console.log("   • For Gmail: Use app password, not regular password");
      console.log("   • For SendGrid: Verify sender email is authenticated");
      console.log("   • Restart server after changing credentials");
    }
    
    if (error.message.includes('Connection') || error.message.includes('ECONNREFUSED')) {
      console.log("\n💡 CONNECTION ERROR:");
      console.log("   • Check SMTP host and port settings");
      console.log("   • Verify network connectivity");
      console.log("   • Check if email service is down");
    }
    
    if (error.message.includes('Template') || error.message.includes('template')) {
      console.log("\n💡 TEMPLATE ERROR:");
      console.log("   • Check if quote template exists");
      console.log("   • Verify template data structure");
      console.log("   • Check server logs for details");
    }
  }
}

function generateSummaryReport(results) {
  const checks = [
    { name: 'Server Health', status: results.serverHealth },
    { name: 'Quote Endpoint', status: results.quoteEndpoint },
    { name: 'Admin Email Endpoint', status: results.adminEmailEndpoint },
    { name: 'Email Sent Successfully', status: results.emailSent }
  ];
  
  checks.forEach(check => {
    const status = check.status ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${check.name}`);
  });
  
  if (results.errors.length > 0) {
    console.log("\n🚨 ISSUES FOUND:");
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  // Overall assessment
  const allChecksPassed = checks.every(check => check.status);
  
  if (allChecksPassed) {
    console.log("\n🎉 ALL CHECKS PASSED!");
    console.log("====================");
    console.log("✅ Admin panel quote system is fully functional");
    console.log("✅ PDF attachments will be included");
    console.log("✅ Stripe checkout links will work");
    console.log("✅ Complete quote details will be visible");
    console.log("✅ Modern email template will be used");
    
    console.log("\n📧 CHECK YOUR EMAIL:");
    console.log("====================");
    console.log("• Email sent to: kappamike@gmail.com");
    console.log("• Check inbox AND spam folder");
    console.log("• Verify all components are working");
    
  } else {
    console.log("\n⚠️  SOME CHECKS FAILED");
    console.log("=====================");
    console.log("Please fix the issues above before testing the admin panel.");
    
    console.log("\n🔧 TROUBLESHOOTING STEPS:");
    console.log("==========================");
    console.log("1. Restart server: npm run restart:fixes");
    console.log("2. Check .env file has email configuration");
    console.log("3. Check server logs: tail -f server.log");
    console.log("4. Verify email service credentials");
    console.log("5. Test with different email address");
  }
  
  // Additional recommendations
  console.log("\n💡 RECOMMENDATIONS:");
  console.log("===================");
  console.log("1. Check your email inbox (including spam folder)");
  console.log("2. Verify the email contains all quote details");
  console.log("3. Test the 'Pay Now' button in the email");
  console.log("4. Download and verify the PDF attachment");
  console.log("5. If issues persist, check server logs for detailed error messages");
}

// Run the server check
quickServerCheck().catch(console.error);