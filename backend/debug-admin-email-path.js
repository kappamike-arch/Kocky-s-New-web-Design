#!/usr/bin/env node

/**
 * Debug Admin Email Path Script
 * This script helps identify which email function the admin panel is using
 */

require('dotenv').config({ path: './.env' });

async function debugAdminEmailPath() {
  console.log("🔍 DEBUGGING ADMIN EMAIL PATH");
  console.log("=============================\n");

  try {
    const axios = require('axios');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    
    console.log("📋 Available Quote Email Endpoints:");
    console.log("===================================");
    console.log("1. POST /api/quotes/:id/send - Main send quote endpoint");
    console.log("2. POST /api/quotes/:id/pdf/email - Email PDF endpoint");
    console.log("3. Other potential endpoints...");
    
    console.log("\n🧪 Testing Main Send Quote Endpoint:");
    console.log("=====================================");
    try {
      const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send`, {
        mode: "deposit"
      }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log("✅ Main endpoint works:");
      console.log(`   Status: ${response.status}`);
      console.log(`   Checkout URL: ${response.data.checkoutUrl}`);
      console.log(`   Session ID: ${response.data.sessionId}`);
      console.log("   📧 This should use the NEW email system with PDF and Stripe");
      
    } catch (error) {
      console.log("❌ Main endpoint failed:");
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    console.log("\n🧪 Testing PDF Email Endpoint:");
    console.log("===============================");
    try {
      const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/pdf/email`, {
        message: "Test email from PDF endpoint"
      }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log("✅ PDF email endpoint works:");
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.data.message}`);
      console.log("   📧 This uses the centralized email system");
      
    } catch (error) {
      console.log("❌ PDF email endpoint failed:");
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    console.log("\n🔍 ANALYZING THE ISSUE:");
    console.log("=======================");
    console.log("Based on your description:");
    console.log("• Email is sent ✅");
    console.log("• Pay Now button not working ❌");
    console.log("• No PDF attachment ❌");
    console.log("• No quote details ❌");
    
    console.log("\n💡 LIKELY CAUSES:");
    console.log("==================");
    console.log("1. Admin panel is using a DIFFERENT endpoint");
    console.log("2. Admin panel is using LEGACY email function");
    console.log("3. Admin panel is bypassing the new email system");
    console.log("4. There's a different route being called");
    
    console.log("\n🔧 NEXT STEPS:");
    console.log("===============");
    console.log("1. Check admin panel code to see which endpoint it calls");
    console.log("2. Look for any legacy email functions");
    console.log("3. Check if admin panel has its own email sending logic");
    console.log("4. Verify the admin panel is calling the correct API endpoint");
    
    console.log("\n📋 ADMIN PANEL INVESTIGATION:");
    console.log("=============================");
    console.log("Check these files in the admin panel:");
    console.log("• Look for API calls to /api/quotes/:id/send");
    console.log("• Look for any custom email sending logic");
    console.log("• Check if there are multiple 'send quote' buttons");
    console.log("• Verify which endpoint the admin panel actually calls");
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

debugAdminEmailPath();



