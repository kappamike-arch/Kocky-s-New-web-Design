#!/usr/bin/env node

/**
 * Test Fixed Email System
 * 
 * This script tests the fixed email system to ensure it delivers:
 * - PDF attachments
 * - Working Stripe Pay Now button
 * - Complete quote details
 * - Modern email template
 */

require('dotenv').config({ path: './.env' });

async function testFixedEmailSystem() {
  console.log("🧪 TESTING FIXED EMAIL SYSTEM");
  console.log("==============================\n");

  try {
    // Step 1: Test the new sendQuote method directly
    console.log("1. Testing NEW sendQuote method...");
    
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    
    // Import the new sendQuote method
    const { sendQuote } = require('./dist/controllers/quote.controller');
    
    // Create mock request and response objects
    const mockReq = {
      params: { id: quoteId },
      body: { mode: 'full' }
    };
    
    const mockRes = {
      json: (data) => {
        console.log("   📊 Response:", data);
        return mockRes;
      },
      status: (code) => {
        console.log(`   📊 Status Code: ${code}`);
        return mockRes;
      }
    };
    
    const mockNext = (error) => {
      if (error) {
        console.error("   ❌ Error:", error.message);
      }
    };
    
    console.log(`   📋 Testing with quote ID: ${quoteId}`);
    console.log(`   📋 Mode: full`);
    
    await sendQuote(mockReq, mockRes, mockNext);
    
    console.log("   ✅ NEW sendQuote method completed");
    
  } catch (error) {
    console.error("   ❌ NEW sendQuote method failed:", error.message);
    console.error("   📋 Stack:", error.stack);
    
    // Step 2: Test the QuoteService directly
    console.log("\n2. Testing QuoteService.sendQuoteEmail directly...");
    
    try {
      const { QuoteService } = require('./dist/services/quote.service');
      
      const result = await QuoteService.sendQuoteEmail(quoteId, 'full');
      
      console.log("   ✅ QuoteService.sendQuoteEmail completed");
      console.log(`   📊 Result:`, result);
      
    } catch (serviceError) {
      console.error("   ❌ QuoteService.sendQuoteEmail failed:", serviceError.message);
      
      // Step 3: Test the email composer directly
      console.log("\n3. Testing emailQuote composer directly...");
      
      try {
        const { emailQuote } = require('./dist/services/quoteEmail.composer');
        
        // Get quote data
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const quote = await prisma.quote.findUnique({
          where: { id: quoteId },
          include: {
            inquiry: true,
            quoteItems: true
          }
        });
        
        if (!quote) {
          console.log("   ❌ Quote not found");
          return;
        }
        
        console.log("   📋 Quote found:", {
          id: quote.id,
          quoteNumber: quote.quoteNumber,
          customerName: quote.inquiry?.name,
          customerEmail: quote.inquiry?.email,
          amount: quote.amount,
          itemCount: quote.quoteItems?.length || 0
        });
        
        const result = await emailQuote({
          quote: quote,
          paymentMode: 'full'
        });
        
        console.log("   ✅ emailQuote composer completed");
        console.log(`   📊 Result:`, result);
        
      } catch (composerError) {
        console.error("   ❌ emailQuote composer failed:", composerError.message);
        console.error("   📋 Stack:", composerError.stack);
      }
    }
  }
  
  // Step 4: Test API endpoint
  console.log("\n4. Testing API endpoint...");
  
  try {
    const axios = require('axios');
    
    const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send-email`, {
      email: 'kappamike@gmail.com'
    }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log("   ✅ API endpoint working");
    console.log(`   📊 Status: ${response.status}`);
    console.log(`   📊 Response:`, response.data);
    
  } catch (apiError) {
    console.error("   ❌ API endpoint failed:", apiError.response?.data || apiError.message);
  }
  
  console.log("\n🎯 EXPECTED RESULTS:");
  console.log("===================");
  console.log("✅ Email sent to kappamike@gmail.com");
  console.log("✅ PDF attachment included");
  console.log("✅ Working Stripe Pay Now button");
  console.log("✅ Complete quote details with breakdown");
  console.log("✅ Modern email template with Kocky's branding");
  
  console.log("\n📧 CHECK YOUR EMAIL:");
  console.log("====================");
  console.log("• Check kappamike@gmail.com inbox");
  console.log("• Check spam folder if not in inbox");
  console.log("• Verify all components are present");
  console.log("• Test the Pay Now button");
  console.log("• Download and verify the PDF attachment");
}

// Run the test
testFixedEmailSystem().catch(console.error);



