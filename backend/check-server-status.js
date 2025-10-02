#!/usr/bin/env node

/**
 * Server Status Check Script
 * Simple script to check if the server is running and accessible
 */

async function checkServerStatus() {
  console.log("🔍 CHECKING SERVER STATUS");
  console.log("=========================\n");

  try {
    const axios = require('axios');
    
    // Test server health endpoint
    console.log("1. Testing server health endpoint...");
    try {
      const response = await axios.get('http://localhost:5001/api/health', { 
        timeout: 5000,
        headers: { 'User-Agent': 'Server-Status-Check' }
      });
      console.log("   ✅ Server is running and responding");
      console.log(`   📊 Status: ${response.status}`);
      console.log(`   📋 Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.log("   ❌ Server is not responding");
      console.log(`   📋 Error: ${error.message}`);
      console.log(`   📋 Code: ${error.code}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log("   💡 Server is not running on port 5001");
        console.log("   💡 Start server: npm run build && node -r dotenv/config dist/server.js -p 5001");
      }
      return;
    }

    // Test quote endpoint
    console.log("\n2. Testing quote endpoint...");
    try {
      const quoteId = "cmfvzmv040024bcmhp9yvuyor";
      const response = await axios.get(`http://localhost:5001/api/quotes/${quoteId}`, { timeout: 10000 });
      console.log("   ✅ Quote endpoint is working");
      console.log(`   📋 Quote Number: ${response.data.quoteNumber}`);
      console.log(`   📧 Customer Email: ${response.data.inquiry?.email}`);
    } catch (error) {
      console.log("   ❌ Quote endpoint failed");
      console.log(`   📋 Error: ${error.response?.data?.message || error.message}`);
    }

    // Test email sending endpoint
    console.log("\n3. Testing email sending endpoint...");
    try {
      const quoteId = "cmfvzmv040024bcmhp9yvuyor";
      const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send`, {
        mode: "deposit"
      }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log("   ✅ Email sending endpoint is working");
      console.log(`   🔗 Stripe URL: ${response.data.checkoutUrl}`);
      console.log(`   🆔 Session ID: ${response.data.sessionId}`);
      
    } catch (error) {
      console.log("   ❌ Email sending endpoint failed");
      console.log(`   📋 Status: ${error.response?.status || 'No response'}`);
      console.log(`   📋 Error: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.data) {
        console.log("   📋 Full error response:");
        console.log(JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log("\n🎯 SUMMARY:");
    console.log("===========");
    console.log("If server is running but emails aren't being sent:");
    console.log("1. Check if .env file exists and has email configuration");
    console.log("2. Verify email service credentials (SendGrid, SMTP, Office365)");
    console.log("3. Check server logs for detailed error messages");
    console.log("4. Test with a different email address");

  } catch (error) {
    console.error("❌ Status check failed:", error.message);
  }
}

checkServerStatus();



