#!/usr/bin/env node

/**
 * Direct API Test Script
 * Test the quote email API directly
 */

async function testAPIDirect() {
  console.log("🧪 TESTING QUOTE EMAIL API DIRECTLY");
  console.log("====================================\n");

  try {
    const axios = require('axios');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    
    console.log("📤 Sending quote email via API...");
    console.log(`📋 Quote ID: ${quoteId}`);
    console.log(`📧 Target Email: kappamike@gmail.com`);
    console.log(`💳 Payment Mode: deposit`);
    
    const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send`, {
      mode: "deposit"
    }, {
      timeout: 30000,
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Email-Script'
      }
    });
    
    console.log("\n🎉 API CALL SUCCESSFUL!");
    console.log("========================");
    console.log(`✅ Status: ${response.status}`);
    console.log(`🔗 Stripe URL: ${response.data.checkoutUrl}`);
    console.log(`🆔 Session ID: ${response.data.sessionId}`);
    console.log(`📧 Email should be sent to: kappamike@gmail.com`);
    
    console.log("\n📋 WHAT TO CHECK:");
    console.log("==================");
    console.log("1. Check kappamike@gmail.com inbox");
    console.log("2. Check spam/junk folder");
    console.log("3. Look for email with subject: 'Your Quote Q-202509-0017 — Kocky's'");
    console.log("4. Verify email contains:");
    console.log("   • Complete quote details");
    console.log("   • PDF attachment");
    console.log("   • Working 'Pay Now' button");
    
    console.log("\n⏰ EMAIL DELIVERY:");
    console.log("==================");
    console.log("• Email should arrive within 1-2 minutes");
    console.log("• If not received, check email service configuration");
    console.log("• Check server logs for detailed error messages");
    
  } catch (error) {
    console.log("❌ API CALL FAILED");
    console.log("==================");
    console.log(`Status: ${error.response?.status || 'No response'}`);
    console.log(`Error: ${error.response?.data?.message || error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log("\n💡 SERVER NOT RUNNING:");
      console.log("   • Start server: node start-server.js");
      console.log("   • Check if port 5001 is available");
    }
    
    if (error.response?.data) {
      console.log("\n📋 Full error response:");
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAPIDirect();



