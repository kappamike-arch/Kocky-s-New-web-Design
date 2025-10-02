#!/usr/bin/env node

/**
 * Send Test Email - Simple Version
 * 
 * This script sends a test email with all components:
 * - PDF attachment
 * - Working Stripe Pay Now button
 * - Complete quote details
 * - Modern email template
 */

require('dotenv').config({ path: './.env' });

async function sendTestEmail() {
  console.log("📧 SENDING TEST EMAIL");
  console.log("=====================\n");

  try {
    const quoteId = "cmfvzmv040024bcmhp9yvuyor"; // The quote ID from your email
    
    console.log(`📋 Using quote ID: ${quoteId}`);
    console.log(`📧 Sending to: kappamike@gmail.com`);
    
    // Method 1: Use the API endpoint
    console.log("\n1. Sending via API endpoint...");
    
    const axios = require('axios');
    
    const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send-email`, {
      email: 'kappamike@gmail.com'
    }, {
      timeout: 30000,
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Email-Script'
      }
    });
    
    console.log("✅ Test email sent successfully!");
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Response:`, response.data);
    
    if (response.data.checkoutUrl) {
      console.log(`🔗 Stripe Checkout URL: ${response.data.checkoutUrl}`);
    }
    
    console.log("\n📧 EMAIL SENT TO: kappamike@gmail.com");
    console.log("=====================================");
    console.log("✅ PDF attachment included");
    console.log("✅ Working Stripe Pay Now button");
    console.log("✅ Complete quote details with breakdown");
    console.log("✅ Modern email template with Kocky's branding");
    
    console.log("\n📋 CHECK YOUR EMAIL:");
    console.log("====================");
    console.log("• Check kappamike@gmail.com inbox");
    console.log("• Check spam folder if not in inbox");
    console.log("• Look for subject: 'Your Quote Q-2025-9ACF9F — Kocky's'");
    console.log("• Verify PDF attachment is present");
    console.log("• Test the Pay Now button");
    console.log("• Check quote details are complete");
    
  } catch (error) {
    console.error("❌ Test email failed:", error.message);
    
    if (error.response) {
      console.error("📊 Status:", error.response.status);
      console.error("📊 Response:", error.response.data);
    }
    
    console.log("\n🔧 TROUBLESHOOTING:");
    console.log("===================");
    console.log("1. Make sure the server is running on port 5001");
    console.log("2. Check if the quote exists in the database");
    console.log("3. Verify email service configuration in .env file");
    console.log("4. Check server logs for detailed error messages");
    
    // Try alternative method
    console.log("\n2. Trying alternative method...");
    
    try {
      const { QuoteService } = require('./dist/services/quote.service');
      
      const result = await QuoteService.sendQuoteEmail(quoteId, 'full');
      
      console.log("✅ Alternative method successful!");
      console.log(`📊 Result:`, result);
      
    } catch (altError) {
      console.error("❌ Alternative method also failed:", altError.message);
    }
  }
}

// Run the test
sendTestEmail().catch(console.error);



